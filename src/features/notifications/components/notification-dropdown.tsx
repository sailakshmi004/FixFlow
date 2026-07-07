'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead, clearAll, getUnreadCount, type NotificationRow } from '@/features/notifications/services/notification-service';

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const onClick = async (n: NotificationRow) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link as never);
    }
  };

  const onMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const onClearAll = async () => {
    await clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="icon" className="relative" onClick={() => { setOpen(!open); if (!open) void load(); }}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/70 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-3">
            <span className="text-sm font-semibold text-slate-900">Notifications</span>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button onClick={onClearAll} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </button>
              )}
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => void onClick(n)}
                  className={`w-full text-left px-5 py-3 transition-colors hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                >
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
