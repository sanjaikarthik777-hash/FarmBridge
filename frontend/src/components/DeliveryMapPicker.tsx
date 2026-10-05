import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import { Crosshair } from 'lucide-react';

interface DeliveryMapPickerProps {
  latitude: number;
  longitude: number;
  gpsLocation?: { latitude: number; longitude: number; accuracy: number } | null;
  onLocationChange: (lat: number, lng: number) => void;
  onRecenter?: () => void;
  height?: string;
  zoom?: number;
}

export const MAPS_LIBRARIES: "places"[] = ['places'];
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const DeliveryMapPicker: React.FC<DeliveryMapPickerProps> = ({
  latitude,
  longitude,
  gpsLocation,
  onLocationChange,
  onRecenter,
  height = '100%',
  zoom = 18,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: MAPS_LIBRARIES,
    region: 'IN'
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    // Only update center from props if it diverges significantly (to allow smooth external updates like search)
    if (Math.abs(center.lat - latitude) > 0.0001 || Math.abs(center.lng - longitude) > 0.0001) {
      setCenter({ lat: latitude, lng: longitude });
      mapRef.current?.panTo({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleCenterChanged = () => {
    if (!mapRef.current) return;
    const newCenter = mapRef.current.getCenter();
    if (newCenter) {
      const lat = newCenter.lat();
      const lng = newCenter.lng();
      // Only trigger if changed
      if (lat !== center.lat || lng !== center.lng) {
        setCenter({ lat, lng });
      }
    }
  };

  const handleDragEnd = () => {
    if (!mapRef.current) return;
    const newCenter = mapRef.current.getCenter();
    if (newCenter) {
      onLocationChange(newCenter.lat(), newCenter.lng());
    }
  };

  if (!API_KEY) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-4 text-center border border-gray-200">
        <p className="text-gray-500 font-medium">Google Maps API Key missing.</p>
        <p className="text-xs text-gray-400 mt-2">Add VITE_GOOGLE_MAPS_API_KEY to your .env.local file.</p>
      </div>
    );
  }

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl"></div>;

  const containerStyle = {
    width: '100%',
    height: height,
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-inner h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onDragEnd={handleDragEnd}
        onCenterChanged={handleCenterChanged}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
        }}
      >
        {gpsLocation && (
          <Circle
            center={{ lat: gpsLocation.latitude, lng: gpsLocation.longitude }}
            radius={gpsLocation.accuracy}
            options={{
              strokeColor: '#1F6B45',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: '#1F6B45',
              fillOpacity: 0.15,
            }}
          />
        )}
      </GoogleMap>

      {/* Re-center Button */}
      {onRecenter && (
        <button
          type="button"
          onClick={onRecenter}
          className="absolute bottom-6 right-4 z-[400] w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center text-gray-700 hover:text-[#1F6B45] hover:bg-emerald-50 transition-colors"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      )}

      {/* Fixed Center Marker Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none pb-2">
        <div className="relative transform transition-transform animate-bounce-short">
          <div className="w-10 h-10 bg-black text-white rounded-full rounded-br-none -rotate-45 flex items-center justify-center border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/40 rounded-full blur-[2px]"></div>
        </div>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg pointer-events-none transition-all flex items-center gap-2">
        <span>Order will be delivered here</span>
      </div>
    </div>
  );
};
