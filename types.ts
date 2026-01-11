
export interface User {
  id: string;
  name: string;
  profilePic: string;
  bio?: string;
  city?: string;
  followers?: string[]; // Array of user IDs
  following?: string[]; // Array of user IDs
  fcmToken?: string;
}

export interface Comment {
  id: string;
  postId: string;
  user: User;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  user: User;
  time: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedBy: string[]; // Track user IDs who liked
  comments: Comment[]; // Simulated sub-collection
  shares: number;
  views?: number; 
  timestamp?: number;
}

export interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: User;
  views: string;
  time: string;
  description: string;
}

export interface Notification {
  id: string;
  toUserId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserProfilePic: string;
  type: 'like' | 'follow' | 'comment';
  postId?: string; // Optional, only for like/comment
  timestamp: number;
  isRead: boolean;
}

export interface Story {
  id: string;
  user: User;
  imageUrl: string;
  isAddStory?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}
