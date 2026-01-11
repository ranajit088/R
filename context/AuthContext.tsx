
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Comment, Notification as AppNotification, Message, Video } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  posts: Post[];
  videos: Video[];
  notifications: AppNotification[];
  activeChatRecipientId: string | null;
  setActiveChatRecipientId: (id: string | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  createPost: (content: string, imageUrl?: string) => Promise<void>;
  createVideo: (videoData: Omit<Video, 'id' | 'author' | 'views' | 'time'>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  getUserById: (uid: string) => User | null;
  requestNotificationPermission: () => Promise<boolean>;
  recordView: (postId: string) => Promise<void>;
  markNotificationsAsRead: () => void;
  sendPushNotification: (targetUserId: string, title: string, body: string, icon?: string, data?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeChatRecipientId, setActiveChatRecipientId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('fb_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('fb_user');
        }
      }
      loadPosts();
      loadVideos();
      loadNotifications();
      setTimeout(() => setLoading(false), 1200);
    };
    initAuth();
  }, []);

  const loadPosts = () => {
    const savedPosts = JSON.parse(localStorage.getItem('simulated_firestore_posts') || '[]');
    const sorted = [...savedPosts].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
    setPosts(sorted);
  };

  const loadVideos = () => {
    const savedVideos = JSON.parse(localStorage.getItem('simulated_firestore_videos') || '[]');
    // Mock initial videos if none exist
    if (savedVideos.length === 0) {
      const initial = [
        {
          id: 'v1',
          title: 'Future of Decentralized Networking',
          videoUrl: 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=false&width=560&t=0',
          thumbnailUrl: 'https://picsum.photos/id/1/800/450',
          author: { id: 'a1', name: 'R Tech Insights', profilePic: 'https://ui-avatars.com/api/?name=R+Tech&background=312E81&color=fff' },
          views: '1.2M',
          time: '2 hours ago',
          description: 'Exploring how R is redefining the way professionals connect across the globe.'
        }
      ];
      setVideos(initial);
      localStorage.setItem('simulated_firestore_videos', JSON.stringify(initial));
    } else {
      setVideos(savedVideos);
    }
  };

  const createVideo = async (videoData: Omit<Video, 'id' | 'author' | 'views' | 'time'>) => {
    if (!user) return;
    const newVideo: Video = {
      ...videoData,
      id: `vid_${Date.now()}`,
      author: user,
      views: '0',
      time: 'Just now'
    };
    const currentVideos = JSON.parse(localStorage.getItem('simulated_firestore_videos') || '[]');
    const updated = [newVideo, ...currentVideos];
    localStorage.setItem('simulated_firestore_videos', JSON.stringify(updated));
    setVideos(updated);
  };

  const loadNotifications = () => {
    const savedNotifications = JSON.parse(localStorage.getItem('simulated_firestore_notifications') || '[]');
    setNotifications(savedNotifications.sort((a: any, b: any) => b.timestamp - a.timestamp));
  };

  const sendLocalNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
      });
    }
  };

  const sendPushNotification = async (targetUserId: string, title: string, body: string, icon?: string, data?: any) => {
    const target = getUserById(targetUserId);
    if (!target) return;
    if (targetUserId === user?.id && activeChatRecipientId === data?.senderId) {
      return;
    }
    sendLocalNotification(title, body, icon);
  };

  const createNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    if (notif.toUserId === user?.id) return;
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      isRead: false
    };
    const current = JSON.parse(localStorage.getItem('simulated_firestore_notifications') || '[]');
    const updated = [newNotif, ...current];
    localStorage.setItem('simulated_firestore_notifications', JSON.stringify(updated));
    setNotifications(updated);
    const message = notif.type === 'like' ? 'liked your post' : 
                   notif.type === 'comment' ? 'commented on your post' : 
                   'started following you';
    sendLocalNotification('R Network Update', `${notif.fromUserName} ${message}`, notif.fromUserProfilePic);
  };

  const markNotificationsAsRead = () => {
    const current = JSON.parse(localStorage.getItem('simulated_firestore_notifications') || '[]');
    const updated = current.map((n: AppNotification) => ({ ...n, isRead: true }));
    localStorage.setItem('simulated_firestore_notifications', JSON.stringify(updated));
    setNotifications(updated);
  };

  const getUserById = (uid: string): User | null => {
    const users = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
    const found = users.find((u: any) => u.id === uid);
    if (!found) return null;
    return { ...found };
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== pass) {
      setLoading(false);
      throw new Error('Invalid email or password');
    }
    const authUser: User = { ...found };
    setUser(authUser);
    localStorage.setItem('fb_user', JSON.stringify(authUser));
    setLoading(false);
  };

  const signUp = async (name: string, email: string, pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const users = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      throw new Error('This email is already registered.');
    }
    const uid = 'u_' + Math.random().toString(36).substr(2, 9);
    const fcmToken = 'fcm_' + Math.random().toString(36).substr(2, 12);
    const newUser = { id: uid, name, email, password: pass, profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=312E81&color=fff&size=256`, followers: [], following: [], fcmToken };
    users.push(newUser);
    localStorage.setItem('simulated_firestore_users', JSON.stringify(users));
    setUser(newUser as any);
    localStorage.setItem('fb_user', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fb_user');
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!user || user.id === targetUserId) return;
    const users = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
    const isFollowing = (user.following || []).includes(targetUserId);
    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        const following = u.following || [];
        return { ...u, following: isFollowing ? following.filter((id: string) => id !== targetUserId) : [...following, targetUserId] };
      }
      if (u.id === targetUserId) {
        const followers = u.followers || [];
        return { ...u, followers: isFollowing ? followers.filter((id: string) => id !== user.id) : [...followers, user.id] };
      }
      return u;
    });
    localStorage.setItem('simulated_firestore_users', JSON.stringify(updatedUsers));
    const updatedMe = updatedUsers.find((u: any) => u.id === user.id);
    setUser(updatedMe);
    localStorage.setItem('fb_user', JSON.stringify(updatedMe));
    if (!isFollowing) {
      createNotification({
        toUserId: targetUserId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserProfilePic: user.profilePic,
        type: 'follow'
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const currentPosts = JSON.parse(localStorage.getItem('simulated_firestore_posts') || '[]');
    const updatedPosts = currentPosts.map((p: Post) => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        const isLiked = likedBy.includes(user.id);
        const newLikedBy = isLiked ? likedBy.filter(id => id !== user.id) : [...likedBy, user.id];
        if (!isLiked) {
          createNotification({
            toUserId: p.user.id,
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserProfilePic: user.profilePic,
            type: 'like',
            postId: p.id
          });
        }
        return { ...p, likedBy: newLikedBy, likes: newLikedBy.length };
      }
      return p;
    });
    localStorage.setItem('simulated_firestore_posts', JSON.stringify(updatedPosts));
    loadPosts();
  };

  const addComment = async (postId: string, text: string) => {
    if (!user || !text.trim()) return;
    const currentPosts = JSON.parse(localStorage.getItem('simulated_firestore_posts') || '[]');
    const newComment: Comment = { id: Date.now().toString(), postId, user: { ...user }, text, time: 'Just now' };
    const updatedPosts = currentPosts.map((p: Post) => {
      if (p.id === postId) {
        createNotification({
          toUserId: p.user.id,
          fromUserId: user.id,
          fromUserName: user.name,
          fromUserProfilePic: user.profilePic,
          type: 'comment',
          postId: p.id
        });
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    });
    localStorage.setItem('simulated_firestore_posts', JSON.stringify(updatedPosts));
    loadPosts();
  };

  const recordView = async (postId: string) => {
    const currentPosts = JSON.parse(localStorage.getItem('simulated_firestore_posts') || '[]');
    const updatedPosts = currentPosts.map((p: Post) => p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p);
    localStorage.setItem('simulated_firestore_posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
  };

  const createPost = async (content: string, imageUrl?: string) => {
    if (!user) return;
    const now = Date.now();
    const newPost: Post = { id: now.toString(), user: { ...user }, time: 'Just now', content, imageUrl, likes: 0, likedBy: [], comments: [], shares: 0, views: 0, timestamp: now };
    const currentPosts = JSON.parse(localStorage.getItem('simulated_firestore_posts') || '[]');
    localStorage.setItem('simulated_firestore_posts', JSON.stringify([...currentPosts, newPost]));
    loadPosts();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('simulated_firestore_users') || '[]');
    const updatedUsers = users.map((u: any) => u.id === user.id ? { ...u, ...updates } : u);
    localStorage.setItem('simulated_firestore_users', JSON.stringify(updatedUsers));
    const newUserData = { ...user, ...updates };
    setUser(newUserData);
    localStorage.setItem('fb_user', JSON.stringify(newUserData));
    loadPosts();
  };

  const refreshFeed = async () => { loadPosts(); loadNotifications(); loadVideos(); };

  const requestNotificationPermission = async () => { 
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, posts, videos, notifications, activeChatRecipientId, setActiveChatRecipientId,
      login, signUp, logout, createPost, createVideo, toggleLike, addComment, refreshFeed, 
      updateProfile, toggleFollow, getUserById, requestNotificationPermission, 
      recordView, markNotificationsAsRead, sendPushNotification 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
