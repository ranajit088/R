
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, UserPlus, Bell, ChevronLeft, MoreHorizontal, Circle } from 'lucide-react';
import ProfilePage from './ProfilePage';
import { Notification } from '../types';

interface NotificationsScreenProps {
  onBack?: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { notifications, markNotificationsAsRead, user } = useAuth();
  const [viewingProfileId, setViewingProfileId] = React.useState<string | null>(null);

  useEffect(() => {
    markNotificationsAsRead();
  }, [markNotificationsAsRead]);

  if (viewingProfileId) {
    return <ProfilePage targetUserId={viewingProfileId} onBack={() => setViewingProfileId(null)} />;
  }

  const getNotificationMessage = (notif: Notification) => {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      default: return 'interacted with you';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <ThumbsUp size={14} className="text-blue-500 fill-blue-500" />;
      case 'comment': return <MessageSquare size={14} className="text-emerald-500 fill-emerald-500" />;
      case 'follow': return <UserPlus size={14} className="text-indigo-600 fill-indigo-600" />;
      default: return <Bell size={14} className="text-slate-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const myNotifications = notifications.filter(n => n.toUserId === user?.id);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
              <ChevronLeft size={24} />
            </button>
          )}
          <h2 className="text-2xl font-[900] text-slate-900 italic tracking-tighter">Notifications</h2>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {myNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
              <Bell size={40} />
            </div>
            <h3 className="font-black text-slate-900 italic text-xl tracking-tight">Stay updated</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-[240px]">We'll notify you when someone interacts with your profile or posts.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myNotifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => setViewingProfileId(notif.fromUserId)}
                className={`w-full flex items-start px-4 py-4 text-left transition-colors hover:bg-slate-50 relative ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="relative flex-shrink-0 mt-1">
                  <img src={notif.fromUserProfilePic} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-50">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>
                <div className="ml-4 flex-1 pr-4">
                  <p className="text-sm text-slate-800 leading-snug">
                    <span className="font-black italic text-slate-900 mr-1">{notif.fromUserName}</span>
                    <span className="font-medium text-slate-500">{getNotificationMessage(notif)}</span>
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5">
                    {formatTime(notif.timestamp)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Circle size={8} className="text-[#312E81] fill-[#312E81]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
