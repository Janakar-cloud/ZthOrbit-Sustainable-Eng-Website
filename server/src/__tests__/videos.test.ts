import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Tag } from '../models/Tag.js';
import { signAccess } from '../utils/jwt.js';
import videosRouter from '../routes/videos.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/videos', videosRouter);
  return app;
};

const createTestUser = async (role: 'superadmin' | 'admin' | 'editor' | 'viewer' = 'viewer') => {
  const user = await User.create({
    email: `${role}@example.com`,
    passwordHash: await bcrypt.hash('Password123!', 10),
    role,
    emailVerified: true,
  });
  const accessToken = signAccess({ id: user.id, role: user.role, email: user.email });
  return { user, accessToken };
};

describe('Videos Routes', () => {
  let app: express.Application;
  let testTag: any;

  beforeEach(async () => {
    app = createTestApp();
    testTag = await Tag.create({ name: 'sustainability', kind: 'category' });
  });

  describe('GET /videos', () => {
    it('should return published videos', async () => {
      await Video.create({
        title: 'Test Video 1',
        description: 'Description 1',
        streamUrl: 'https://example.com/video1.m3u8',
        thumbnailUrl: '/thumb1.jpg',
        status: 'published',
        isLive: false,
      });

      await Video.create({
        title: 'Test Video 2',
        description: 'Description 2',
        streamUrl: 'https://example.com/video2.m3u8',
        thumbnailUrl: '/thumb2.jpg',
        status: 'published',
        isLive: false,
      });

      const response = await request(app).get('/videos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('videos');
      expect(response.body.videos).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 2);
    });

    it('should not return draft videos', async () => {
      await Video.create({
        title: 'Published Video',
        streamUrl: 'https://example.com/published.m3u8',
        status: 'published',
        isLive: false,
      });

      await Video.create({
        title: 'Draft Video',
        streamUrl: 'https://example.com/draft.m3u8',
        status: 'draft',
        isLive: false,
      });

      const response = await request(app).get('/videos');

      expect(response.status).toBe(200);
      expect(response.body.videos).toHaveLength(1);
      expect(response.body.videos[0].title).toBe('Published Video');
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 15; i++) {
        await Video.create({
          title: `Video ${i}`,
          streamUrl: `https://example.com/video${i}.m3u8`,
          status: 'published',
          isLive: false,
        });
      }

      const response = await request(app)
        .get('/videos')
        .query({ limit: 10, skip: 0 });

      expect(response.status).toBe(200);
      expect(response.body.videos).toHaveLength(10);
      expect(response.body.total).toBe(15);
    });

    it('should filter by tags', async () => {
      const video1 = await Video.create({
        title: 'Sustainability Video',
        streamUrl: 'https://example.com/sustain.m3u8',
        status: 'published',
        isLive: false,
        tags: [testTag._id],
      });

      await Video.create({
        title: 'Untagged Video',
        streamUrl: 'https://example.com/untagged.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .get('/videos')
        .query({ tags: testTag._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.videos).toHaveLength(1);
      expect(response.body.videos[0].title).toBe('Sustainability Video');
    });

    it('should sort by publishDate descending by default', async () => {
      await Video.create({
        title: 'Older Video',
        streamUrl: 'https://example.com/old.m3u8',
        status: 'published',
        isLive: false,
        publishDate: new Date('2026-01-01'),
      });

      await Video.create({
        title: 'Newer Video',
        streamUrl: 'https://example.com/new.m3u8',
        status: 'published',
        isLive: false,
        publishDate: new Date('2026-03-01'),
      });

      const response = await request(app).get('/videos');

      expect(response.status).toBe(200);
      expect(response.body.videos[0].title).toBe('Newer Video');
      expect(response.body.videos[1].title).toBe('Older Video');
    });
  });

  describe('GET /videos/:id', () => {
    it('should return a specific published video', async () => {
      const video = await Video.create({
        title: 'Specific Video',
        description: 'Detailed description',
        streamUrl: 'https://example.com/specific.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app).get(`/videos/${video._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Specific Video');
      expect(response.body).toHaveProperty('description', 'Detailed description');
    });

    it('should return 404 for non-existent video', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/videos/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 for draft video (public access)', async () => {
      const video = await Video.create({
        title: 'Draft Video',
        streamUrl: 'https://example.com/draft.m3u8',
        status: 'draft',
        isLive: false,
      });

      const response = await request(app).get(`/videos/${video._id}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /videos', () => {
    it('should allow admin to create video', async () => {
      const { accessToken } = await createTestUser('admin');

      const response = await request(app)
        .post('/videos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'New Video',
          description: 'New description',
          streamUrl: 'https://example.com/new.m3u8',
          thumbnailUrl: '/new-thumb.jpg',
          status: 'published',
          isLive: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', 'New Video');

      const video = await Video.findOne({ title: 'New Video' });
      expect(video).toBeTruthy();
    });

    it('should reject video creation from viewer', async () => {
      const { accessToken } = await createTestUser('viewer');

      const response = await request(app)
        .post('/videos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Viewer Video',
          streamUrl: 'https://example.com/viewer.m3u8',
        });

      expect(response.status).toBe(403);
    });

    it('should reject video creation without auth', async () => {
      const response = await request(app)
        .post('/videos')
        .send({
          title: 'No Auth Video',
          streamUrl: 'https://example.com/noauth.m3u8',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const { accessToken } = await createTestUser('admin');

      const response = await request(app)
        .post('/videos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '', // Empty title
          streamUrl: 'https://example.com/invalid.m3u8',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /videos/:id', () => {
    it('should allow admin to update video', async () => {
      const { accessToken } = await createTestUser('admin');
      const video = await Video.create({
        title: 'Original Title',
        streamUrl: 'https://example.com/original.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .put(`/videos/${video._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Title');

      const updated = await Video.findById(video._id);
      expect(updated?.title).toBe('Updated Title');
    });

    it('should reject update from viewer', async () => {
      const { accessToken } = await createTestUser('viewer');
      const video = await Video.create({
        title: 'Video',
        streamUrl: 'https://example.com/video.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .put(`/videos/${video._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Viewer Update' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /videos/:id', () => {
    it('should allow superadmin to delete video', async () => {
      const { accessToken } = await createTestUser('superadmin');
      const video = await Video.create({
        title: 'To Delete',
        streamUrl: 'https://example.com/delete.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .delete(`/videos/${video._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      const deleted = await Video.findById(video._id);
      expect(deleted).toBeNull();
    });

    it('should reject delete from admin', async () => {
      const { accessToken } = await createTestUser('admin');
      const video = await Video.create({
        title: 'To Delete',
        streamUrl: 'https://example.com/delete.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .delete(`/videos/${video._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
    });

    it('should reject delete without auth', async () => {
      const video = await Video.create({
        title: 'To Delete',
        streamUrl: 'https://example.com/delete.m3u8',
        status: 'published',
        isLive: false,
      });

      const response = await request(app)
        .delete(`/videos/${video._id}`);

      expect(response.status).toBe(401);
    });
  });
});
