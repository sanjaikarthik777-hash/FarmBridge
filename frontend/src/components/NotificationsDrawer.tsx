import React from 'react';
import { Bell, X, CheckCheck, Package, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { NotificationItem } from '../types';
import { Language, translations } from '../i18n/translations';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  lang: Language;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  lang,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#F8F8F2] h-full shadow-2xl flex flex-col border-l border-[#E5E9E1]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E9E1] flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center border border-[#75A85A]/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202820]">
                {lang === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
              </h3>
              <p className="text-[11px] text-[#778177]">
                {lang === 'ta' ? 'அறுவடை & ஆர்டர் தகவல்கள்' : 'Harvest alerts & order updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.is_read) && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-[#245C3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'அனைத்தும் படித்தவை' : 'Mark all read'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#778177] hover:text-[#202820] hover:bg-[#EAF3E7] transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-[#E5E9E1] p-6 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF3E7] text-[#245C3A] flex items-center justify-center mx-auto border border-[#75A85A]/30">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#202820]">
                {lang === 'ta' ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-[#778177] max-w-xs mx-auto">
                {lang === 'ta'
                  ? 'விவசாயிகள் உங்கள் ஆர்டர்களை ஏற்கும் போது தகவல்கள் தோன்றும்.'
                  : 'You will receive updates when Pollachi farmers accept and harvest your orders.'}
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.order_id && onSelectOrder) {
                    onSelectOrder(n.order_id);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !n.is_read
                    ? 'bg-[#EAF3E7] border-[#75A85A]/40 shadow-xs'
                    : 'bg-white border-[#E5E9E1] hover:bg-[#FAFBF7]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'order'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-[#EAF3E7] text-[#245C3A] border border-[#75A85A]/30'
                    }`}
                  >
                    {n.type === 'order' ? (
                      <Package className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#202820]">
                        {lang === 'ta' && n.title_ta ? n.title_ta : n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#245C3A] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#778177] leading-relaxed">
                      {lang === 'ta' && n.message_ta ? n.message_ta : n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#778177] pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
