import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import authRouter from '../routes/auth.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
};

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Verification code sent');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user?.name).toBe('Test User');
      expect(user?.role).toBe('viewer');
      expect(user?.emailVerified).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate email registration', async () => {
      await User.create({
        email: 'existing@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'viewer',
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with verified email', async () => {
      const password = 'Password123!';
      await User.create({
        email: 'verified@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'admin',
        emailVerified: true,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'verified@example.com',
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('should reject login with unverified email', async () => {
      const password = 'Password123!';
      await User.create({
        email: 'unverified@example.com',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'viewer',
        emailVerified: false,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Email not verified');
    });

    it('should reject login with wrong password', async () => {
      await User.create({
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('CorrectPassword123!', 10),
        role: 'viewer',
        emailVerified: true,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should verify email with correct code', async () => {
      const user = await User.create({
        email: 'toverify@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'viewer',
        emailVerified: false,
      });

      // Manually create verification code
      const { EmailVerification } = await import('../models/EmailVerification.js');
      const verificationCode = '123456';
      await EmailVerification.create({
        userId: user._id,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      });

      const response = await request(app)
        .post('/auth/verify-email')
        .send({
          email: 'toverify@example.com',
          code: verificationCode,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.emailVerified).toBe(true);
    });

    it('should reject verification with wrong code', async () => {
      const user = await User.create({
        email: 'wrongcode@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'viewer',
        emailVerified: false,
      });

      const { EmailVerification } = await import('../models/EmailVerification.js');
      await EmailVerification.create({
        userId: user._id,
        code: '123456',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      });

      const response = await request(app)
        .post('/auth/verify-email')
        .send({
          email: 'wrongcode@example.com',
          code: '999999',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid or expired');
    });
  });

  describe('POST /auth/request-reset', () => {
    it('should accept password reset request for existing user', async () => {
      await User.create({
        email: 'reset@example.com',
        passwordHash: await bcrypt.hash('OldPassword123!', 10),
        role: 'viewer',
        emailVerified: true,
        name: 'Reset User',
      });

      const response = await request(app)
        .post('/auth/request-reset')
        .send({
          email: 'reset@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/auth/request-reset')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid refresh token');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing refreshToken');
    });
  });

  describe('POST /auth/logout', () => {
    it('should accept logout with valid refresh token', async () => {
      const user = await User.create({
        email: 'logout@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        role: 'viewer',
        emailVerified: true,
      });

      const { RefreshToken } = await import('../models/RefreshToken.js');
      const token = 'valid-refresh-token-abc123';
      await RefreshToken.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      });

      const response = await request(app)
        .post('/auth/logout')
        .send({
          refreshToken: token,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const revokedToken = await RefreshToken.findOne({ token });
      expect(revokedToken?.revoked).toBe(true);
    });

    it('should reject logout with missing token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing refreshToken');
    });
  });
});
