import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  Filter,
  Navigation,
  Compass,
  CheckCircle2,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Sprout,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Product, Farm, Category, UserProfile } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { api } from '../../services/api';
import { MapLocationPicker } from '../../components/MapLocationPicker';

interface ConsumerDashboardProps {
  currentProfile: UserProfile | null;
  categories: Category[];
  lang: Language;
  onAddToCart: (productId: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({
  currentProfile,
  categories,
  lang,
  onAddToCart,
  onSelectProduct,
}) => {
  // Consumer GPS coordinates
  const [consumerLat, setConsumerLat] = useState<number>(
    currentProfile?.default_latitude || 10.6580 // Default Pollachi Central
  );
  const [consumerLon, setConsumerLon] = useState<number>(
    currentProfile?.default_longitude || 77.0080
  );
  const [consumerAddress, setConsumerAddress] = useState<string>(
    currentProfile?.default_address || 'Mahalingapuram, Pollachi'
  );

  // Search & Filter States
  const [radiusKm, setRadiusKm] = useState<number | undefined>(25); // Default 25 km
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fulfilmentFilter, setFulfilmentFilter] = useState<string>('all');
  const [showMapView, setShowMapView] = useState(true);

  // Data
  const [nearbyFarms, setNearbyFarms] = useState<Farm[]>([]);
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);

  const t = translations[lang];

  const loadNearbyData = async () => {
    setLoading(true);
    try {
      const [farmsData, prodsData] = await Promise.all([
        api.getNearbyFarms(consumerLat, consumerLon, radiusKm),
        api.getNearbyProducts({
          lat: consumerLat,
          lng: consumerLon,
          radius_km: radiusKm,
          category_id: selectedCategory || undefined,
          q: searchQuery.trim() || undefined,
          fulfilment: fulfilmentFilter !== 'all' ? fulfilmentFilter : undefined,
        }),
      ]);
      setNearbyFarms(farmsData);
      setNearbyProducts(prodsData);
    } catch (err) {
      console.error('Failed to load nearby farms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearbyData();
  }, [consumerLat, consumerLon, radiusKm, selectedCategory, fulfilmentFilter]);

  const handleDetectCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConsumerLat(pos.coords.latitude);
        setConsumerLon(pos.coords.longitude);
        setConsumerAddress('Current Detected GPS Location');
        setDetectingGps(false);
      },
      (err) => {
        setDetectingGps(false);
        alert('Could not detect location. You can drag the pin on the map to set your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const radiusOptions = [
    { label: '1 km', value: 1 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: '25 km', value: 25 },
    { label: '50 km', value: 50 },
    { label: 'All Farms', value: undefined },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Location & Radius Control Bar */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8E3] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-gray-500">
                Active Discovery Location
              </span>
              <div className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>{consumerAddress}</span>
                <span className="text-[11px] font-normal text-gray-500 hidden sm:inline">
                  ({consumerLat.toFixed(4)}, {consumerLon.toFixed(4)})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectCurrentGps}
              disabled={detectingGps}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Crosshair className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
              {detectingGps ? 'Locating...' : 'Detect My Location'}
            </button>

