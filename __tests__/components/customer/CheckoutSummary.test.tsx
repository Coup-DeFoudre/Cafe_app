/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutSummary from '@/components/customer/CheckoutSummary';
import { CartProvider } from '@/contexts/CartContext';
import { OrderType } from '@/types';

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock Cart Context with test data
const mockCartItems = [
  {
    menuItemId: 'item-1',
    name: 'Coffee',
    price: 100,
    quantity: 2,
    isVeg: true,
  },
  {
    menuItemId: 'item-2',
    name: 'Sandwich',
    price: 150,
    quantity: 1,
    isVeg: true,
  },
];

jest.mock('@/contexts/CartContext', () => ({
  ...jest.requireActual('@/contexts/CartContext'),
  useCart: () => ({
    items: mockCartItems,
    itemCount: 3,
    subtotal: 350, // (100*2) + (150*1)
  }),
}));

const mockCafeSettings = {
  taxEnabled: true,
  taxRate: 18,
  deliveryCharge: 40,
};

describe('CheckoutSummary', () => {
  const mockOnCouponApply = jest.fn();
  const mockOnCouponRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Rendering', () => {
    it('should render order summary with items', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText(/3 items/i)).toBeInTheDocument();
    });

    it('should show coupon input field', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      expect(screen.getByPlaceholderText('Enter coupon code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    it('should display subtotal, tax, delivery, total', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DELIVERY}
        />
      );

      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText(/₹350/)).toBeInTheDocument();
      expect(screen.getByText(/Tax/)).toBeInTheDocument();
      expect(screen.getByText('Delivery')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should show applied coupon if exists', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE20',
        description: '20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        discountAmount: 70,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      expect(screen.getByText('SAVE20')).toBeInTheDocument();
      expect(screen.getByText('20% off')).toBeInTheDocument();
    });

    it('should display discount amount when coupon applied', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'FLAT50',
        description: 'Flat ₹50 off',
        discountType: 'FIXED',
        discountValue: 50,
        discountAmount: 50,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      expect(screen.getByText(/Discount/)).toBeInTheDocument();
      expect(screen.getByText(/-₹50/)).toBeInTheDocument();
    });
  });

  describe('Coupon Application', () => {
    it('should enable Apply button when code entered', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      const applyButton = screen.getByRole('button', { name: /apply/i });

      expect(applyButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'SAVE20' } });

      expect(applyButton).not.toBeDisabled();
    });

    it('should disable Apply button when code empty', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const applyButton = screen.getByRole('button', { name: /apply/i });

      expect(applyButton).toBeDisabled();
    });

    it('should show loading state during validation', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      // Should show loading state
      await waitFor(() => {
        expect(applyButton).toBeDisabled();
      });
    });

    it('should call API with correct payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: { id: 'c1', code: 'SAVE20' },
          discountAmount: 70,
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          onCouponApply={mockOnCouponApply}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/coupons/validate',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('SAVE20'),
          })
        );
      });
    });

    it('should apply coupon on successful validation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: {
            id: 'c1',
            code: 'SAVE20',
            description: '20% off',
            discountType: 'PERCENTAGE',
            discountValue: 20,
          },
          discountAmount: 70,
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          onCouponApply={mockOnCouponApply}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnCouponApply).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'SAVE20',
            discountAmount: 70,
          })
        );
      });
    });

    it('should show success toast with savings amount', async () => {
      const mockToast = jest.fn();
      jest.spyOn(require('@/hooks/use-toast'), 'useToast').mockReturnValue({
        toast: mockToast,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: { id: 'c1', code: 'SAVE20' },
          discountAmount: 70,
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Coupon applied'),
          })
        );
      });
    });

    it('should clear input after successful application', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: { id: 'c1', code: 'SAVE20' },
          discountAmount: 70,
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should call onCouponApply callback with coupon data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: true,
          coupon: {
            id: 'c1',
            code: 'WELCOME10',
            description: 'Welcome offer',
            discountType: 'PERCENTAGE',
            discountValue: 10,
          },
          discountAmount: 35,
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          onCouponApply={mockOnCouponApply}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'WELCOME10' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnCouponApply).toHaveBeenCalledWith({
          id: 'c1',
          code: 'WELCOME10',
          description: 'Welcome offer',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          discountAmount: 35,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid coupon code', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: false,
          error: 'Invalid coupon code',
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'INVALID' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid coupon code')).toBeInTheDocument();
      });
    });

    it('should show error when submitting empty code', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: '   ' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      expect(screen.getByText(/Please enter a coupon code/i)).toBeInTheDocument();
    });

    it('should handle API failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to validate coupon/i)
        ).toBeInTheDocument();
      });
    });

    it('should display server error messages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          valid: false,
          error: 'This coupon has expired',
        }),
      });

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      const input = screen.getByPlaceholderText('Enter coupon code');
      fireEvent.change(input, { target: { value: 'EXPIRED' } });

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('This coupon has expired')).toBeInTheDocument();
      });
    });
  });

  describe('Coupon Removal', () => {
    it('should show remove button when coupon applied', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE20',
        description: '20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        discountAmount: 70,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('should remove coupon on button click', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE20',
        description: '20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        discountAmount: 70,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
          onCouponRemove={mockOnCouponRemove}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(mockOnCouponRemove).toHaveBeenCalled();
    });

    it('should recalculate totals after removal', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE20',
        description: '20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        discountAmount: 70,
      };

      const { rerender } = render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      // Discount should be shown
      expect(screen.getByText(/-₹70/)).toBeInTheDocument();

      // Remove coupon
      rerender(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={null}
        />
      );

      // Discount should not be shown
      expect(screen.queryByText(/-₹70/)).not.toBeInTheDocument();
    });
  });

  describe('Discount Calculations', () => {
    it('should calculate subtotal from cart items', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
        />
      );

      // (100*2) + (150*1) = 350
      expect(screen.getByText('₹350.00')).toBeInTheDocument();
    });

    it('should subtract discount from subtotal', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE50',
        description: 'Flat ₹50 off',
        discountType: 'FIXED',
        discountValue: 50,
        discountAmount: 50,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      // Subtotal: 350
      // Discount: -50
      // Discounted Subtotal: 300
      expect(screen.getByText(/-₹50/)).toBeInTheDocument();
    });

    it('should apply tax on discounted amount', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE100',
        description: 'Flat ₹100 off',
        discountType: 'FIXED',
        discountValue: 100,
        discountAmount: 100,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      // Subtotal: 350
      // Discount: -100
      // Discounted: 250
      // Tax (18% of 250): 45
      // Tax should be calculated on discounted amount
      expect(screen.getByText('₹45.00')).toBeInTheDocument();
    });

    it('should add delivery charge if applicable', () => {
      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DELIVERY}
        />
      );

      expect(screen.getByText('Delivery Charge')).toBeInTheDocument();
      expect(screen.getByText('₹40.00')).toBeInTheDocument();
    });

    it('should calculate final total correctly', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE50',
        description: 'Flat ₹50 off',
        discountType: 'FIXED',
        discountValue: 50,
        discountAmount: 50,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DELIVERY}
          appliedCoupon={appliedCoupon}
        />
      );

      // Subtotal: 350
      // Discount: -50
      // Discounted: 300
      // Tax (18% of 300): 54
      // Delivery: 40
      // Total: 300 + 54 + 40 = 394
      expect(screen.getByText('₹394.00')).toBeInTheDocument();
    });

    it('should display percentage discount info', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'SAVE20',
        description: '20% off',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        discountAmount: 70,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      expect(screen.getByText('20% off')).toBeInTheDocument();
    });

    it('should display fixed discount info', () => {
      const appliedCoupon = {
        id: 'c1',
        code: 'FLAT100',
        description: 'Flat ₹100 off',
        discountType: 'FIXED',
        discountValue: 100,
        discountAmount: 100,
      };

      render(
        <CheckoutSummary
          cafeSettings={mockCafeSettings}
          orderType={OrderType.DINE_IN}
          appliedCoupon={appliedCoupon}
        />
      );

      expect(screen.getByText(/₹100\.00 off/)).toBeInTheDocument();
    });
  });
});
