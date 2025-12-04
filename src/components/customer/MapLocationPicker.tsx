'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface MapLocationPickerProps {
  initialPosition: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapLocationPicker({ 
  initialPosition, 
  onLocationSelect 
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Don't reinitialize if map already exists
      if (mapInstanceRef.current) {
        return;
      }

      // Create map
      const map = L.map(mapRef.current!).setView(
        [initialPosition.lat, initialPosition.lng],
        13
      );

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add initial marker
      const marker = L.marker([initialPosition.lat, initialPosition.lng]).addTo(map);
      markerRef.current = marker;

      // Handle map clicks
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        
        // Notify parent
        onLocationSelect(lat, lng);
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker when initialPosition changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && isLoaded) {
      markerRef.current.setLatLng([initialPosition.lat, initialPosition.lng]);
      // Zoom in closer (17) when location updates for better accuracy
      mapInstanceRef.current.setView([initialPosition.lat, initialPosition.lng], 17);
    }
  }, [initialPosition.lat, initialPosition.lng, isLoaded]);

  return (
    <Card className="overflow-hidden">
      <div 
        ref={mapRef} 
        style={{ height: '300px', width: '100%' }}
      />
    </Card>
  );
}