            <button
              onClick={() => setShowMapView(!showMapView)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showMapView ? 'bg-[#1F6B45] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              {showMapView ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>

        {/* Distance Radius Filter Pills */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#1F6B45]" />
            Search Radius:
          </span>
          {radiusOptions.map((opt) => {
            const isSelected = radiusKm === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setRadiusKm(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#1F6B45] text-white shadow-xs'
                    : 'bg-[#FAFBF7] text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Leaflet Map for Nearby Farms */}
      {showMapView && (
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8E3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1F6B45]" />
              Geographic Farm Map ({nearbyFarms.length} Farms within {radiusKm ? `${radiusKm} km` : 'Region'})
            </h2>
            <span className="text-[11px] text-gray-500">
              🔵 Your Location • 🟢 Verified Farm Groves
            </span>
          </div>

          <MapLocationPicker
            latitude={consumerLat}
            longitude={consumerLon}
            farms={nearbyFarms}
            onSelectFarm={(farm) => setSelectedFarm(farm)}
            height="360px"
            zoom={12}
            title="Your Delivery Area"
          />
        </section>
      )}

      {/* Selected Farm Quick Drawer / Card */}
      {selectedFarm && (
        <div className="bg-[#EAF5ED] rounded-3xl p-6 border border-[#C2E2CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-emerald-950">{selectedFarm.farm_name}</span>
              <span className="badge-verified">Verified Farm</span>
              {selectedFarm.distance_km !== undefined && (
                <span className="text-xs bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  {selectedFarm.distance_km} km away
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-800 max-w-xl">{selectedFarm.description}</p>
            <p className="text-[11px] text-emerald-700">
              📍 {selectedFarm.farm_address || `${selectedFarm.village}, Pollachi`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFarm.latitude},${selectedFarm.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs bg-white flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1F6B45]" />
              Get Directions
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
            <button
              onClick={() => setSelectedFarm(null)}
              className="text-xs text-gray-500 hover:text-gray-800 underline px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadNearbyData()}
              placeholder="Search tomatoes, tender coconut, cold-pressed oil..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-hidden focus:border-[#1F6B45]"
            />
          </div>

          {/* Fulfilment Filter */}
          <select
            value={fulfilmentFilter}
            onChange={(e) => setFulfilmentFilter(e.target.value)}
            className="px-3 py-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="all">All Fulfilment Options</option>
            <option value="delivery">🛵 Doorstep Delivery</option>
            <option value="pickup">🚜 Farm Gate Pickup</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-[#1F6B45] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Produce
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#1F6B45] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Produce Listing Grid with Distance Tags */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Nearby Farm Harvests ({nearbyProducts.length})
          </h2>
          <span className="text-xs text-gray-500">
            Sorted by genuine distance from your location
          </span>
        </div>

        {nearbyProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8E3] space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#E7A83E] mx-auto flex items-center justify-center">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No farms found within {radiusKm ? `${radiusKm} km` : 'selected area'}
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Farms in Pollachi are located around Aliyar, Anaimalai, and Kinathukadavu. Try expanding your search radius to find harvest listings.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setRadiusKm(25)}
                className="btn-primary text-xs"
              >
                Expand to 25 km
              </button>
              <button
                onClick={() => setRadiusKm(undefined)}
                className="btn-secondary text-xs"
              >
                Show All Regional Farms
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyProducts.map((prod) => {
              const imgUrl = prod.image_paths[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';
              const isAvailable = prod.status === 'active' && prod.available_quantity > 0;

              return (
                <div
                  key={prod.id}
                  className="card-farm flex flex-col justify-between overflow-hidden bg-white border border-[#E2E8E3] rounded-2xl hover:shadow-lg transition-all"
                >
                  <div>
                    {/* Image and Distance Badge */}
                    <div className="relative h-48 sm:h-52 bg-gray-100 overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Genuine Distance Badge */}
                      {prod.distance_km !== undefined && (
                        <div className="absolute top-3 left-3 bg-emerald-950/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-400/30">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{prod.distance_km} km away</span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className="bg-white/95 text-[#1F6B45] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-emerald-100">
                          {prod.available_quantity} {prod.unit} left
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {prod.fulfilment_options.map((m) => (
                          <span key={m} className="bg-black/60 text-white text-[9px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs capitalize">
                            {m === 'pickup' ? '🚜 Farm Pickup' : '🛵 Delivery'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#3C9B62]">
                          {prod.farm_name || 'Pollachi Grove'}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                          {lang === 'ta' && prod.name_ta ? prod.name_ta : prod.name}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Direct Farm Rate</div>
                          <div className="text-xl font-black text-[#1F6B45]">
                            ₹{prod.price.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-gray-600">/ {prod.unit}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 font-medium">Farmer</span>
                          <div className="text-xs font-bold text-gray-800">
                            {prod.farmer_name || 'Local Farmer'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="btn-outline text-xs py-2 px-3"
                    >
                      View Details
                    </button>
                    <button
                      disabled={!isAvailable}
                      onClick={() => onAddToCart(prod.id, prod.minimum_order_quantity)}
                      className={`text-xs py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-[#1F6B45] hover:bg-[#175436] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Basket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
