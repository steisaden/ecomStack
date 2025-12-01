import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import { TextEncoder, TextDecoder } from 'util'

expect.extend(toHaveNoViolations)

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js server-side utilities
jest.mock('next/server', () => {
  // Mock Headers class
  class MockHeaders {
    constructor(init) {
      this.headers = new Map(Object.entries(init || {}));
    }
    get(name) {
      return this.headers.get(name.toLowerCase());
    }
  }

  // Mock Request class (NextRequest extends this)
  class MockRequest {
    constructor(input, init) {
      this.url = input;
      this.method = init.method || 'GET';
      this.headers = new MockHeaders(init.headers);
      this._body = init.body;
    }

    async text() {
      return this._body !== undefined ? String(this._body) : '';
    }

    async json() {
      const text = await this.text();
      return text ? JSON.parse(text) : {};
    }
  }

  // Mock Response class (NextResponse extends this)
  class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new MockHeaders(init?.headers);
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return String(this.body);
    }
  }

  global.Response = MockResponse;
  global.Request = MockRequest;

  return {
    NextRequest: MockRequest,
    NextResponse: {
      json: (body, init) => new MockResponse(JSON.stringify(body), { ...init, headers: { 'Content-Type': 'application/json' } }),
      text: (body, init) => new MockResponse(body, { ...init, headers: { 'Content-Type': 'text/plain' } }),
    },
  };
});

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch and related Web APIs for Jest environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
  })
);

// Mock Next.js caching functions
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn), // Just return the function itself
  revalidateTag: jest.fn((tag) => console.log(`Mock revalidateTag called for: ${tag}`)),
}));

// Mock next/navigation for usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'), // Default to root path
}));