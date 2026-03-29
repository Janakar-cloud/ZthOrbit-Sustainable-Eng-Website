# ZthOrbit Testing Guide

Complete testing documentation for both frontend and backend test suites.

## Overview

This project has comprehensive unit tests for:
- **Backend API** (Express/Node.js with Vitest & Supertest)
- **Frontend** (React with Vitest & React Testing Library)

## Backend Testing (Server)

### Test Stack
- **Test Runner**: Vitest
- **HTTP Testing**: Supertest
- **Database**: MongoDB Memory Server (in-memory for tests)
- **Coverage**: Vitest Coverage (v8 provider)

### Setup

1. Install dependencies:
```bash
cd server
npm install
```

Test dependencies:
- `vitest` - Test runner
- `supertest` - HTTP assertion library
- `mongodb-memory-server` - In-memory MongoDB for testing
- `@vitest/coverage-v8` - Code coverage

### Running Backend Tests

```bash
cd server

# Run tests in watch mode (development)
npm test

# Run tests once (CI/production)
npm run test:run

# Run with coverage report
npm run test:coverage
```

### Test Structure

```
server/
  src/
    __tests__/
      setup.ts           # Test environment setup
      auth.test.ts       # Authentication routes tests
      live.test.ts       # Live streaming config tests
      videos.test.ts     # Video CRUD tests
      podcasts.test.ts   # (To add) Podcast tests
      articles.test.ts   # (To add) Article tests
  vitest.config.ts       # Vitest configuration
```

### Backend Test Coverage

#### Auth Routes (`auth.test.ts`)
- ✅ **POST /auth/register**
  - Register new user successfully
  - Reject invalid email format
  - Reject short passwords
  - Reject duplicate email
- ✅ **POST /auth/login**
  - Login with verified email
  - Reject unverified email (403)
  - Reject wrong password (401)
  - Reject non-existent user (401)
  - Reject missing fields (400)
- ✅ **POST /auth/verify-email**
  - Verify email with correct code
  - Reject wrong verification code
- ✅ **POST /auth/request-reset**
  - Accept password reset request
  - Return success for non-existent email (security)
- ✅ **POST /auth/refresh**
  - Reject invalid refresh token
  - Reject missing token
- ✅ **POST /auth/logout**
  - Logout with valid token
  - Reject missing token

#### Live Routes (`live.test.ts`)
- ✅ **GET /live/config**
  - Return live config when exists
  - Return 404 when not configured
  - Allow public access (no auth)
- ✅ **PUT /live/config**
  - Allow admin to update config
  - Allow superadmin to update config
  - Reject viewer updates (403)
  - Reject unauthenticated updates (401)
  - Validate required fields
  - Create config if none exists

#### Video Routes (`videos.test.ts`)
- ✅ **GET /videos**
  - Return published videos
  - Exclude draft videos
  - Support pagination (limit/skip)
  - Filter by tags
  - Sort by publishDate descending
- ✅ **GET /videos/:id**
  - Return specific published video
  - Return 404 for non-existent video
  - Return 404 for draft video (public)
- ✅ **POST /videos**
  - Allow admin to create video
  - Reject viewer creation (403)
  - Reject unauthenticated creation (401)
  - Validate required fields
- ✅ **PUT /videos/:id**
  - Allow admin to update video
  - Reject viewer updates (403)
- ✅ **DELETE /videos/:id**
  - Allow superadmin to delete (204)
  - Reject admin delete (403)
  - Reject unauthenticated delete (401)

### Test Utilities

Each test file includes helper functions:

```typescript
// Create test Express app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/route', router);
  return app;
};

// Create authenticated test user
const createTestUser = async (role: 'superadmin' | 'admin' | 'editor' | 'viewer') => {
  const user = await User.create({
    email: `${role}@example.com`,
    passwordHash: await bcrypt.hash('Password123!', 10),
    role,
    emailVerified: true,
  });
  const accessToken = signAccess({ id: user.id, role: user.role, email: user.email });
  return { user, accessToken };
};
```

### Environment

Tests use in-memory MongoDB by default. Override with `MONGODB_URI` env var if needed.

Mock environment is set in `src/__tests__/setup.ts`:
- `NODE_ENV=test`
- `JWT_SECRET` and `JWT_REFRESH_SECRET` for testing
- S3 credentials (mocked)
- Port 4001 (avoids conflict with dev server)

---

## Frontend Testing (Root)

### Test Stack
- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **DOM Matchers**: @testing-library/jest-dom

### Setup

1. Install dependencies:
```bash
npm install
```

Test dependencies:
- `vitest` - Test runner
- `@vitejs/plugin-react` - React support
- `jsdom` - DOM environment
- `@testing-library/react` - React component testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom matchers

### Running Frontend Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run with UI (interactive)
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Structure

