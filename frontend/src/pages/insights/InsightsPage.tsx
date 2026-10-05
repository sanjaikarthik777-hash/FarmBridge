import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Compass,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { PriceReference, DemandInsight } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { api } from '../../services/api';

interface InsightsPageProps {
  lang: Language;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ lang }) => {
  const [references, setReferences] = useState<PriceReference[]>([]);
  const [demand, setDemand] = useState<DemandInsight[]>([]);
  const [routeGrouping, setRouteGrouping] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculator test state
  const [calcCrop, setCalcCrop] = useState('Country Tomatoes (தக்காளி)');
  const [calcPrice, setCalcPrice] = useState(32);
  const [calcQty, setCalcQty] = useState(25);
  const [calcUnit, setCalcUnit] = useState('kg');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    async function loadInsights() {
      try {
        const [refData, demData, routeData] = await Promise.all([
          api.getPriceReferences(),
          api.getDemandInsights(),
          api.getRouteGrouping(),
        ]);
        setReferences(refData);
        setDemand(demData);
        setRouteGrouping(routeData);

        // Run initial test calculation
        const initialCalc = await api.getPriceEstimate({
          crop_name: 'Country Tomatoes',
          farmer_price: 32,
          quantity: 25,
          unit: 'kg',
        });
        setCalcResult(initialCalc);
      } catch (err) {
        console.error('Failed to load insights', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await api.getPriceEstimate({
        crop_name: calcCrop,
        farmer_price: calcPrice,
        quantity: calcQty,
        unit: calcUnit,
      });
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF5ED] text-[#1F6B45] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#E7A83E]" />
          Decision Support & AgriTech Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          AI Market Benchmarks & Demand Trends
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mt-1">
          FarmBridge integrates daily observations from Pollachi Uzhavar Sandhai, Coimbatore APMC Mandi, and local producer collectives. All benchmarks are transparent decision support tools to help farmers set confident prices.
        </p>
      </div>

      {/* Honest AI Notice */}
      <div className="bg-[#FAFBF7] border border-[#E2E8E3] rounded-2xl p-4 flex items-start gap-3 text-xs text-gray-600">
        <Info className="w-4 h-4 text-[#1F6B45] shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900">Platform Transparency Notice:</strong> AI price guidance and demand metrics are based on real-time aggregated marketplace views and legal public bulletins. Farmers retain 100% agency over their listing price.
        </div>
      </div>

      {/* Interactive AI Price Estimator Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E3] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1F6B45]" />
              Interactive Farm Price Benchmarking Tool
            </h2>
            <p className="text-xs text-gray-500">
              Test how your proposed selling price compares to Pollachi regulated market rates.
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Crop</label>
            <select
              value={calcCrop}
              onChange={(e) => setCalcCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white font-medium"
            >
              <option value="Country Tomatoes (தக்காளி)">Country Tomatoes (நாட்டு தக்காளி)</option>
              <option value="Pollachi Sweet Tender Coconut (இளநீர்)">Pollachi Tender Coconut (இளநீர்)</option>
              <option value="Small Red Shallots (சின்ன வெங்காயம்)">Small Red Shallots (சின்ன வெங்காயம்)</option>
              <option value="Anaimalai Red Bananas (செவ்வாழை)">Anaimalai Red Bananas (செவ்வாழை)</option>
              <option value="Wood-Pressed Coconut Oil (மரச்செக்கு)">Wood-Pressed Oil (மரச்செக்கு)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Proposed Selling Price (₹)</label>
            <input
              type="number"
              step="0.5"
              value={calcPrice}
              onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-[#1F6B45]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={calcQty}
              onChange={(e) => setCalcQty(parseFloat(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={calcLoading}
              className="btn-primary w-full py-2.5 text-xs font-bold"
            >
              {calcLoading ? 'Evaluating...' : 'Evaluate Benchmark'}
            </button>
          </div>
        </form>

        {calcResult && (
          <div className="bg-[#FAFBF7] rounded-2xl p-5 border border-[#E2E8E3] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Uzhavar Modal Rate</span>
                <div className="text-xl font-black text-gray-900">
                  ₹{calcResult.reference_modal} <span className="text-xs font-normal text-gray-500">/ {calcResult.unit}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Market Range</span>
                <div className="text-xl font-black text-gray-900">
                  ₹{calcResult.reference_min} - ₹{calcResult.reference_max}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Classification</span>
                <div className="text-xl font-black capitalize text-[#1F6B45]">
                  {calcResult.price_band}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 uppercase font-semibold">Net Farmer Payout</span>
                <div className="text-xl font-black text-[#1F6B45]">
                  ₹{calcResult.estimated_farmer_earnings}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#EAF5ED] text-[#1F6B45] text-xs font-medium border border-[#C2E2CC] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{calcResult.note}</span>
            </div>
          </div>
        )}
      </div>

      {/* Official Benchmark Bulletin Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">
              Pollachi & Coimbatore Daily Mandi Benchmark Table
            </h3>
            <p className="text-xs text-gray-500">
              Source: Tamil Nadu Regulated Markets & Uzhavar Sandhai Daily Bulletins
            </p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
            Updated Today
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAFBF7] text-[#68736B] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-4">Crop Name</th>
                <th className="p-4">Regulated Market</th>
                <th className="p-4">Min Rate</th>
                <th className="p-4">Modal (Average)</th>
                <th className="p-4">Max Rate</th>
                <th className="p-4">Source Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {references.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">
                    {ref.crop_name}
                  </td>
                  <td className="p-4 text-gray-600">{ref.market_name}</td>
                  <td className="p-4 text-gray-700">₹{ref.min_price} / {ref.unit}</td>
                  <td className="p-4 font-black text-[#1F6B45]">₹{ref.modal_price} / {ref.unit}</td>
                  <td className="p-4 text-gray-700">₹{ref.max_price} / {ref.unit}</td>
                  <td className="p-4 text-xs text-gray-500">{ref.source_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop Demand Trends */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E3] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#3C9B62]" />
              Pollachi Local Crop Demand Trends
            </h3>
            <p className="text-xs text-gray-500">
              Aggregated platform searches, basket additions, and household procurement velocity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demand.map((d, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-gray-200 bg-[#FAFBF7] space-y-2 hover:border-[#1F6B45]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-gray-900 text-sm">{d.crop_name}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {d.trend}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Weekly Searches: <strong className="text-gray-900">{d.weekly_searches}</strong></span>
                <span>Orders: <strong className="text-gray-900">{d.order_volume}</strong></span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {d.demand_level} Demand
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pt-1">
                {d.buyer_interest_note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Logistics Clustering Preview */}
      {routeGrouping && (
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8E3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#1F6B45]" />
              Smart Dispatch Route Clustering (Local Logistics)
            </h3>
            <span className="text-xs bg-emerald-100 text-[#1F6B45] font-bold px-2.5 py-0.5 rounded-full">
              ~{routeGrouping.estimated_fuel_saving_pct}% Fuel & Transit Savings
            </span>
          </div>

          <p className="text-xs text-gray-600">
            Orders in {routeGrouping.cluster_area} are automatically batched together for single-trip farm pickup and multi-doorstep drop-off.
          </p>

          <div className="space-y-2 pt-2">
            {routeGrouping.optimized_stops.map((stop: any) => (
              <div
                key={stop.stop}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1F6B45] text-white flex items-center justify-center font-bold text-[10px]">
                    {stop.stop}
                  </span>
                  <span className="font-bold uppercase text-gray-700">
                    {stop.type === 'pickup' ? '🚜 Farm Collect' : '🏡 Doorstep Drop'}
                  </span>
                  <span className="text-gray-900 font-medium">{stop.location}</span>
                </div>
                <span className="text-gray-500 font-medium">
                  {stop.farmer || stop.buyer}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
