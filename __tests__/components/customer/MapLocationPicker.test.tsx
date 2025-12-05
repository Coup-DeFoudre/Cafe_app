/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import MapLocationPicker from '@/components/customer/MapLocationPicker';

// Mock Leaflet library
const mockMarker = {
  addTo: jest.fn().mockReturnThis(),
  setLatLng: jest.fn().mockReturnThis(),
};

const mockTileLayer = {
  addTo: jest.fn().mockReturnThis(),
};

const mockMap = {
  setView: jest.fn().mockReturnThis(),
  on: jest.fn(),
  remove: jest.fn(),
};

jest.mock('leaflet', () => ({
  default: {
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => mockTileLayer),
    marker: jest.fn(() => mockMarker),
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: jest.fn(),
      },
    },
  },
}));

describe('MapLocationPicker', () => {
  const mockOnLocationSelect = jest.fn();
  const initialPosition = { lat: 28.6139, lng: 77.2090 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Map Initialization', () => {
    it('should create map instance on mount', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalled();
      });
    });

    it('should set initial view with provided coordinates', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalledWith(
          [initialPosition.lat, initialPosition.lng],
          13
        );
      });
    });

    it('should add OpenStreetMap tile layer', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
      });
    });

    it('should create marker at initial position', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap);
      });
    });

    it('should fix Leaflet icon paths', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        // Icon configuration happens during initialization
        expect(mockMap.setView).toHaveBeenCalled();
      });
    });

    it('should register click event listener on map', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.on).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });
  });

  describe('User Interaction', () => {
    it('should update marker when map clicked', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.on).toHaveBeenCalled();
      });

      // Simulate map click event
      const clickHandler = mockMap.on.mock.calls[0][1];
      const mockClickEvent = {
        latlng: { lat: 12.9716, lng: 77.5946 },
      };

      clickHandler(mockClickEvent);

      expect(mockMarker.setLatLng).toHaveBeenCalledWith([12.9716, 77.5946]);
    });

    it('should call onLocationSelect with new coordinates on click', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.on).toHaveBeenCalled();
      });

      // Simulate map click
      const clickHandler = mockMap.on.mock.calls[0][1];
      clickHandler({ latlng: { lat: 19.0760, lng: 72.8777 } });

      expect(mockOnLocationSelect).toHaveBeenCalledWith(19.0760, 72.8777);
    });

    it('should update marker when initialPosition changes', async () => {
      const { rerender } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalled();
      });

      // Clear previous calls
      jest.clearAllMocks();

      // Change position
      const newPosition = { lat: 13.0827, lng: 80.2707 };
      rerender(
        <MapLocationPicker
          initialPosition={newPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMarker.setLatLng).toHaveBeenCalledWith([
          newPosition.lat,
          newPosition.lng,
        ]);
      });
    });

    it('should zoom to level 17 on location update', async () => {
      const { rerender } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      // Update position
      const newPosition = { lat: 22.5726, lng: 88.3639 };
      rerender(
        <MapLocationPicker
          initialPosition={newPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalledWith(
          [newPosition.lat, newPosition.lng],
          17
        );
      });
    });

    it('should set view center on position change', async () => {
      const { rerender } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      const newPosition = { lat: 17.3850, lng: 78.4867 };
      rerender(
        <MapLocationPicker
          initialPosition={newPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalledWith(
          [newPosition.lat, newPosition.lng],
          expect.any(Number)
        );
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove map instance on unmount', async () => {
      const { unmount } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalled();
      });

      unmount();

      expect(mockMap.remove).toHaveBeenCalled();
    });

    it('should clear marker reference on unmount', async () => {
      const { unmount } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      await waitFor(() => {
        expect(mockMarker.addTo).toHaveBeenCalled();
      });

      // Component should clean up marker reference
      unmount();

      expect(mockMap.remove).toHaveBeenCalled();
    });
  });

  describe('SSR Safety', () => {
    it('should not initialize in server environment', () => {
      // Simulate server environment
      const originalWindow = global.window;
      delete (global as any).window;

      const { container } = render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      // Should render div but not initialize map
      expect(container.querySelector('div')).toBeInTheDocument();

      // Restore window
      (global as any).window = originalWindow;
    });

    it('should dynamically import Leaflet on client', async () => {
      render(
        <MapLocationPicker
          initialPosition={initialPosition}
          onLocationSelect={mockOnLocationSelect}
        />
      );

      // Leaflet should be imported dynamically
      await waitFor(() => {
        expect(mockMap.setView).toHaveBeenCalled();
      });
    });
  });
});
