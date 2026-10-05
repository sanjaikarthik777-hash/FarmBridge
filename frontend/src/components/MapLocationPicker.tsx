import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Farm } from '../types';

interface MapLocationPickerProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  isDraggable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  farms?: Farm[];
  onSelectFarm?: (farm: Farm) => void;
  height?: string;
  zoom?: number;
  title?: string;
}

// Custom Leaflet Pin Icons
const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  accuracy,
  isDraggable = false,
  onLocationChange,
  farms = [],
  onSelectFarm,
  height = '350px',
  zoom = 13,
  title,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Accuracy Circle
    if (accuracy && accuracy > 0) {
      accuracyCircleRef.current = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#1F6B45',
        fillColor: '#3C9B62',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);
    }

    // User / Current Location Marker
    const userIcon = createIcon(isDraggable ? '#1F6B45' : '#2563EB', isDraggable ? '📍' : '👤');
    const marker = L.marker([latitude, longitude], {
      icon: userIcon,
      draggable: isDraggable,
    }).addTo(map);
    userMarkerRef.current = marker;

    if (title) {
      marker.bindPopup(`<strong>${title}</strong><br/>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`).openPopup();
    }

    if (isDraggable && onLocationChange) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(pos);
        }
      });
    }

    // Add Farm Markers if provided
    if (farms && farms.length > 0) {
      const farmIcon = createIcon('#1F6B45', '🌱');
      farms.forEach((farm) => {
        const fMarker = L.marker([farm.latitude, farm.longitude], { icon: farmIcon }).addTo(map);
        const distanceStr = farm.distance_km !== undefined ? ` • <strong>${farm.distance_km} km away</strong>` : '';
        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
            <strong style="color: #1F6B45; font-size: 13px;">${farm.farm_name}</strong>
            <p style="margin: 4px 0; color: #555;">📍 ${farm.village || farm.region}, Pollachi${distanceStr}</p>
            <p style="margin: 2px 0; color: #2e7d32; font-weight: bold;">${farm.products_count || 0} fresh produce listed</p>
          </div>
        `;
        fMarker.bindPopup(popupContent);
        if (onSelectFarm) {
          fMarker.on('click', () => onSelectFarm(farm));
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, accuracy, isDraggable, farms]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E2E8E3] shadow-inner">
      <div ref={mapContainerRef} style={{ height: height, width: '100%' }} />
      {isDraggable && (
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-700 shadow-md border border-gray-200">
          💡 Drag pin to adjust exact location
        </div>
      )}
    </div>
  );
};
