
import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageCircle, Share, MoreHorizontal, Globe, Send, Loader2, Eye, X, MessageSquare, UserPlus, Users } from 'lucide-react';
import { Post, User, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfilePage from './ProfilePage';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, toggleLike, addComment, getUserById, recordView, createPost, sendPushNotification } = useAuth();
  const { theme } = useTheme();
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareText, setShareText] = useState('');
  const [shareStep, setShareStep] = useState<'options' | 'feed' | 'chat'>('options');
  
  const [postAuthor, setPostAuthor] = useState<User>(post.user);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLiked = user ? (post.likedBy || []).includes(user.id) : false;

  useEffect(() => {
    const freshUser = getUserById(post.user.id);
    if (freshUser) {
      setPostAuthor(freshUser);
    }
  }, [post.user.id, getUserById]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          recordView(post.id);
          observer.disconnect();
        }
      },
      { rootMargin: '0px', threshold: 0.1 } 
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [post.id, recordView]);

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleShareToFeed = async () => {
    if (!user) return;
    setIsSharing(true);
    const sharedContent = shareText.trim() 
      ? `${shareText}\n\n--- Shared from ${postAuthor.name} ---\n${post.content}`
      : `Shared a post from ${postAuthor.name}:\n\n${post.content}`;
    await createPost(sharedContent, post.imageUrl);
    setIsSharing(false);
    setShowShareModal(false);
    setShareText('');
    setShareStep('options');
  };

  const handleSendToChat = (recipient: User) => {
    if (!user) return;
    const messageText = `Check out this post from ${postAuthor.name}: "${post.content.substring(0, 50)}..."`;
    const newMessage: Message = {
      id: `msg_share_${Date.now()}`,
      senderId: user.id,
      receiverId: recipient.id,
      text: messageText,
      timestamp: Date.now(),
    };
    const allMessages = JSON.parse(localStorage.getItem('simulated_firestore_messages') || '[]');
    localStorage.setItem('simulated_firestore_messages', JSON.stringify([...allMessages, newMessage]));
    sendPushNotification(recipient.id, user.name, "Shared a post with you", user.profilePic, { senderId: user.id, type: 'chat_message' });
    setShowShareModal(false);
    setShareStep('options');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(post.id, commentText);
      setCommentText('');
    }
  };

  if (viewingProfileId) {
    return (
      <div className="fixed inset-0 z-[70] bg-white dark:bg-slate-950">
        <ProfilePage targetUserId={viewingProfileId} onBack={() => setViewingProfileId(null)} />
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bg-white dark:bg-slate-900 mb-3 border-y border-gray-100 dark:border-slate-800 shadow-sm sm:border sm:rounded-3xl overflow-hidden transition-all duration-500">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => setViewingProfileId(postAuthor.id)} className="focus:outline-none transition-transform active:scale-90">
            <img 
              src={postAuthor.profilePic} 
              alt={postAuthor.name} 
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800" 
            />
          </button>
          <div className="text-left">
            <button 
              onClick={() => setViewingProfileId(postAuthor.id)}
              className="text-[15px] font-black text-slate-900 dark:text-slate-100 leading-tight hover:text-[#312E81] transition-colors"
            >
              {postAuthor.name}
            </button>
            <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
              <span>{post.time}</span>
              <span className="mx-2 opacity-50">•</span>
              <Globe size={11} className="mr-1" />
              <span>Public</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="px-5 pb-4">
        <p className="text-[16px] text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
          {post.content}
        </p>
      </div>

      {post.imageUrl && (
        <div className="w-full bg-slate-50 dark:bg-slate-950 relative min-h-[300px] overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <Loader2 size={24} className="text-slate-200 dark:text-slate-800 animate-spin" />
            </div>
          )}
          {isInView && (
            <img 
              src={post.imageUrl} 
              alt="Post media" 
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-auto max-h-[600px] object-cover transition-all duration-1000 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            />
          )}
        </div>
      )}

      {/* Modern Interaction Stats */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 group cursor-pointer">
            <div className="bg-[#312E81] p-1.5 rounded-lg shadow-lg shadow-indigo-100 dark:shadow-none">
              <ThumbsUp size={10} className="text-white fill-white" />
            </div>
            <span className="text-[12px] font-black text-slate-900 dark:text-slate-300">{post.likes || 0}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
             <Eye size={14} />
             <span className="text-[11px] font-bold">{post.views || 0}</span>
          </div>
        </div>
        <div className="flex space-x-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-[#312E81] transition-colors">
            {post.comments?.length || 0} Comments
          </button>
          <span>{post.shares || 0} Shares</span>
        </div>
      </div>

      {/* Re-designed Premium Buttons */}
      <div className="flex items-center justify-between p-2 px-4 space-x-2">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center space-x-2.5 py-3 rounded-2xl transition-all active:scale-95 ${
            isLiked 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#312E81] dark:text-indigo-400' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          } font-black uppercase tracking-widest text-[10px]`}
        >
          <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
          <span>Like</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center space-x-2.5 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-[10px]`}
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center space-x-2.5 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <Share size={18} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="px-5 pb-5 pt-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800/50 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 mt-2">
            {post.comments?.map((comment) => (
              <CommentItem key={comment.id} comment={comment} setViewingProfileId={setViewingProfileId} getUserById={getUserById} />
            ))}
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <img src={user?.profilePic} className="w-9 h-9 rounded-xl object-cover border-2 border-white dark:border-slate-800" alt="My Profile" />
            <form onSubmit={handleCommentSubmit} className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-2xl px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition-all">
               <input 
                 type="text" 
                 placeholder="Join the discussion..." 
                 className="flex-1 bg-transparent text-[14px] outline-none py-1 dark:text-slate-200"
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
               />
               <button 
                type="submit" 
                className="ml-2 text-[#312E81] dark:text-indigo-400 disabled:opacity-30 disabled:scale-100 hover:scale-110 transition-transform" 
                disabled={!commentText.trim()}
               >
                 <Send size={18} />
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal Redesign */}
      {showShareModal && (
        <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => shareStep === 'options' ? setShowShareModal(false) : setShareStep('options')} 
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl transition-all"
                >
                  <X size={22} />
                </button>
                <h3 className="font-black italic text-2xl text-slate-900 dark:text-slate-100 tracking-tighter">
                  {shareStep === 'feed' ? 'Broadcast' : shareStep === 'chat' ? 'Direct Message' : 'Share Content'}
                </h3>
              </div>
            </div>

            <div className="p-8">
              {shareStep === 'options' && (
                <div className="space-y-4">
                  <button 
                    onClick={() => setShareStep('feed')}
                    className="w-full flex items-center p-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-[0.98] group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#312E81] dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-none mr-5">
                      <Share size={26} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-slate-100 italic text-lg tracking-tight">Timeline Broadcast</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Visible to all connections</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShareStep('chat')}
                    className="w-full flex items-center p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98] group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#312E81] dark:text-indigo-400 shadow-xl shadow-slate-100/50 dark:shadow-none mr-5">
                      <MessageSquare size={26} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-slate-100 italic text-lg tracking-tight">Direct Message</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">Send to a professional contact</p>
                    </div>
                  </button>
                </div>
              )}

              {shareStep === 'feed' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <img src={user?.profilePic} className="w-12 h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm" />
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100 italic text-lg tracking-tight leading-none">{user?.name}</p>
                      <span className="text-[10px] text-[#312E81] dark:text-indigo-400 font-black uppercase tracking-widest mt-1.5 inline-block">Authorizing Broadcast</span>
                    </div>
                  </div>
                  
                  <textarea 
                    autoFocus
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    placeholder="Add your unique perspective..."
                    className="w-full min-h-[120px] p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 font-medium text-slate-800 dark:text-slate-200 text-lg transition-all"
                  />

                  <button 
                    onClick={handleShareToFeed}
                    disabled={isSharing}
                    className="w-full py-5 bg-[#312E81] text-white rounded-[1.75rem] font-black italic tracking-tighter text-xl shadow-2xl shadow-indigo-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center space-x-3"
                  >
                    {isSharing ? <Loader2 size={24} className="animate-spin" /> : <span>Broadcast Now</span>}
                  </button>
                </div>
              )}

              {shareStep === 'chat' && (
                <div className="space-y-5 max-h-[400px] overflow-y-auto no-scrollbar">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Select Professional Contact</p>
                  <div className="grid grid-cols-1 gap-2">
                    {user?.following?.map(followingId => {
                      const u = getUserById(followingId);
                      if (!u) return null;
                      return (
                        <button 
                          key={u.id}
                          onClick={() => handleSendToChat(u)}
                          className="flex items-center p-4 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all text-left group"
                        >
                          <img src={u.profilePic} className="w-14 h-14 rounded-2xl object-cover mr-5 shadow-sm" />
                          <div className="flex-1">
                             <p className="font-black text-slate-900 dark:text-slate-100 italic text-lg tracking-tight">{u.name}</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{u.city || 'Network Member'}</p>
                          </div>
                          <Send size={20} className="text-slate-200 group-hover:text-[#312E81] group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                    {(!user?.following || user.following.length === 0) && (
                      <div className="py-16 text-center opacity-30">
                         <Users size={48} className="mx-auto mb-4 text-slate-300" />
                         <p className="text-xs font-black uppercase tracking-widest">No connections active</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentItem: React.FC<{ 
  comment: any, 
  setViewingProfileId: (id: string) => void,
  getUserById: (id: string) => User | null
}> = ({ comment, setViewingProfileId, getUserById }) => {
  const [author, setAuthor] = useState<User>(comment.user);

  useEffect(() => {
    const freshUser = getUserById(comment.user.id);
    if (freshUser) {
      setAuthor(freshUser);
    }
  }, [comment.user.id, getUserById]);

  return (
    <div className="flex space-x-3">
      <button onClick={() => setViewingProfileId(author.id)} className="flex-shrink-0 mt-1 focus:outline-none transition-transform active:scale-90">
        <img src={author.profilePic} alt={author.name} className="w-9 h-9 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
      </button>
      <div className="flex-1 text-left">
        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-full shadow-sm border border-slate-100 dark:border-slate-700/50">
          <button 
            onClick={() => setViewingProfileId(author.id)}
            className="text-[13px] font-black text-slate-900 dark:text-slate-100 hover:text-[#312E81] transition-colors block text-left italic"
          >
            {author.name}
          </button>
          <p className="text-[14px] text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex space-x-5 mt-1.5 ml-2">
          <button className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-[#312E81] transition-colors">Like</button>
          <button className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-[#312E81] transition-colors">Reply</button>
          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-widest">{comment.time}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
