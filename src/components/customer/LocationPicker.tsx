'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [MapComponent, setMapComponent] = useState<any>(null);

  // Set initial position
  const initialPosition = initialLat && initialLng 
    ? { lat: initialLat, lng: initialLng }
    : currentLocation || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi, India

  useEffect(() => {
    setIsClient(true);
    // Dynamically import the map component only on client
    import('./MapLocationPicker').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        onLocationSelect(location.lat, location.lng);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please click on the map to select your location.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,  // Use GPS for more accurate location
        timeout: 10000,            // Wait up to 10 seconds
        maximumAge: 0              // Don't use cached location
      }
    );
  };

  const renderMap = () => {
    if (!isClient || !MapComponent) {
      return (
        <Card className="p-6 bg-muted/50">
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </Card>
      );
    }

    const Map = MapComponent;
    return (
      <Map
        initialPosition={initialPosition}
        onLocationSelect={onLocationSelect}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Delivery Location</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
      </div>

      {renderMap()}

      <p className="text-xs text-muted-foreground">
        📍 Click anywhere on the map to pin your exact delivery location. You can zoom in and adjust the marker for precise placement.
      </p>
    </div>
  );
}
