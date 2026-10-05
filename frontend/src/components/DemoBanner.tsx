import React from 'react';
import { Info, UserCheck, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface DemoBannerProps {
  currentProfile: UserProfile | null;
  allProfiles: UserProfile[];
  onSwitchUser: (userId: string) => void;
  onResetDemo: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentProfile,
  allProfiles,
  onSwitchUser,
  onResetDemo,
}) => {
  return (
    <div className="bg-[#FEF6E9] border-b border-[#FCE6BE] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#92400E]">
          <Info className="w-4 h-4 shrink-0 text-[#E7A83E]" />
          <span>
            <strong className="font-bold">Pollachi Agricultural Pilot Demo:</strong> All marketplace data, Uzhavar Sandhai price benchmarks, and simulated payments are loaded for live end-to-end evaluation.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-gray-500 font-medium">Quick Persona Switch:</span>
          {allProfiles.map((p) => {
            const isSelected = p.id === currentProfile?.id;
            return (
              <button
                key={p.id}
                onClick={() => onSwitchUser(p.id)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1F6B45] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {p.role === 'farmer' && '👨‍🌾 '}
                {p.role === 'consumer' && '🛒 '}
                {p.role === 'business' && '🏢 '}
                {p.role === 'delivery' && '🛵 '}
                {p.role === 'admin' && '🛡️ '}
                {p.display_name.split(' ')[0]} ({p.role})
              </button>
            );
          })}
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-red-700 ml-1 font-medium underline"
            title="Reset to default mock state"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
