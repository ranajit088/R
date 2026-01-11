
import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, UserCheck, Loader2, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import ProfilePage from './ProfilePage';

const DiscoverScreen: React.FC = () => {
  const { user: me, toggleFollow } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [followProcessing, setFollowProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching all users from Firestore
    const fetchUsers = () => {
      const usersData = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
      // Exclude current user
      const others = usersData
        .filter((u: any) => u.id !== me?.id)
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          profilePic: u.profilePic,
          followers: u.followers || [],
          following: u.following || []
        }));
      setAllUsers(others);
      setLoading(false);
    };

    fetchUsers();
    // In a real app, this would be a real-time listener
    const interval = setInterval(fetchUsers, 2000);
    return () => clearInterval(interval);
  }, [me?.id]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  const handleFollowToggle = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    setFollowProcessing(targetId);
    try {
      await toggleFollow(targetId);
    } catch (err) {
      console.error("Follow failed", err);
    } finally {
      setFollowProcessing(null);
    }
  };

  if (selectedProfileId) {
    return <ProfilePage targetUserId={selectedProfileId} onBack={() => setSelectedProfileId(null)} />;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-3xl font-[900] text-slate-900 italic tracking-tighter mb-4">Discover</h2>
        
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-[#312E81] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name or R ID..."
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#312E81] mb-4" size={32} />
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Scanning Network...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
              <Users size={40} />
            </div>
            <h3 className="font-black text-slate-900 italic text-xl tracking-tight">No match found</h3>
            <p className="text-slate-400 text-sm mt-2">Try a different name or 'R' ID to expand your circle.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-24">
            <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              Suggested for you ({filteredUsers.length})
            </p>
            {filteredUsers.map((u) => {
              const isFollowing = me?.following?.includes(u.id);
              const isPending = followProcessing === u.id;

              return (
                <div 
                  key={u.id}
                  onClick={() => setSelectedProfileId(u.id)}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-3xl transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={u.profilePic} 
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100" 
                        alt={u.name}
                      />
                      {isFollowing && (
                        <div className="absolute -top-1 -right-1 bg-green-500 border-2 border-white rounded-full p-0.5 shadow-sm">
                          <UserCheck size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 italic tracking-tight flex items-center">
                        {u.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        ID: {u.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleFollowToggle(e, u.id)}
                      disabled={isPending}
                      className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center space-x-1.5 ${
                        isFollowing 
                          ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                          : 'bg-[#312E81] text-white hover:bg-indigo-900 shadow-lg shadow-indigo-100'
                      }`}
                    >
                      {isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck size={14} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                    <div className="p-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverScreen;