```
src/
  __tests__/
    App.test.tsx         # Main app navigation tests
    HomePage.test.tsx    # Homepage component tests
    AboutUs.test.tsx     # About page tests
    LiveTV.test.tsx      # Live TV page tests
  test/
    setup.ts             # Test environment setup
vitest.config.ts         # Vitest configuration
```

### Frontend Test Coverage

#### App Component (`App.test.tsx`)
- ✅ Renders HomePage by default
- ✅ Navigates to About Us on nav click
- ✅ Navigates to Podcasts and back via logo

#### HomePage (`HomePage.test.tsx`)
- ✅ Renders hero content
- ✅ Renders Our Work cards with descriptions
- ✅ Shows Live TV, Podcasts, Articles sections
- ✅ Calls onNavigate on work card click

#### About Us (`AboutUs.test.tsx`)
- Tests for About Us page component

#### Live TV (`LiveTV.test.tsx`)
- Tests for Live TV streaming component

### Test Patterns

All frontend tests wrap components in `AppProvider`:

```typescript
import { AppProvider } from '../context/AppContext'

const renderComponent = () =>
  render(
    <AppProvider>
      <YourComponent />
    </AppProvider>
  )
```

User interactions use `@testing-library/user-event`:

```typescript
import userEvent from '@testing-library/user-event'

it('handles button click', async () => {
  const user = userEvent.setup()
  render(<Component />)
  
  await user.click(screen.getByText('Click Me'))
  
  expect(/* assertion */).toBeTruthy()
})
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: ./server
        run: npm ci
      - name: Run tests
        working-directory: ./server
        run: npm run test:run
      - name: Generate coverage
        working-directory: ./server
        run: npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:run
      - name: Generate coverage
        run: npm run test:coverage
```

---

## Adding New Tests

### Backend API Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import yourRouter from '../routes/your-route.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/your-route', yourRouter);
  return app;
};

describe('Your Route', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /your-route', () => {
    it('should return data', async () => {
      const response = await request(app).get('/your-route');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });
});
```

### Frontend Component Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../context/AppContext'
import YourComponent from '../components/YourComponent'

describe('YourComponent', () => {
  const renderComponent = () =>
    render(
      <AppProvider>
        <YourComponent />
      </AppProvider>
    )

  it('renders correctly', () => {
    renderComponent()
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    renderComponent()
    
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

---

## Test Best Practices

### Backend
1. ✅ Use `beforeEach` to reset app state
2. ✅ Test both success and error cases
3. ✅ Verify HTTP status codes
4. ✅ Check response body structure
5. ✅ Test authentication and authorization
6. ✅ Validate input validation
7. ✅ Clean up database after each test (handled by setup.ts)

### Frontend
1. ✅ Wrap components in required providers
2. ✅ Use semantic queries (`getByRole`, `getByLabelText`)
3. ✅ Simulate real user interactions
4. ✅ Test accessibility
5. ✅ Avoid testing implementation details
6. ✅ Use `waitFor` for async operations

---

## Debugging Tests

### Backend

```bash
# Run specific test file
npm test -- src/__tests__/auth.test.ts

# Run tests matching pattern
npm test -- --grep="login"

# Run with verbose output
npm test -- --reporter=verbose

# Debug in VS Code
# Add breakpoint and run "JavaScript Debug Terminal"
```

### Frontend

```bash
# Run specific test file
npm test -- src/__tests__/App.test.tsx

# Run with UI (interactive debugging)
npm run test:ui

# Run one test at a time
npm test -- --run --reporter=verbose
```

---

## Coverage Goals

- **Backend**: Aim for 80%+ coverage on routes and business logic
- **Frontend**: Aim for 70%+ coverage on components

Generate coverage reports:
```bash
# Backend
cd server && npm run test:coverage

# Frontend
npm run test:coverage
```

Coverage reports are generated in:
- Backend: `server/coverage/`
- Frontend: `coverage/`

Open `coverage/index.html` in a browser to view detailed reports.

---

## Known Issues & Limitations

### Backend
- MongoDB Memory Server can be slow on first run (downloads binary)
- S3 operations are mocked (no actual file uploads in tests)
- Email sending is not tested (SMTP mocked)

### Frontend
- HLS video playback not fully tested (requires browser APIs)
- WebSocket connections not covered
- Browser-specific features may need additional mocking

---

## Next Steps

### Backend Tests to Add
- [ ] Podcasts CRUD routes
- [ ] Articles CRUD routes
- [ ] Case Stories routes
- [ ] Tags management
- [ ] Media uploads (S3 integration)
- [ ] Admin dashboard routes
- [ ] Search functionality
- [ ] Notification system

### Frontend Tests to Add
- [ ] Login/Signup forms
- [ ] Video player component
- [ ] Podcast player component
- [ ] Article reader component
- [ ] Admin dashboard pages
- [ ] Navigation and routing
- [ ] Form validation
- [ ] Error boundaries

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Last Updated**: 2026-03-26  
**Maintainer**: Development Team
