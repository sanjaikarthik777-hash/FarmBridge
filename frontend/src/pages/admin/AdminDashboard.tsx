import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { AdminOverview, UserProfile } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  onResetDemo: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onResetDemo }) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [farmers, setFarmers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ov, q, logs] = await Promise.all([
        api.getAdminOverview(),
        api.getVerificationQueue(),
        api.getAuditLogs(),
      ]);
      setOverview(ov);
      setFarmers(q);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (profileId: string, status: string) => {
    try {
      await api.updateVerificationDecision(profileId, status, 'Admin reviewed documentation');
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Platform Admin & Operations</h1>
            <span className="badge-verified">
              <ShieldCheck className="w-3.5 h-3.5" />
              Audited Console
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Real-time platform governance, farmer verification, transparent fees, and audit trails.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="btn-outline text-xs text-rose-700 hover:bg-rose-50 border-rose-200 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Overview Metrics */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
            <span className="text-[11px] font-bold uppercase text-gray-500">Gross Platform Value</span>
            <div className="text-2xl sm:text-3xl font-black text-[#1F6B45] mt-1">
              ₹{overview.gross_merchandise_val.toFixed(2)}
            </div>
            <span className="text-[10px] text-gray-500">Total trade value processed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
            <span className="text-[11px] font-bold uppercase text-gray-500">Platform Fees Collected</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              ₹{overview.platform_fee_collected.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">100% transparent ₹5 fee</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
            <span className="text-[11px] font-bold uppercase text-gray-500">Total Active Users</span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {overview.total_users}
            </div>
            <span className="text-[10px] text-gray-500">{overview.farmers_count} farmers, {overview.buyers_count} buyers</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8E3] shadow-xs">
            <span className="text-[11px] font-bold uppercase text-gray-500">Orders Completed</span>
            <div className="text-2xl sm:text-3xl font-black text-[#3C9B62] mt-1">
              {overview.completed_orders} / {overview.total_orders}
            </div>
            <span className="text-[10px] text-gray-500">High completion rate</span>
          </div>
        </div>
      )}

      {/* Farmer Verification Queue */}
      <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Farmer Verification Queue</h3>
            <p className="text-xs text-gray-500">Review land passbook & farmer identification to grant verified badges.</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {farmers.length} Farmers
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {farmers.map((farmer) => (
            <div key={farmer.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <img
                  src={farmer.avatar_path || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                />
                <div>
                  <div className="font-bold text-gray-900">{farmer.display_name}</div>
                  <div className="text-xs text-gray-500">{farmer.email} • {farmer.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${
                    farmer.verification_status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {farmer.verification_status}
                </span>

                {farmer.verification_status !== 'verified' && (
                  <button
                    onClick={() => handleDecision(farmer.id, 'verified')}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}

                <button
                  onClick={() => handleDecision(farmer.id, 'needs_information')}
                  className="btn-outline text-xs py-1.5 px-3"
                >
                  Request Info
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-3xl border border-[#E2E8E3] shadow-xs p-6 space-y-3">
        <h3 className="font-bold text-gray-900">Platform Security & Audit Logs</h3>
        <p className="text-xs text-gray-500">Every sensitive status change, order acceptance, and moderation decision is timestamped.</p>

        <div className="space-y-2 pt-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs flex justify-between">
              <span className="font-mono text-gray-800 font-bold">{log.action}</span>
              <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
