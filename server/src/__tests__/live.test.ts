import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { LiveConfig } from '../models/LiveConfig.js';
import { signAccess } from '../utils/jwt.js';
import liveRouter from '../routes/live.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/live', liveRouter);
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

describe('Live Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /live/config', () => {
    it('should return live config when it exists', async () => {
      await LiveConfig.create({
        streamUrl: 'https://example.com/stream.m3u8',
        title: 'Test Live Stream',
        description: 'Test description',
        updatedBy: 'admin@example.com',
      });

      const response = await request(app).get('/live/config');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('streamUrl', 'https://example.com/stream.m3u8');
      expect(response.body).toHaveProperty('title', 'Test Live Stream');
      expect(response.body).toHaveProperty('description', 'Test description');
    });

    it('should return 404 when no live config exists', async () => {
      const response = await request(app).get('/live/config');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow public access (no auth required)', async () => {
      await LiveConfig.create({
        streamUrl: 'https://example.com/stream.m3u8',
        title: 'Public Stream',
        description: 'Public description',
        updatedBy: 'admin@example.com',
      });

      const response = await request(app)
        .get('/live/config')
        .set('Authorization', ''); // No token

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /live/config', () => {
    it('should allow admin to update live config', async () => {
      const { accessToken } = await createTestUser('admin');

      const response = await request(app)
        .put('/live/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          streamUrl: 'https://newstream.example.com/live.m3u8',
          title: 'Updated Live Stream',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('streamUrl', 'https://newstream.example.com/live.m3u8');
      expect(response.body).toHaveProperty('title', 'Updated Live Stream');

      const config = await LiveConfig.findOne({});
      expect(config?.streamUrl).toBe('https://newstream.example.com/live.m3u8');
    });

    it('should allow superadmin to update live config', async () => {
      const { accessToken } = await createTestUser('superadmin');

      const response = await request(app)
        .put('/live/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          streamUrl: 'https://superadmin.example.com/live.m3u8',
          title: 'Superadmin Stream',
          description: 'Superadmin description',
        });

      expect(response.status).toBe(200);
    });

    it('should reject update from viewer', async () => {
      const { accessToken } = await createTestUser('viewer');

      const response = await request(app)
        .put('/live/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          streamUrl: 'https://viewer.example.com/live.m3u8',
          title: 'Viewer Stream',
        });

      expect(response.status).toBe(403);
    });

    it('should reject update without auth token', async () => {
      const response = await request(app)
        .put('/live/config')
        .send({
          streamUrl: 'https://noauth.example.com/live.m3u8',
          title: 'No Auth Stream',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const { accessToken } = await createTestUser('admin');

      const response = await request(app)
        .put('/live/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          streamUrl: '', // Empty stream URL
        });

      expect(response.status).toBe(400);
    });

    it('should create config if none exists', async () => {
      const { accessToken } = await createTestUser('admin');

      const response = await request(app)
        .put('/live/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          streamUrl: 'https://first.example.com/live.m3u8',
          title: 'First Stream',
          description: 'First description',
        });

      expect(response.status).toBe(200);

      const configs = await LiveConfig.find({});
      expect(configs).toHaveLength(1);
      expect(configs[0].streamUrl).toBe('https://first.example.com/live.m3u8');
    });
  });
});
