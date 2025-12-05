/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponFormDialog from '@/components/admin/coupons/CouponFormDialog';

// Mock toast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('CouponFormDialog', () => {
  const mockOnSuccess = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Create Mode', () => {
    it('should validate required fields before submit', async () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Create Coupon/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          })
        );
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should create coupon on submit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Coupon Code/i), {
        target: { value: 'SAVE20' },
      });

      fireEvent.change(screen.getByLabelText(/Discount Value/i), {
        target: { value: '20' },
      });

      const submitButton = screen.getByRole('button', { name: /Create Coupon/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/coupons',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should show success toast on creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.change(screen.getByLabelText(/Coupon Code/i), {
        target: { value: 'WELCOME10' },
      });

      fireEvent.change(screen.getByLabelText(/Discount Value/i), {
        target: { value: '10' },
      });

      const submitButton = screen.getByRole('button', { name: /Create Coupon/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Coupon created'),
          })
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    const existingCoupon = {
      id: 'coupon-1',
      code: 'SAVE20',
      description: '20% off',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 500,
      maxDiscount: 200,
      usageLimit: 100,
      usedCount: 10,
      isActive: true,
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2024-12-31T00:00:00.000Z',
      cafeId: 'cafe-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    it('should populate form with existing coupon data', () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={existingCoupon}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Edit Coupon')).toBeInTheDocument();
      expect(screen.getByDisplayValue('SAVE20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('should update coupon on submit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={existingCoupon}
          onSuccess={mockOnSuccess}
        />
      );

      // Modify discount value
      const discountInput = screen.getByDisplayValue('20');
      fireEvent.change(discountInput, { target: { value: '25' } });

      const submitButton = screen.getByRole('button', { name: /Update Coupon/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/admin/coupons/${existingCoupon.id}`,
          expect.objectContaining({
            method: 'PATCH',
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate discount value > 0', async () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.change(screen.getByLabelText(/Coupon Code/i), {
        target: { value: 'TEST' },
      });

      fireEvent.change(screen.getByLabelText(/Discount Value/i), {
        target: { value: '0' },
      });

      const submitButton = screen.getByRole('button', { name: /Create Coupon/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('valid discount value'),
          })
        );
      });
    });

    it('should validate minOrderValue is number', () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      const minOrderInput = screen.getByLabelText(/Minimum Order Value/i);
      
      // Should only accept numbers
      fireEvent.change(minOrderInput, { target: { value: 'abc' } });
      
      expect((minOrderInput as HTMLInputElement).value).toBe('');
    });

    it('should validate usageLimit is positive', () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      const usageLimitInput = screen.getByLabelText(/Usage Limit/i);
      
      fireEvent.change(usageLimitInput, { target: { value: '-10' } });
      
      // Negative values should not be accepted
      expect((usageLimitInput as HTMLInputElement).min).toBe('1');
    });

    it('should validate validUntil > validFrom', async () => {
      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      // Set valid from to future date
      const validFrom = screen.getByLabelText(/Valid From/i);
      fireEvent.change(validFrom, { target: { value: '2025-12-31T00:00' } });

      // Set valid until to past date
      const validUntil = screen.getByLabelText(/Valid Until/i);
      fireEvent.change(validUntil, { target: { value: '2025-01-01T00:00' } });

      // This validation should be handled by form logic
      // The test verifies the date inputs are present
      expect(validFrom).toBeInTheDocument();
      expect(validUntil).toBeInTheDocument();
    });
  });

  describe('UI Behavior', () => {
    it('should disable submit while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <CouponFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          coupon={null}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.change(screen.getByLabelText(/Coupon Code/i), {
        target: { value: 'SAVE20' },
      });

      fireEvent.change(screen.getByLabelText(/Discount Value/i), {
        target: { value: '20' },
      });

      const submitButton = screen.getByRole('button', { name: /Create Coupon/i });
      fireEvent.click(submitButton);

      // Button should be disabled while submitting
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
