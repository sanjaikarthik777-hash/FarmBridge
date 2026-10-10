import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  PauseCircle,
  Trash2,
  Edit3,
  TrendingDown,
  ChevronRight,
  Leaf,
  MoreVertical,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { FarmerNavTab } from './FarmerSidebar';

interface FarmerMyProductsViewProps {
  onNavigateTab: (tab: FarmerNavTab) => void;
}

type StatusFilter = 'all' | 'active' | 'sold_out' | 'paused';

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.FC<any> }> = {
  active: { label: 'In Stock', className: 'bg-[#EAF3E7] text-[#245C3A] border-[#75A85A]/40', icon: CheckCircle2 },
  available: { label: 'In Stock', className: 'bg-[#EAF3E7] text-[#245C3A] border-[#75A85A]/40', icon: CheckCircle2 },
  sold_out: { label: 'Sold Out', className: 'bg-red-50 text-red-700 border-red-200', icon: TrendingDown },
  paused: { label: 'Paused', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: PauseCircle },
  pending: { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
};

export const FarmerMyProductsView: React.FC<FarmerMyProductsViewProps> = ({ onNavigateTab }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({ farmer_id: 'me' });
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load farmer products', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleAction = async (productId: string, action: 'pause' | 'sold_out' | 'delete') => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      if (action === 'pause') await api.pauseProduct(productId);
      else if (action === 'sold_out') await api.markSoldOut(productId);
      else if (action === 'delete') {
        if (!window.confirm('Remove this produce listing from the marketplace?')) return;
        await api.deleteProduct(productId);
      }
      await loadProducts();
    } catch {
      // If demo mode, simulate state change
      setProducts((prev) =>
        action === 'delete'
          ? prev.filter((p) => p.id !== productId)
          : prev.map((p) =>
              p.id === productId
                ? { ...p, status: action === 'pause' ? 'paused' : 'sold_out' }
                : p
            )
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
      setOpenMenu(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      !searchQ ||
      p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.name_ta && p.name_ta.includes(searchQ));
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    sold_out: products.filter((p) => p.status === 'sold_out').length,
    paused: products.filter((p) => p.status === 'paused').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E9E1] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#202820] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#367B4B]" />
              My Products
            </h1>
            <p className="text-xs text-[#778177] mt-1">
              Manage your active produce listings, toggle stock status, and update prices.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadProducts}
              title="Refresh"
              className="p-2.5 rounded-xl border border-[#E5E9E1] bg-[#FAFBF7] hover:bg-[#EAF3E7] text-[#367B4B] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigateTab('add_product')}
              className="px-4 py-2.5 bg-[#245C3A] text-white rounded-2xl text-xs font-bold hover:bg-[#185336] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Crop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5E9E1] shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778177]" />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search produce name or Tamil name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E9E1] text-xs font-medium bg-[#FAFBF7] focus:outline-none focus:border-[#367B4B] focus:ring-2 focus:ring-[#EAF3E7] transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'sold_out', 'paused'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === f
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'border border-[#E5E9E1] text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7]'
              }`}
            >
              {f === 'all' ? `All (${counts.all})` :
               f === 'active' ? `In Stock (${counts.active})` :
               f === 'sold_out' ? `Sold Out (${counts.sold_out})` :
               `Paused (${counts.paused})`}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E5E9E1] p-5 space-y-3 animate-pulse">
              <div className="w-full h-32 rounded-2xl bg-gray-100" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
              <div className="h-2 w-1/2 rounded bg-gray-100" />
              <div className="h-8 w-full rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E9E1] p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202820]">No Produce Found</h3>
            <p className="text-xs text-[#778177] mt-1 max-w-sm mx-auto">
              {searchQ || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Start by listing your first harvest to reach consumers in Pollachi.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('add_product')}
            className="px-5 py-2.5 bg-[#245C3A] text-white rounded-2xl text-xs font-bold hover:bg-[#185336] cursor-pointer shadow-xs transition-all"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const badge = STATUS_BADGE[product.status] || STATUS_BADGE['available'];
            const BadgeIcon = badge.icon;
            const isActing = actionLoading[product.id];
            const img = product.image_paths?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&fit=crop';

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-[#E5E9E1] hover:border-[#367B4B]/30 hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Produce Image */}
                <div className="relative h-36 overflow-hidden bg-[#F0F4EE]">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&fit=crop';
                    }}
                  />
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full border backdrop-blur-md bg-white/90 ${badge.className}`}>
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-2.5 right-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#778177] hover:text-[#202820] border border-white/50 shadow-xs cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-2xl shadow-2xl border border-[#E5E9E1] py-1 text-xs overflow-hidden">
                        {product.status !== 'paused' && (
                          <button
                            onClick={() => handleAction(product.id, 'pause')}
                            className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-[#EAF3E7] text-[#202820] font-medium cursor-pointer"
                          >
                            <PauseCircle className="w-3.5 h-3.5 text-gray-500" />
                            Pause Listing
                          </button>
                        )}
                        {product.status !== 'sold_out' && (
                          <button
                            onClick={() => handleAction(product.id, 'sold_out')}
                            className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-[#EAF3E7] text-[#202820] font-medium cursor-pointer"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            Mark Sold Out
                          </button>
                        )}
                        <div className="border-t border-[#E5E9E1] my-1" />
                        <button
                          onClick={() => handleAction(product.id, 'delete')}
                          className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-red-50 text-red-600 font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Listing
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1 space-y-1 mb-3">
                    <span className="text-[10px] font-bold text-[#778177]">{(product as any).category_name ?? ''}</span>
                    <h3 className="text-sm font-extrabold text-[#202820] leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    {product.name_ta && (
                      <p className="text-[11px] text-[#778177] font-medium">{product.name_ta}</p>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between py-3 border-t border-[#F0F4EE]">
                    <div>
                      <div className="text-base font-extrabold text-[#245C3A]">
                        ₹{product.price}<span className="text-[11px] text-[#778177] font-normal">/{product.unit}</span>
                      </div>
                      {product.available_quantity !== undefined && (
                        <div className="text-[11px] text-[#778177]">
                          Stock: <span className="font-bold text-[#202820]">{product.available_quantity} {product.unit}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {(product as any).rating_avg && (product as any).review_count ? (
                        <div className="text-[11px] font-bold text-amber-600">
                          ★ {((product as any).rating_avg as number).toFixed(1)}
                          <span className="text-[#778177] font-normal"> ({(product as any).review_count})</span>
                        </div>
                      ) : null}
                      <div className="text-[10px] text-[#778177] mt-0.5">
                        {product.fulfilment_options?.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div className="flex gap-2">
                    {isActing ? (
                      <div className="flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold text-[#778177]">
                        <span className="w-4 h-4 rounded-full border-2 border-[#367B4B] border-t-transparent animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <>
                        {product.status === 'sold_out' && (
                          <button
                            onClick={async () => {
                              setActionLoading((prev) => ({ ...prev, [product.id]: true }));
                              try {
                                await api.updateProduct(product.id, { status: 'active' });
                                await loadProducts();
                              } catch {
                                setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: 'active' as const } : p));
                              } finally {
                                setActionLoading((prev) => ({ ...prev, [product.id]: false }));
                              }
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#EAF3E7] text-[#245C3A] text-xs font-bold hover:bg-emerald-100 cursor-pointer transition-all text-center"
                          >
                            Mark Available
                          </button>
                        )}
                        {product.status === 'paused' && (
                          <button
                            onClick={async () => {
                              setActionLoading((prev) => ({ ...prev, [product.id]: true }));
                              try {
                                await api.updateProduct(product.id, { status: 'active' });
                                await loadProducts();
                              } catch {
                                setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: 'active' as const } : p));
                              } finally {
                                setActionLoading((prev) => ({ ...prev, [product.id]: false }));
                              }
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#EAF3E7] text-[#245C3A] text-xs font-bold hover:bg-emerald-100 cursor-pointer transition-all text-center"
                          >
                            Resume Listing
                          </button>
                        )}
                        {(product.status === 'active' || (product as any).status === 'available') && (
                          <button
                            onClick={() => handleAction(product.id, 'sold_out')}
                            className="flex-1 py-2 rounded-xl border border-[#E5E9E1] text-[#778177] text-xs font-bold hover:bg-[#F0F4EE] cursor-pointer transition-all text-center"
                          >
                            Mark Sold Out
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(product.id, 'delete')}
                          className="p-2 rounded-xl border border-[#E5E9E1] text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"
                          title="Remove listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Row */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E5E9E1] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-[#778177]">
          <span>
            Showing <strong className="text-[#202820]">{filtered.length}</strong> of{' '}
            <strong className="text-[#202820]">{products.length}</strong> produce listings
          </span>
          <button
            onClick={() => onNavigateTab('add_product')}
            className="flex items-center gap-1 font-bold text-[#245C3A] hover:underline cursor-pointer"
          >
            Add New Harvest <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
