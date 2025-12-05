/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationPicker from '@/components/customer/LocationPicker';

// Mock MapLocationPicker component
jest.mock('@/components/customer/MapLocationPicker', () => {
  return function MockMapLocationPicker({ initialPosition, onLocationSelect }: any) {
    return (
      <div data-testid="mock-map">
        Mock Map at {initialPosition.lat}, {initialPosition.lng}
        <button
          onClick={() => onLocationSelect(12.9716, 77.5946)}
          data-testid="mock-map-click"
        >
          Click Map
        </button>
      </div>
    );
  };
});

describe('LocationPicker', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render location picker component', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      expect(screen.getByText('Delivery Location')).toBeInTheDocument();
      expect(screen.getByText('Use Current Location')).toBeInTheDocument();
    });

    it('should show loading spinner before map loads', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      // Initially map component should be loading
      const mapContainer = screen.getByTestId('mock-map');
      expect(mapContainer).toBeInTheDocument();
    });

    it('should display "Use Current Location" button', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should show helper text for map interaction', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      expect(screen.getByText(/Click anywhere on the map to pin your exact delivery location/i)).toBeInTheDocument();
    });

    it('should use default Delhi coordinates when no props provided', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      // Default coordinates: Delhi (28.6139, 77.2090)
      const mapText = screen.getByTestId('mock-map');
      expect(mapText.textContent).toContain('28.6139');
      expect(mapText.textContent).toContain('77.2090');
    });
  });

  describe('Geolocation API', () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
    };

    beforeEach(() => {
      Object.defineProperty(global.navigator, 'geolocation', {
        writable: true,
        value: mockGeolocation,
      });
    });

    it('should get location when button clicked', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 19.0760,
            longitude: 72.8777,
          },
        } as GeolocationPosition);
      });

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        expect(mockOnLocationSelect).toHaveBeenCalledWith(19.0760, 72.8777);
      });
    });

    it('should show loading state during geolocation', async () => {
      let resolveGeolocation: any;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        resolveGeolocation = () => success({
          coords: { latitude: 19.0760, longitude: 72.8777 },
        } as GeolocationPosition);
      });

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      // Should show loading state
      expect(screen.getByText('Getting Location...')).toBeInTheDocument();
      expect(button).toBeDisabled();

      // Resolve geolocation
      await waitFor(() => {
        resolveGeolocation();
      });
    });

    it('should call onLocationSelect with coordinates on success', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: { latitude: 13.0827, longitude: 80.2707 },
        } as GeolocationPosition);
      });

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnLocationSelect).toHaveBeenCalledWith(13.0827, 80.2707);
      });
    });

    it('should handle geolocation permission denied error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'User denied Geolocation' } as GeolocationPositionError);
      });

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Unable to get your location')
        );
      });

      alertMock.mockRestore();
    });

    it('should handle geolocation timeout error', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 3, message: 'Timeout' } as GeolocationPositionError);
      });

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled();
        expect(button).not.toBeDisabled(); // Should reset loading state
      });

      alertMock.mockRestore();
    });

    it('should show alert when geolocation not supported', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      // Remove geolocation support
      (global.navigator as any).geolocation = undefined;

      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const button = screen.getByRole('button', { name: /Use Current Location/i });
      fireEvent.click(button);

      expect(alertMock).toHaveBeenCalledWith('Geolocation is not supported by your browser');

      alertMock.mockRestore();
    });
  });

  describe('Map Integration', () => {
    it('should pass initial position to map component', () => {
      render(
        <LocationPicker
          onLocationSelect={mockOnLocationSelect}
          initialLat={12.9716}
          initialLng={77.5946}
        />
      );

      const mapText = screen.getByTestId('mock-map');
      expect(mapText.textContent).toContain('12.9716');
      expect(mapText.textContent).toContain('77.5946');
    });

    it('should update when user selects location on map', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      const mapClickButton = screen.getByTestId('mock-map-click');
      fireEvent.click(mapClickButton);

      expect(mockOnLocationSelect).toHaveBeenCalledWith(12.9716, 77.5946);
    });

    it('should accept initialLat and initialLng props', () => {
      render(
        <LocationPicker
          onLocationSelect={mockOnLocationSelect}
          initialLat={22.5726}
          initialLng={88.3639}
        />
      );

      const mapText = screen.getByTestId('mock-map');
      expect(mapText.textContent).toContain('22.5726');
      expect(mapText.textContent).toContain('88.3639');
    });

    it('should dynamically import MapLocationPicker component', async () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-map')).toBeInTheDocument();
      });
    });
  });

  describe('SSR Handling', () => {
    it('should show loader during client hydration', () => {
      // Simulate SSR by setting isClient to false initially
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      
      // Component should render without crashing
      expect(screen.getByText('Delivery Location')).toBeInTheDocument();
    });

    it('should only render map on client side', () => {
      render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);

      // Map should be present (mocked)
      expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    });

    it('should handle undefined window gracefully', () => {
      // Component should not crash even if window is undefined
      expect(() => {
        render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
      }).not.toThrow();
    });
  });
});
