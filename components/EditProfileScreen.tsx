
import React, { useState } from 'react';
import { Camera, ChevronLeft, Save, MapPin, AlignLeft, User as UserIcon, Bell, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EditProfileScreenProps {
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack }) => {
  const { user, updateProfile, requestNotificationPermission } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [tempPic, setTempPic] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPermLoading, setIsPermLoading] = useState(false);

  const handleImagePick = async () => {
    const randomId = Math.floor(Math.random() * 1000);
    const mockUrl = `https://picsum.photos/id/${randomId}/400/400`;
    setTempPic(mockUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        bio,
        city,
        profilePic: tempPic || user?.profilePic
      });
      onBack();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsPermLoading(true);
    const success = await requestNotificationPermission();
    setIsPermLoading(false);
    if (success) {
      alert("Push notifications enabled successfully!");
    } else {
      alert("Please enable notification permissions in your browser settings.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-right duration-300 max-w-xl mx-auto">
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold ml-2">Edit Profile</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="text-[#312E81] font-bold text-sm hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} />
              <span>Save</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={tempPic || user?.profilePic} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
              alt="Profile" 
            />
            <button 
              onClick={handleImagePick}
              className="absolute bottom-0 right-0 bg-[#312E81] p-2.5 rounded-full border-2 border-white shadow-md text-white hover:bg-indigo-900 transition-colors"
            >
              <Camera size={20} />
            </button>
          </div>
          <p className="mt-2 text-xs font-bold text-[#312E81] uppercase tracking-wider">Change Profile Picture</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center">
              <UserIcon size={14} className="mr-2" /> Full Name
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] outline-none transition-all font-medium"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center">
              <AlignLeft size={14} className="mr-2" /> Bio
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] outline-none transition-all font-medium min-h-[100px] resize-none"
              placeholder="Describe who you are..."
            />
          </div>

          {/* Notification Settings Section */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center">
              <Bell size={14} className="mr-2" /> Connectivity
            </label>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${user?.fcmToken ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 italic">Push Notifications</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {user?.fcmToken ? 'Enabled on this device' : 'Currently disabled'}
                  </p>
                </div>
              </div>
              {!user?.fcmToken && (
                <button 
                  onClick={handleEnableNotifications}
                  disabled={isPermLoading}
                  className="bg-[#312E81] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg active:scale-95 transition-all"
                >
                  {isPermLoading ? <Loader2 size={14} className="animate-spin" /> : 'Enable'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center">
              <MapPin size={14} className="mr-2" /> Current City
            </label>
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-[#312E81] outline-none transition-all font-medium"
              placeholder="e.g. San Francisco, CA"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
           <div className="bg-indigo-50 p-4 rounded-xl flex items-start space-x-3">
              <div className="bg-[#312E81] p-1 rounded-full mt-0.5">
                 <UserIcon size={14} className="text-white" />
              </div>
              <div>
                 <p className="text-xs font-bold text-indigo-900">Public Profile</p>
                 <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">Your professional identity is visible to the entire R network. Push tokens are stored securely.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;
