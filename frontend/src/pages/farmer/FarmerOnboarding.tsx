import React, { useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { useFarmerAuth } from '../../context/FarmerAuthContext';
import { CheckCircle2, ChevronRight, MapPin, Sprout, Tractor, Loader2 } from 'lucide-react';

export const FarmerOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { farmerProfile, refresh } = useFarmerAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [phone, setPhone] = useState(farmerProfile?.phone || '');
  const [farmName, setFarmName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Coimbatore');
  const [farmType, setFarmType] = useState('organic');
  const [crops, setCrops] = useState('');
  const [latitude, setLatitude] = useState(10.6609); // Default Pollachi
  const [longitude, setLongitude] = useState(77.0048);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = async () => {
    if (!farmerProfile) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          phone: phone || farmerProfile.phone, 
          onboarding_completed: true,
          default_address: address,
          default_latitude: latitude,
          default_longitude: longitude
        })
        .or(`id.eq.${farmerProfile.id},supabase_auth_id.eq.${farmerProfile.supabase_auth_id || farmerProfile.id}`);
      
      if (profileError) {
        console.warn('Profile update warning:', profileError);
      }

      // 2. Upsert Farm safely with maybeSingle
      const { data: existingFarm } = await supabase
        .from('farms')
        .select('id')
        .eq('owner_id', farmerProfile.id)
        .maybeSingle();
      
      const farmData = {
        owner_id: farmerProfile.id,
        farm_name: farmName || 'My Farm',
        description: description || 'Natural Farm in Pollachi',
        farm_address: address || 'Pollachi, Tamil Nadu',
        district: district || 'Coimbatore',
        region: 'Pollachi',
        village: 'Aliyar',
        latitude: latitude || 10.6609,
        longitude: longitude || 77.0048,
        farm_type: farmType,
        selected_crops: crops ? crops.split(',').map(c => c.trim()).filter(Boolean) : []
      };

      if (existingFarm?.id) {
        const { error: farmError } = await supabase.from('farms').update(farmData).eq('id', existingFarm.id);
        if (farmError) console.warn('Farm update warning:', farmError);
      } else {
        const { error: farmError } = await supabase.from('farms').insert(farmData);
        if (farmError) console.warn('Farm insert warning:', farmError);
      }

      // 3. Save farm details to offline storage and launch Offline Dashboard
      const offlineProfile = {
        farmerId: farmerProfile.id,
        farmerName: farmerProfile.display_name || 'Farmer',
        farmerEmail: farmerProfile.email || '',
        farmName: farmName || 'My Farm',
        phone: phone || farmerProfile.phone || '',
        farmAddress: address || '',
        district: district || 'Coimbatore',
        village: 'Pollachi',
        farmType: farmType || 'organic',
        crops: crops || ''
      };

      try {
        localStorage.setItem('farmdirect_farmer_profile', JSON.stringify(offlineProfile));
      } catch (e) {}

      const offlineParams = new URLSearchParams({
        farmerId: farmerProfile.id,
        farmerName: farmerProfile.display_name || 'Farmer',
        farmerEmail: farmerProfile.email || '',
        farmName: farmName || 'My Farm',
        phone: phone || farmerProfile.phone || '',
        address: address || '',
        district: district || 'Coimbatore',
        village: 'Pollachi',
        farmType: farmType || 'organic',
        crops: crops || ''
      });

      // Show completion state and redirect to offline app dashboard
      setIsCompleted(true);
      setTimeout(() => {
        window.location.href = `/offline/?${offlineParams.toString()}`;
      }, 1500);

    } catch (err: any) {
      console.error('Onboarding submit error:', err);
      setError(err.message || 'An error occurred during onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    const offlineParams = new URLSearchParams({
      farmerId: farmerProfile?.id || '',
      farmerName: farmerProfile?.display_name || 'Farmer',
      farmerEmail: farmerProfile?.email || '',
      farmName: farmName || 'My Farm',
      phone: phone || farmerProfile?.phone || '',
      address: address || '',
      district: district || 'Coimbatore',
      village: 'Pollachi',
      farmType: farmType || 'organic',
      crops: crops || ''
    });
    const offlineUrl = `/offline/?${offlineParams.toString()}`;

    return (
      <div className="min-h-screen bg-[#F8F8F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E9E1] shadow-xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3E7] text-[#245C3A] border border-[#75A85A]/30 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#202820]">Farm Setup Completed!</h1>
            <p className="text-sm text-[#778177] mt-2">
              Welcome, <strong className="text-[#202820]">{farmerProfile?.display_name || 'Farmer'}</strong>! Your farm <strong className="text-[#245C3A]">{farmName || 'My Farm'}</strong> is now registered.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAFBF7] border border-[#E5E9E1] text-xs text-[#245C3A] text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-[#367B4B]" />
              <span>Offline App Profile Ready</span>
            </div>
            <p className="text-[#778177] text-[11px]">
              Transferring your harvest profile to the local offline app dashboard...
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={offlineUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white text-sm font-bold transition-all shadow-md shadow-emerald-900/15 cursor-pointer no-underline"
            >
              <Tractor className="w-4 h-4" />
              <span>Launch Farmer Offline Dashboard →</span>
            </a>
            <p className="text-[11px] text-[#778177] flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#367B4B]" />
              <span>Redirecting automatically...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F2] flex flex-col font-sans">
      <div className="bg-[#245C3A] text-white p-6 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Sprout className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">FarmBridge Farmer Setup</h1>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-6 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E9E1] overflow-hidden">
          
          <div className="flex border-b border-[#E5E9E1]">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 p-4 text-center text-sm font-bold border-b-2 ${step === s ? 'border-[#367B4B] text-[#367B4B] bg-[#EAF3E7]' : step > s ? 'border-[#75A85A] text-[#75A85A]' : 'border-transparent text-[#778177]'}`}>
                Step {s}
              </div>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#202820] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#367B4B]" /> Let's get your contact details
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <button onClick={() => setStep(2)} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white font-bold transition-all">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#202820] flex items-center gap-2">
                  <Tractor className="w-5 h-5 text-[#367B4B]" /> Farm Information
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Farm Name</label>
                  <input 
                    type="text" 
                    value={farmName} 
                    onChange={e => setFarmName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none"
                    placeholder="e.g. Thennam Thoppu Natural Farm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Description</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none h-24"
                    placeholder="Tell consumers about your farm and practices..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Farm Type</label>
                  <select 
                    value={farmType} 
                    onChange={e => setFarmType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none bg-white"
                  >
                    <option value="organic">100% Organic</option>
                    <option value="natural">Natural Farming (ZBNF)</option>
                    <option value="conventional">Conventional</option>
                    <option value="hydroponic">Hydroponic / Greenhouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Crops you grow (comma separated)</label>
                  <input 
                    type="text" 
                    value={crops} 
                    onChange={e => setCrops(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none"
                    placeholder="e.g. Coconuts, Tomatoes, Red Bananas"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white font-bold transition-all">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-[#202820] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#367B4B]" /> Location Details
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-[#778177] mb-1">Full Address</label>
                  <textarea 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none h-24"
                    placeholder="Farm Gate address for pickup..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#778177] mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={latitude} 
                      onChange={e => setLatitude(parseFloat(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#778177] mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={longitude} 
                      onChange={e => setLongitude(parseFloat(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#E5E9E1] focus:ring-2 focus:ring-[#367B4B] outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all">Back</button>
                  <button disabled={loading} onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#245C3A] hover:bg-[#185336] text-white font-bold transition-all disabled:opacity-70">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-5 h-5" /> Complete Setup</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
