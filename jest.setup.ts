// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env = {
  ...process.env,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db?schema=public',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret-key-for-jest-testing',
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-api-key',
  CLOUDINARY_API_SECRET: 'test-api-secret',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cafe: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    menuCategory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    menuItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    settings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

// Mock Pusher
jest.mock('@/lib/pusher-server', () => ({
  pusherServer: null,
  isPusherConfigured: false,
  triggerOrderCreated: jest.fn(),
  triggerOrderStatusUpdated: jest.fn(),
}))

jest.mock('@/lib/pusher-client', () => ({
  pusherClient: null,
}))

// Mock Cloudinary
jest.mock('@/lib/cloudinary', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
  getOptimizedImageUrl: jest.fn((url: string) => url),
}))

// Helper function to create mock menu item
export const createMockMenuItem = (overrides = {}) => ({
  id: 'item-1',
  cafeId: 'cafe-1',
  categoryId: 'category-1',
  name: 'Test Item',
  description: 'Test Description',
  price: 100,
  image: null,
  isAvailable: true,
  isVeg: true,
  customizations: null,
  order: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Helper function to create mock cart item
export const createMockCartItem = (overrides = {}) => ({
  menuItemId: 'item-1',
  name: 'Test Item',
  price: 100,
  quantity: 1,
  image: undefined,
  isVeg: true,
  customizations: undefined,
  ...overrides,
})

// Helper function to create mock order
export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  cafeId: 'cafe-1',
  customerId: 'customer-1',
  orderNumber: 'ORD-123456',
  customerName: 'John Doe',
  customerPhone: '1234567890',
  orderType: 'DINE_IN' as const,
  tableNumber: '10',
  deliveryAddress: null,
  items: [],
  subtotal: 100,
  tax: 18,
  deliveryCharge: 0,
  discount: 0,
  total: 118,
  paymentMethod: 'CASH' as const,
  paymentStatus: 'PAID' as const,
  paymentReferenceId: null,
  status: 'PENDING' as const,
  specialInstructions: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})
