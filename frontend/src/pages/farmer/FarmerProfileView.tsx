import React, { useState, useEffect } from 'react';
import { MapPin, Crosshair, CheckCircle, Store } from 'lucide-react';
import { api } from '../../services/api';
import { Farm } from '../../types';
import { MapLocationPicker } from '../../components/MapLocationPicker';

export const FarmerProfileView: React.FC = () => {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmLat, setFarmLat] = useState<number>(10.5982);
  const [farmLon, setFarmLon] = useState<number>(76.9721);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadFarm() {
      try {
        const farmData = await api.getMyFarm();
        setFarm(farmData);
        setFarmLat(farmData.latitude);
        setFarmLon(farmData.longitude);
        setGpsAccuracy(farmData.gps_accuracy);
      } catch (err) {
        console.error('Failed to load farm details', err);
      }
    }
    loadFarm();
  }, []);

  const handleSaveFarmLocation = async () => {
    if (!farm) return;
    setIsUpdatingLocation(true);
    try {
      const updated = await api.updateFarmLocation(farm.id, {
        latitude: farmLat,
        longitude: farmLon,
        gps_accuracy: gpsAccuracy,
        is_approximate: farm.is_approximate,
        village: farm.village,
        district: farm.district,
        pincode: farm.pincode,
        farm_address: farm.farm_address,
      });
      setFarm(updated);
      setLocationSuccessMsg('Farm GPS coordinates updated successfully! Products are now discovered at this location.');
      setTimeout(() => setLocationSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDetectNewGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFarmLat(pos.coords.latitude);
        setFarmLon(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
      },
      (err) => alert('Could not retrieve GPS coordinates. Drag pin to adjust manually.')
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E9E1] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E9E1] pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#202820] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#245C3A]" />
              Farm Location & Geographic Map Setting
            </h3>
            <p className="text-xs text-[#778177]">
              Your farm GPS coordinates are automatically attached to all listed products for consumer distance calculations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectNewGps}
              className="px-4 py-2.5 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#202820] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Crosshair className="w-3.5 h-3.5" />
              Detect GPS Position
            </button>
            <button
              type="button"
              disabled={isUpdatingLocation}
              onClick={handleSaveFarmLocation}
              className="px-5 py-2.5 bg-[#245C3A] hover:bg-[#185336] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isUpdatingLocation ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>

        {locationSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            {locationSuccessMsg}
          </div>
        )}

        <div className="space-y-3">
          <MapLocationPicker
            latitude={farmLat}
            longitude={farmLon}
            accuracy={gpsAccuracy}
            isDraggable={true}
            onLocationChange={(newLat, newLon) => {
              setFarmLat(newLat);
              setFarmLon(newLon);
            }}
            height="380px"
            title={farm?.farm_name || 'Farm Grove Location'}
          />

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#778177] px-1">
            <span>
              Coordinates: <strong className="text-[#202820]">{farmLat.toFixed(6)} N, {farmLon.toFixed(6)} E</strong>
              {gpsAccuracy && ` (Accuracy: ~${gpsAccuracy}m)`}
            </span>
            <span>Drag marker pin to set the exact packing/farm gate location</span>
          </div>
        </div>

        <div className="bg-[#FAFBF7] p-4 rounded-2xl border border-[#E5E9E1] text-xs space-y-1 mt-4">
          <span className="font-bold text-[#202820]">Saved Farm Address:</span>
          <p className="text-[#778177]">
            {farm?.farm_address || 'Farm gate location'}, {farm?.village || 'Pollachi'}, {farm?.district || 'Coimbatore'} - {farm?.pincode || '642001'}
          </p>
        </div>
      </div>
    </div>
  );
};
