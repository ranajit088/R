
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { 
  Camera, 
  Edit2, 
  Settings, 
  MoreHorizontal, 
  MapPin, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  ChevronLeft, 
  LogOut, 
  Grid, 
  List,
  Loader2,
  MessageSquare
} from 'lucide-react';
import EditProfileScreen from './EditProfileScreen';
import ChatRoom from './ChatRoom';
import { User } from '../types';

interface ProfilePageProps {
  targetUserId?: string;
  onBack?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ targetUserId, onBack }) => {
  const { user: me, posts, getUserById, toggleFollow, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const isOwnProfile = !targetUserId || targetUserId === me?.id;
  
  useEffect(() => {
    if (targetUserId && !isOwnProfile) {
      const u = getUserById(targetUserId);
      setTargetUser(u);
    }
  }, [targetUserId, me?.following, getUserById, isOwnProfile]);

  const activeUser = isOwnProfile ? me : targetUser;

  if (!activeUser) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="animate-spin text-[#312E81]" size={32} />
    </div>
  );

  if (isChatting && !isOwnProfile) {
    return <ChatRoom recipient={activeUser} onBack={() => setIsChatting(false)} />;
  }

  // Filter posts specific to this user
  const userPosts = posts.filter(p => p.user.id === activeUser.id);
  const isFollowing = me?.following?.includes(activeUser.id);

  const handleFollowAction = async () => {
    if (!targetUserId) return;
    // Instant UI feedback logic
    setIsFollowLoading(true);
    try {
      await toggleFollow(targetUserId);
      // Refresh target user info to update local followers count
      const updatedTarget = getUserById(targetUserId);
      setTargetUser(updatedTarget);
    } catch (err) {
      console.error("Follow action failed", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <>
      <div className="bg-slate-50 min-h-screen pb-20">
        {/* Header/Cover Section */}
        <div className="relative bg-white border-b border-slate-200 shadow-sm">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute top-4 left-4 z-20 bg-slate-900/40 p-2 rounded-full text-white backdrop-blur-md hover:bg-slate-900/60 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Cover Photo */}
          <div className="h-44 sm:h-56 bg-slate-200 w-full relative overflow-hidden">
            <img 
              src={`https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop`} 
              className="w-full h-full object-cover opacity-90" 
              alt="Cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="relative -mt-14 mb-4 flex justify-between items-end">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src={activeUser.profilePic} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                {isOwnProfile && (
                  <button className="absolute -bottom-1 -right-1 bg-[#312E81] p-2.5 rounded-2xl border-4 border-white shadow-lg text-white hover:scale-110 transition-transform">
                    <Camera size={18} />
                  </button>
                )}
              </div>

              <div className="flex space-x-2 pb-1">
                {isOwnProfile ? (
                  <div className="relative">
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-3 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <Settings size={22} />
                    </button>
                    {showSettings && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => { setIsEditing(true); setShowSettings(false); }}
                          className="w-full px-5 py-4 text-left text-sm font-black text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                        >
                          <Edit2 size={18} className="text-[#312E81]" />
                          <span>Edit Profile</span>
                        </button>
                        <hr className="border-slate-100" />
                        <button 
                          onClick={() => { logout(); setShowSettings(false); }}
                          className="w-full px-5 py-4 text-left text-sm font-black text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="p-3 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200">
                    <MoreHorizontal size={22} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-[900] text-slate-900 tracking-tighter italic">
                {activeUser.name}
              </h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Member since 2024</p>
            </div>
            
            <div className="mt-5 space-y-4">
              {activeUser.bio && (
                <p className="text-slate-700 text-[16px] leading-relaxed font-medium">
                  {activeUser.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] text-slate-500 font-black uppercase tracking-widest">
                {activeUser.city && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={14} className="text-[#312E81]" />
                    <span>{activeUser.city}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5">
                  <Calendar size={14} className="text-[#312E81]" />
                  <span>Verified Professional</span>
                </div>
              </div>

              {/* Follower/Following Counts */}
              <div className="flex space-x-8 py-4 border-y border-slate-100">
                <div className="flex flex-col">
                  <span className="text-slate-900 font-[900] text-xl leading-none">{activeUser.followers?.length || 0}</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Followers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-900 font-[900] text-xl leading-none">{activeUser.following?.length || 0}</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Following</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-900 font-[900] text-xl leading-none">{userPosts.length}</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Posts</span>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-[#312E81] text-white font-black py-4 rounded-[1.25rem] flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs"
                  >
                    <Edit2 size={18} />
                    <span>Update Profile</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleFollowAction}
                      disabled={isFollowLoading}
                      className={`flex-1 font-black py-4 rounded-[1.25rem] flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl uppercase tracking-widest text-xs border-2 ${
                        isFollowing 
                          ? 'bg-slate-100 text-slate-500 border-slate-100 shadow-none' 
                          : 'bg-[#312E81] text-white border-[#312E81] shadow-indigo-100'
                      }`}
                    >
                      {isFollowLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck size={18} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsChatting(true)}
                      className="flex-1 bg-white text-slate-900 border-2 border-slate-100 font-black py-4 rounded-[1.25rem] flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg shadow-slate-50 uppercase tracking-widest text-xs"
                    >
                      <MessageSquare size={18} className="text-[#312E81]" />
                      <span>Message</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Content Feed */}
        <div className="mt-2 px-0">
          <div className="sticky top-14 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Timeline Feed</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#312E81]' : 'text-slate-400'}`}
               >
                 <List size={18} />
               </button>
               <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#312E81]' : 'text-slate-400'}`}
               >
                 <Grid size={18} />
               </button>
            </div>
          </div>

          <div className="pb-10">
            {userPosts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center px-12">
                <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-indigo-200 transform rotate-6 shadow-inner">
                  <Grid size={40} />
                </div>
                <h3 className="text-slate-900 font-black text-xl italic tracking-tight">Quiet on the feed</h3>
                <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">No shared updates found for this profile.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-1">
                {userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 pt-0.5">
                {userPosts.map(post => (
                  <div key={post.id} className="aspect-square bg-slate-200 overflow-hidden relative group">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post thumbnail" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 bg-indigo-50 text-[#312E81] text-[10px] font-black italic text-center leading-tight">
                        "{post.content.substring(0, 30)}..."
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <EditProfileScreen onBack={() => setIsEditing(false)} />
      )}
    </>
  );
};

export default ProfilePage;
