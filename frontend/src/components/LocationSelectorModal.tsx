import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Home,
  Briefcase,
  Map as MapIcon,
  ChevronLeft,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { SavedAddress } from '../types';
import { Language, translations } from '../i18n/translations';
import { DeliveryMapPicker, MAPS_LIBRARIES } from './DeliveryMapPicker';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useJsApiLoader } from '@react-google-maps/api';

export interface LocationState {
  label: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  isApproximate?: boolean;
}

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationState;
  onSelectLocation: (loc: LocationState) => void;
  savedAddresses?: SavedAddress[];
  onAddAddress?: (addr: Partial<SavedAddress>) => Promise<void>;
  lang: Language;
}

type ViewState = 'search' | 'map' | 'details';

interface ParsedAddress {
  buildingName: string;
  houseNumber: string;
  street: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  placeId: string;
  plusCode: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';


export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  savedAddresses = [],
  onAddAddress,
  lang,
}) => {
  const [view, setView] = useState<ViewState>('search');
  const [mapLat, setMapLat] = useState(currentLocation.latitude || 10.6609);
  const [mapLng, setMapLng] = useState(currentLocation.longitude || 77.0048);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress>({
    buildingName: '', houseNumber: '', street: '', locality: '', city: '', district: '', state: '', postalCode: '', country: '', formattedAddress: '', placeId: '', plusCode: ''
  });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Manual Form State
  const [flatNo, setFlatNo] = useState('');
  const [floor, setFloor] = useState('');
  const [manualBuilding, setManualBuilding] = useState('');
  const [landmark, setLandmark] = useState('');
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isSaving, setIsSaving] = useState(false);

  // GPS State
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const {
    ready,
    value: searchQuery,
    suggestions: { status, data: searchResults },
    setValue: setSearchQuery,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'in' },
      // Bias towards current location if available
      locationBias: gpsLocation ? {
        center: { lat: gpsLocation.latitude, lng: gpsLocation.longitude },
        radius: 50000 // 50km
      } : undefined
    },
    debounce: 300,
    initOnMount: isOpen && !!API_KEY,
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: MAPS_LIBRARIES,
    region: 'IN'
  });

  useEffect(() => {
    if (isOpen) {
      setView('search');
      setSearchQuery('');
      clearSuggestions();
      setFlatNo('');
      setFloor('');
      setLandmark('');
      setManualBuilding('');
      setGpsError(null);
    }
  }, [isOpen]);

  const parseGoogleAddress = (results: google.maps.GeocoderResult[]) => {
    if (!results || results.length === 0) return;
    
    // The first result is usually the most specific (e.g. street address or premise)
    const bestResult = results[0];
    const components = bestResult.address_components;
    
    let buildingName = '';
    let houseNumber = '';
    let street = '';
    let locality = '';
    let city = '';
    let district = '';
    let state = '';
    let country = '';
    let postalCode = '';

    components.forEach((comp) => {
      const types = comp.types;
      if (types.includes('premise') || types.includes('subpremise') || types.includes('building')) {
        buildingName = comp.long_name;
      }
      if (types.includes('street_number')) houseNumber = comp.long_name;
      if (types.includes('route')) street = comp.long_name;
      if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
        if (!locality) locality = comp.long_name;
      }
      if (types.includes('locality')) {
        city = comp.long_name;
      }
      if (types.includes('administrative_area_level_3') || types.includes('administrative_area_level_2')) {
        if (!district) district = comp.long_name;
      }
      if (types.includes('administrative_area_level_1')) state = comp.long_name;
      if (types.includes('country')) country = comp.long_name;
      if (types.includes('postal_code')) postalCode = comp.long_name;
    });

    const plusCode = bestResult.plus_code?.global_code || '';

    setParsedAddress({
      buildingName,
      houseNumber,
      street,
      locality,
      city: city || district,
      district,
      state,
      postalCode,
      country,
      formattedAddress: bestResult.formatted_address,
      placeId: bestResult.place_id,
      plusCode
    });

    setManualBuilding(buildingName);
  };

  const geocodeRef = useRef<number | null>(null);

  const handleReverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;
    setIsReverseGeocoding(true);
    
    // Throttle / Debounce reverse geocoding slightly on map drag
    if (geocodeRef.current) clearTimeout(geocodeRef.current);
    
    geocodeRef.current = window.setTimeout(() => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsReverseGeocoding(false);
        if (status === 'OK' && results) {
          parseGoogleAddress(results);
        } else {
          console.error('Geocoder failed due to: ' + status);
        }
      });
    }, 500);
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
    handleReverseGeocode(lat, lng);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsDetectingGps(true);
    setGpsError(null);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        setGpsLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: acc });
        setMapLat(pos.coords.latitude);
        setMapLng(pos.coords.longitude);
        handleReverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setView('map');
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('Unable to get your precise location. Please check your permissions.');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSearchResultClick = async (suggestion: google.maps.places.AutocompletePrediction) => {
    setSearchQuery(suggestion.description, false);
    clearSuggestions();
    
    try {
      const results = await getGeocode({ placeId: suggestion.place_id });
      const { lat, lng } = await getLatLng(results[0]);
      setMapLat(lat);
      setMapLng(lng);
      parseGoogleAddress(results); // Use the direct result instead of reverse geocoding again immediately
      setView('map');
    } catch (error) {
      console.error('Error getting geocode:', error);
    }
  };

  const handleConfirmMap = () => {
    setView('details');
  };

  const handleSaveAndProceed = async () => {
    if (onAddAddress) {
      setIsSaving(true);
      try {
        const fullAddressLine = [
          flatNo ? `${flatNo}` : '',
          floor ? `${floor} Floor` : '',
          manualBuilding || parsedAddress.buildingName,
          parsedAddress.houseNumber,
          parsedAddress.street,
          parsedAddress.locality
        ].filter(Boolean).join(', ');

        await onAddAddress({
          label,
          address_line: fullAddressLine || parsedAddress.formattedAddress,
          area: parsedAddress.locality || parsedAddress.city,
          landmark,
          latitude: mapLat,
          longitude: mapLng,
          pincode: parsedAddress.postalCode,
          is_default: true,
          buildingName: manualBuilding,
          houseNumber: parsedAddress.houseNumber,
          street: parsedAddress.street,
          locality: parsedAddress.locality,
          city: parsedAddress.city,
          district: parsedAddress.district,
          state: parsedAddress.state,
          country: parsedAddress.country,
          placeId: parsedAddress.placeId,
          plusCode: parsedAddress.plusCode,
          formattedAddress: parsedAddress.formattedAddress
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }

    onSelectLocation({
      label: `${label} - ${parsedAddress.locality || parsedAddress.city || 'Location'}`,
      latitude: mapLat,
      longitude: mapLng,
      isApproximate: false,
    });
    onClose();
  };

  const handleSelectSaved = (addr: SavedAddress) => {
    onSelectLocation({
      label: `${addr.label} - ${addr.area}`,
      latitude: addr.latitude,
      longitude: addr.longitude,
      isApproximate: false,
    });
    onClose();
  };

  // Delivery Zone Logic
  // Currently checking exact coordinate distance from Hub
  const HUB_LAT = 10.6609;
  const HUB_LNG = 77.0048;
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const distance = calculateDistance(mapLat, mapLng, HUB_LAT, HUB_LNG);
  const isServiceable = distance <= 15.0; // 15km radius check based on EXACT coordinates.

  if (!isOpen) return null;

  if (!API_KEY) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Google Maps API Key Missing</h3>
          <p className="text-sm text-gray-500 mb-6">Please add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-xs">frontend/.env.local</code> file and restart the development server.</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl font-bold w-full">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-[480px] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:max-h-[85vh] transition-transform transform-gpu animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-4 py-3 sm:py-4 border-b border-gray-100 flex items-center shadow-sm z-10 bg-white shrink-0">
          {view !== 'search' && (
            <button onClick={() => setView(view === 'details' ? 'map' : 'search')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="flex-1 text-base sm:text-lg font-bold text-gray-900 ml-2">
            {view === 'search' && 'Search location'}
            {view === 'map' && 'Confirm delivery location'}
            {view === 'details' && 'Enter complete address'}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Search */}
        {view === 'search' && (
          <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50/50">
            <div className="p-4 bg-white shadow-sm z-10 sticky top-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1F6B45]" />
                <input
                  type="text"
                  placeholder="Search for area, street, building or PIN code"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F6B45]/20 focus:border-[#1F6B45] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!ready}
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              {gpsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{gpsError}</p>
                </div>
              )}

              {status !== 'OK' ? (
                <>
                  <button
                    onClick={handleDetectGPS}
                    disabled={isDetectingGps}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-emerald-100 rounded-2xl hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-900/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#1F6B45] group-hover:scale-110 transition-transform">
                      {isDetectingGps ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F6B45]">Use current location</h4>
                      <p className="text-xs text-emerald-700/70 font-medium">Enable high-accuracy GPS</p>
                    </div>
                  </button>

                  {savedAddresses.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Saved Addresses</h3>
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => handleSelectSaved(addr)}
                            className="w-full flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                              {addr.label === 'Home' ? <Home className="w-5 h-5" /> : addr.label === 'Work' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate">{addr.label}</h4>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{addr.address_line}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {searchResults.map((result, idx) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSearchResultClick(result)}
                      className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${idx !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{result.structured_formatting.main_text}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{result.structured_formatting.secondary_text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 2: Map Pinning */}
        {view === 'map' && (
          <div className="flex flex-col h-full bg-gray-50 flex-1">
            <div className="flex-1 relative min-h-[40vh]">
              <DeliveryMapPicker
                latitude={mapLat}
                longitude={mapLng}
                gpsLocation={gpsLocation}
                onLocationChange={handleMapLocationChange}
                onRecenter={handleDetectGPS}
                height="100%"
              />
            </div>
            
            <div className="bg-white p-5 rounded-t-3xl -mt-6 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              {gpsLocation && gpsLocation.accuracy > 100 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-2 text-red-800 text-xs font-medium">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>Your location isn't precise enough (Accuracy: {Math.round(gpsLocation.accuracy)}m). Please enable precise location or move to an open area.</p>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button onClick={handleDetectGPS} className="bg-white border border-red-200 px-3 py-1 rounded text-red-700 font-bold">Try Again</button>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black shrink-0 shadow-sm border border-gray-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {isReverseGeocoding ? (
                    <div className="space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      {parsedAddress.buildingName && (
                        <h3 className="text-base font-bold text-gray-900 mb-1 truncate uppercase tracking-tight">
                          {parsedAddress.buildingName}
                        </h3>
                      )}
                      
                      {!parsedAddress.buildingName && (
                        <h3 className="text-base font-bold text-gray-900 mb-1 truncate">
                          {[parsedAddress.houseNumber, parsedAddress.street].filter(Boolean).join(', ') || parsedAddress.locality || 'Selected Location'}
                        </h3>
                      )}

                      <div className="text-xs text-gray-500 leading-snug">
                        {parsedAddress.buildingName && [parsedAddress.houseNumber, parsedAddress.street].filter(Boolean).length > 0 && (
                          <p>{[parsedAddress.houseNumber, parsedAddress.street].filter(Boolean).join(', ')}</p>
                        )}
                        <p>{[parsedAddress.locality, parsedAddress.city].filter(Boolean).join(', ')}</p>
                        <p>{[parsedAddress.state, parsedAddress.postalCode ? `- ${parsedAddress.postalCode}` : ''].filter(Boolean).join(' ')}</p>
                      </div>
                    </>
                  )}
                  {gpsLocation && gpsLocation.accuracy <= 100 && !isReverseGeocoding && (
                    <div className="mt-2 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Accurate to {Math.round(gpsLocation.accuracy)} m
                    </div>
                  )}
                </div>
              </div>
              
              {!isReverseGeocoding && (
                <div className="mb-4 text-center border-t border-gray-100 pt-3">
                  {isServiceable ? (
                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <span className="text-sm">✓</span> Delivery available here
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                      <span className="text-sm">⚠</span> This location is outside our delivery zone.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleConfirmMap}
                disabled={isReverseGeocoding || !isServiceable}
                className="w-full py-4 bg-[#1F6B45] hover:bg-[#185336] disabled:opacity-50 disabled:hover:bg-[#1F6B45] text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(31,107,69,0.3)] transition-all flex items-center justify-center gap-2 mb-3"
              >
                Confirm Location
              </button>
              
              <button 
                onClick={() => setView('details')}
                className="w-full text-xs font-bold text-[#1F6B45] hover:text-[#185336] transition-colors py-2"
              >
                Enter Complete Address
              </button>
            </div>
          </div>
        )}

        {/* View 3: Manual Details */}
        {view === 'details' && (
          <div className="flex flex-col h-full bg-gray-50 flex-1 overflow-y-auto">
            <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-10 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {parsedAddress.buildingName || parsedAddress.locality || parsedAddress.city || 'Selected Location'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {parsedAddress.formattedAddress}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setView('map')}
                className="text-xs font-bold text-[#1F6B45] hover:underline whitespace-nowrap px-3 py-1.5 bg-emerald-50 rounded-lg"
              >
                Edit Location
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Building / Apartment Name</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Residency"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1F6B45] focus:ring-1 focus:ring-[#1F6B45] transition-all"
                  value={manualBuilding}
                  onChange={(e) => setManualBuilding(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Flat / Door No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. B-204"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1F6B45] focus:ring-1 focus:ring-[#1F6B45] transition-all"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Floor</label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1F6B45] focus:ring-1 focus:ring-[#1F6B45] transition-all"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near XYZ School"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1F6B45] focus:ring-1 focus:ring-[#1F6B45] transition-all"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Save address as *</label>
                <div className="flex gap-3">
                  {(['Home', 'Work', 'Other'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                        label === l
                          ? 'bg-emerald-50 text-[#1F6B45] border-[#1F6B45]'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {l === 'Home' && <Home className="w-4 h-4" />}
                      {l === 'Work' && <Briefcase className="w-4 h-4" />}
                      {l === 'Other' && <MapPin className="w-4 h-4" />}
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 shrink-0">
              <button
                onClick={handleSaveAndProceed}
                disabled={isSaving || !flatNo.trim()}
                className="w-full py-4 bg-[#1F6B45] hover:bg-[#185336] disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(31,107,69,0.2)] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Save Address</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
