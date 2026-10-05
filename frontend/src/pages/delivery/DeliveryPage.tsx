import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Clock, ShieldAlert, RotateCcw } from 'lucide-react';
import { DeliveryTask, UserProfile } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { api } from '../../services/api';

interface DeliveryPageProps {
  currentProfile: UserProfile | null;
  lang: Language;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({ currentProfile, lang }) => {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  const loadTasks = async () => {
    try {
      const data = await api.getDeliveryTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await api.updateDeliveryStatus(taskId, status);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Delivery Partner Logistics Portal</h1>
            <span className="badge-demo">Live Coordination</span>
          </div>
          <p className="text-xs text-gray-500">
            Assigned local farm pickup and doorstep drop-off runs in Pollachi region.
          </p>
        </div>

        <button onClick={loadTasks} className="btn-secondary text-xs self-start sm:self-auto">
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh Tasks
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8E3] text-gray-500">
          No delivery jobs currently active. New orders will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const isAssigned = task.status === 'assigned';
            const isAccepted = task.status === 'accepted';
            const isDelivered = task.status === 'delivered';

            return (
              <div
                key={task.id}
                className="bg-white rounded-3xl border border-[#E2E8E3] p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#1F6B45]" />
                    <span className="font-extrabold text-gray-900 text-sm">
                      Job #{task.order_number}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      isDelivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAccepted
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Pickup */}
                  <div className="flex items-start gap-2 bg-[#FAFBF7] p-3 rounded-xl border border-gray-200">
                    <MapPin className="w-4 h-4 text-[#1F6B45] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Pickup Location (Farm Gate):</span>
                      <p className="font-semibold text-gray-900">{task.pickup_address}</p>
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex items-start gap-2 bg-[#FAFBF7] p-3 rounded-xl border border-gray-200">
                    <Navigation className="w-4 h-4 text-[#3C9B62] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Dropoff Customer Destination:</span>
                      <p className="font-semibold text-gray-900">{task.dropoff_address}</p>
                    </div>
                  </div>

                  {/* Distance estimate */}
                  <div className="flex justify-between items-center text-gray-600 px-1 pt-1">
                    <span>Est. Distance: <strong className="text-gray-900">{task.route_estimate_km} km</strong></span>
                    <span>Est. Transit: <strong className="text-gray-900">{task.estimated_duration_mins} mins</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  {isAssigned && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'accepted')}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      Accept Delivery Task
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'delivered')}
                      className="btn-primary text-xs py-2 px-4 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Delivered to Doorstep
                    </button>
                  )}

                  {isDelivered && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Delivered & Handed Over
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
