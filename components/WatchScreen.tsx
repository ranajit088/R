
import React, { useState } from 'react';
import { Play, ThumbsUp, MessageSquare, Share2, MoreHorizontal, Eye, Plus, X, Upload, Loader2, Video as VideoIcon, Bookmark, BookmarkCheck } from 'lucide-react';
import { Video } from '../types';
import { useAuth } from '../context/AuthContext';

const WatchScreen: React.FC = () => {
  const { videos } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="bg-slate-950 min-h-screen pb-24">
      <div className="sticky top-14 z-20 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-2xl font-[900] text-white italic tracking-tighter">Watch</h2>
        <div className="flex items-center space-x-4">
           <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/10 transition-all active:scale-95"
           >
             <Plus size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest">Post Video</span>
           </button>
           <div className="hidden sm:flex items-center space-x-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Network</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col">
        {videos.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center px-12">
            <VideoIcon size={48} className="text-slate-800 mb-4 opacity-20" />
            <h3 className="text-white font-black text-xl italic tracking-tight">No broadcasts yet</h3>
            <p className="text-slate-500 text-xs mt-2 uppercase font-bold tracking-widest">Be the first to share content</p>
          </div>
        ) : (
          videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))
        )}
      </div>

      {isUploadModalOpen && <VideoUploadModal onClose={() => setIsUploadModalOpen(false)} />}
    </div>
  );
};

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function to convert regular FB watch URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('facebook.com/plugins/video.php')) return url;
    const encodedUrl = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&t=0`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate Firestore write
    await new Promise(resolve => setTimeout(resolve, 800));
    const savedItems = JSON.parse(localStorage.getItem('simulated_firestore_bookmarks') || '[]');
    if (!isSaved) {
      localStorage.setItem('simulated_firestore_bookmarks', JSON.stringify([...savedItems, { videoId: video.id, userId: user?.id }]));
      setIsSaved(true);
    } else {
      localStorage.setItem('simulated_firestore_bookmarks', JSON.stringify(savedItems.filter((i: any) => i.videoId !== video.id)));
      setIsSaved(false);
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Check out this broadcast on R: ${video.description}`,
          url: video.videoUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="bg-slate-900 mb-2 border-y border-white/5 overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img src={video.author.profilePic} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
          <div>
            <h4 className="text-white font-black italic tracking-tight text-sm">{video.author.name}</h4>
            <div className="flex items-center text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
              <span>{video.time}</span>
              <span className="mx-1.5">•</span>
              <Eye size={10} className="mr-1" />
              <span>{video.views} views</span>
            </div>
          </div>
        </div>
        <button className="text-white/40 hover:text-white p-2">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Video Player Section with Responsive 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-video bg-black group overflow-hidden">
        {!isPlaying ? (
          <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => setIsPlaying(true)}>
            <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" alt="" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-2xl">
                <Play size={32} className="text-white fill-white ml-1" />
              </div>
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
          </div>
        ) : (
          <iframe 
            src={getEmbedUrl(video.videoUrl)} 
            className="absolute top-0 left-0 w-full h-full border-none"
            style={{ overflow: 'hidden' }} 
            scrolling="no" 
            frameBorder="0" 
            allowFullScreen={true} 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-black italic text-lg tracking-tight mb-2">{video.title}</h3>
        <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">
          {video.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex space-x-6">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-2 transition-all active:scale-95 ${isSaved ? 'text-indigo-400' : 'text-white/60 hover:text-white'}`}
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isSaved ? (
                <BookmarkCheck size={20} className="fill-current" />
              ) : (
                <Bookmark size={20} />
              )}
              <span className="text-xs font-black italic">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
              <MessageSquare size={20} />
              <span className="text-xs font-black italic">Discuss</span>
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors active:scale-95"
          >
            <Share2 size={20} />
            <span className="text-xs font-black italic">Broadcast</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoUploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createVideo } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      setError('Title and Video URL are required');
      return;
    }
    
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await createVideo({
        title,
        description,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${Date.now()}/800/450`
      });
      onClose();
    } catch (err) {
      setError('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
               <VideoIcon size={20} />
             </div>
             <h3 className="text-xl font-black text-white italic tracking-tighter">Broadcast to R</h3>
           </div>
           <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>

        <form onSubmit={handleUpload} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Video Title</label>
            <input 
              type="text" 
              placeholder="Headline..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              placeholder="What is this about?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Facebook Video URL</label>
            <input 
              type="text" 
              placeholder="https://facebook.com/watch/?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[11px] font-bold uppercase tracking-wider">{error}</p>}

          <button 
            type="submit"
            disabled={isUploading}
            className="w-full py-5 bg-white text-slate-900 rounded-[1.5rem] font-black italic tracking-tighter text-lg flex items-center justify-center space-x-3 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-indigo-500/10"
          >
            {isUploading ? <Loader2 size={24} className="animate-spin" /> : (
              <>
                <Upload size={24} />
                <span>Publish</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WatchScreen;
