# Testing Documentation

## Overview

Comprehensive testing infrastructure for the Cafe App using **Jest** and **React Testing Library** with TypeScript + Next.js 14.

## Test Statistics

- **Total Tests:** 156 (100% passing ✅)
- **Test Suites:** 4
- **Coverage Target:** 70%+
- **Framework:** Jest 30.x + React Testing Library

## Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# CI mode
npm run test:ci

# Watch mode
npm run test:watch
```

## Test Suites

### 1. Order Utilities (`__tests__/lib/utils/order.test.ts`)
**40 tests** covering:
- `calculateSubtotal()` - Cart total calculations
- `calculateTax()` - Tax computations
- `calculateTotal()` - Final order totals
- `generateOrderNumber()` - Unique order IDs
- `formatOrderSummary()` - Order formatting

### 2. Checkout Validation (`__tests__/lib/validations/checkout.test.ts`)
**37 tests** covering:
- DINE_IN order validation
- DELIVERY order validation  
- Customer name/phone validation
- Special instructions handling
- International phone numbers

### 3. Cart Context (`__tests__/contexts/CartContext.test.tsx`)
**28 tests** covering:
- Cart initialization & localStorage
- Add/remove/update item operations
- Quantity management
- Cart state (open/close)
- Subtotal calculations

### 4. Utility Functions (`__tests__/lib/utils/utils.test.ts`)
**51 tests** covering:
- `formatCurrency()` - Currency formatting (INR, USD, EUR)
- `formatDate()` - Date/time formatting
- `slugify()` - URL-friendly slugs
- `getRelativeTime()` - Relative time strings
- `generateOrderNumber()` - Order number generation
- `cn()` - className utility (Tailwind merge)

## Project Structure

```
Cafe_app/
├── __tests__/
│   ├── lib/
│   │   ├── utils/
│   │   │   ├── order.test.ts      (40 tests)
│   │   │   └── utils.test.ts      (51 tests)
│   │   └── validations/
│   │       └── checkout.test.ts   (37 tests)
│   └── contexts/
│       └── CartContext.test.tsx   (28 tests)
├── jest.config.ts
├── jest.setup.ts
└── TESTING.md
```

## Configuration

### jest.config.ts
```typescript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70 }
  }
}
```

### jest.setup.ts
Includes mocks for:
- LocalStorage
- Next.js Router
- Prisma Client
- Pusher
- Cloudinary
- IntersectionObserver

## GitHub Actions CI

Automated testing on:
- Push to `master`/`develop`
- Pull requests

**Pipeline:**
1. ✅ Type checking
2. ✅ Linting
3. ✅ Test execution (Node 18.x & 20.x)
4. ✅ Coverage upload

## Example Test

```typescript
describe('calculateSubtotal', () => {
  it('should calculate total for multiple items', () => {
    const items: CartItem[] = [
      { menuItemId: '1', price: 100, quantity: 2 },
      { menuItemId: '2', price: 50, quantity: 3 }
    ]
    expect(calculateSubtotal(items)).toBe(350) // (100*2) + (50*3)
  })
})
```

## Coverage Report

```bash
npm run test:coverage
```

View at: `coverage/lcov-report/index.html`

## Troubleshooting

**Module errors:** Check `moduleNameMapper` matches `tsconfig.json` paths  
**localStorage undefined:** Already mocked in `jest.setup.ts`  
**Next.js component errors:** Use `next/jest` with `jsdom` environment  
**Prisma errors:** Globally mocked in setup file

## Future Enhancements

- [ ] E2E tests (Playwright)
- [ ] Visual regression testing
- [ ] Component screenshot tests
- [ ] Accessibility tests (axe-core)
- [ ] API integration tests

## Resources

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**Last Updated:** December 4, 2025  
**Test Pass Rate:** 100% (156/156)
