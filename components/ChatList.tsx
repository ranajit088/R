
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit3, MessageSquarePlus, Plus, UserSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, Message } from '../types';
import ChatRoom from './ChatRoom';
import DiscoverScreen from './DiscoverScreen';

const ChatList: React.FC = () => {
  const { user: me, getUserById } = useAuth();
  const [conversations, setConversations] = useState<{user: User, lastMessage: Message}[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [isSearchingNewChat, setIsSearchingNewChat] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const loadConversations = () => {
      if (!me) return;
      
      const allMessages: Message[] = JSON.parse(localStorage.getItem('simulated_firestore_messages') || '[]');
      const userConvos = new Map<string, Message>();

      // Group messages by the "other" person in the chat
      allMessages.forEach(msg => {
        if (msg.senderId === me.id || msg.receiverId === me.id) {
          const otherId = msg.senderId === me.id ? msg.receiverId : msg.senderId;
          const current = userConvos.get(otherId);
          if (!current || msg.timestamp > current.timestamp) {
            userConvos.set(otherId, msg);
          }
        }
      });

      const convos = Array.from(userConvos.entries()).map(([userId, lastMsg]) => {
        const u = getUserById(userId);
        return u ? { user: u, lastMessage: lastMsg } : null;
      }).filter(Boolean) as {user: User, lastMessage: Message}[];

      // Sort by latest message first
      setConversations(convos.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp));
    };

    loadConversations();
    // Simulate real-time updates from Firestore
    const interval = setInterval(loadConversations, 2000);
    return () => clearInterval(interval);
  }, [me?.id, getUserById]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.user.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [conversations, searchFilter]);

  if (selectedRecipient) {
    return <ChatRoom recipient={selectedRecipient} onBack={() => setSelectedRecipient(null)} />;
  }

  if (isSearchingNewChat) {
    return (
      <div className="fixed inset-0 z-[110] bg-white">
        <div className="flex items-center px-4 h-16 border-b border-slate-100">
           <button onClick={() => setIsSearchingNewChat(false)} className="p-2 -ml-2 text-slate-600">
             <Plus size={24} className="rotate-45" />
           </button>
           <h2 className="ml-2 font-black italic text-xl tracking-tighter">New Message</h2>
        </div>
        <DiscoverScreen />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative flex flex-col">
      {/* Messenger-style Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
             <img src={me?.profilePic} className="w-10 h-10 rounded-full border border-slate-100 object-cover" alt="Me" />
             <h2 className="text-3xl font-[900] text-slate-900 italic tracking-tighter">Chats</h2>
          </div>
          <div className="flex space-x-2">
            <button className="p-2.5 bg-slate-100 rounded-full text-slate-800 hover:bg-slate-200 transition-colors">
              <Search size={20} strokeWidth={2.5} />
            </button>
            <button onClick={() => setIsSearchingNewChat(true)} className="p-2.5 bg-slate-100 rounded-full text-slate-800 hover:bg-slate-200 transition-colors">
              <Edit3 size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Professional Search Input */}
        <div className="relative group mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search messages" 
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-11 pr-4 text-[15px] font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400" 
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-200 border border-slate-100 shadow-inner">
              <MessageSquarePlus size={36} />
            </div>
            <h3 className="font-black text-slate-900 italic text-xl tracking-tight">No conversations yet</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-[240px]">Messages from your network will appear here. Start a conversation with a colleague.</p>
            <button 
              onClick={() => setIsSearchingNewChat(true)}
              className="mt-8 px-8 py-3 bg-[#312E81] text-white rounded-2xl font-black italic tracking-tight text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all"
            >
              Send Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredConversations.map((convo) => (
              <button 
                key={convo.user.id}
                onClick={() => setSelectedRecipient(convo.user)}
                className="w-full flex items-center px-5 py-3.5 hover:bg-slate-50 transition-all active:bg-slate-100 text-left group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transform group-hover:scale-105 transition-transform duration-300">
                    <img src={convo.user.profilePic} className="w-full h-full object-cover" alt={convo.user.name} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full shadow-sm"></div>
                </div>
                
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-black text-slate-900 italic tracking-tight text-base truncate pr-2">
                      {convo.user.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      {formatChatTime(convo.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[14px] truncate flex-1 pr-6 ${
                      convo.lastMessage.senderId !== me?.id ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
                    }`}>
                      {convo.lastMessage.senderId === me?.id ? 'You: ' : ''}
                      {convo.lastMessage.text}
                    </p>
                    {convo.lastMessage.senderId !== me?.id && (
                       <div className="w-2.5 h-2.5 bg-[#312E81] rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsSearchingNewChat(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#312E81] text-white rounded-2xl shadow-2xl shadow-indigo-200 flex items-center justify-center active:scale-90 transition-all z-40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
};

// Helper to format timestamps for the chat list
const formatChatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default ChatList;
