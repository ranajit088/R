
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, MoreVertical, Phone, Video, Camera, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, Message } from '../types';

interface ChatRoomProps {
  recipient: User;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ recipient, onBack }) => {
  const { user: me, setActiveChatRecipientId, sendPushNotification } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Notify the context that we are now in a chat with this recipient
    // This allows the notification system to suppress alerts for this user
    setActiveChatRecipientId(recipient.id);
    
    // Cleanup when leaving the room
    return () => {
      setActiveChatRecipientId(null);
    };
  }, [recipient.id, setActiveChatRecipientId]);

  useEffect(() => {
    const loadMessages = () => {
      const allMessages: Message[] = JSON.parse(localStorage.getItem('simulated_firestore_messages') || '[]');
      const filtered = allMessages.filter(m => 
        (m.senderId === me?.id && m.receiverId === recipient.id) ||
        (m.senderId === recipient.id && m.receiverId === me?.id)
      ).sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(filtered);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 1500); 
    return () => clearInterval(interval);
  }, [me?.id, recipient.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !me) return;

    const textToSubmit = inputText.trim();
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: me.id,
      receiverId: recipient.id,
      text: textToSubmit,
      timestamp: Date.now(),
    };

    // 1. SAVE TO MESSAGES COLLECTION (Simulated Firestore)
    const allMessages = JSON.parse(localStorage.getItem('simulated_firestore_messages') || '[]');
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('simulated_firestore_messages', JSON.stringify(updatedMessages));
    
    // 2. TRIGGER PUSH NOTIFICATION (Simulated FCM)
    // We send this as if we are the server detecting a new message for 'recipient'
    // The sendPushNotification logic handles suppressing it if they are already in the room.
    sendPushNotification(
      recipient.id, 
      me.name, 
      textToSubmit, 
      me.profilePic,
      { senderId: me.id, type: 'chat_message' }
    );
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-50 flex flex-col max-w-xl mx-auto animate-in slide-in-from-right duration-300 shadow-2xl">
      {/* Premium Chat Header */}
      <div className="h-18 flex items-center justify-between px-4 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img src={recipient.profilePic} className="w-full h-full object-cover" alt={recipient.name} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-slate-900 leading-none italic tracking-tight text-[17px]">{recipient.name}</h3>
            <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em] mt-1">Active Now</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2.5 text-slate-400 hover:text-[#312E81] hover:bg-indigo-50 rounded-xl transition-all"><Phone size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-[#312E81] hover:bg-indigo-50 rounded-xl transition-all"><Video size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl transition-all"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 px-10 text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-[2rem] flex items-center justify-center mb-4">
              <Mic size={24} />
            </div>
            <p className="text-sm font-black italic text-slate-900 uppercase tracking-widest">No history yet</p>
            <p className="text-xs text-slate-500 mt-2">Say hello to {recipient.name.split(' ')[0]} to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === me?.id;
            const showTime = idx === 0 || msg.timestamp - messages[idx-1].timestamp > 300000; 

            return (
              <div key={msg.id} className="flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-500">
                {showTime && (
                  <div className="text-center my-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <img src={recipient.profilePic} className="w-7 h-7 rounded-lg object-cover mr-2 self-end mb-1 opacity-50" alt="" />
                  )}
                  <div className={`max-w-[75%] px-4 py-3 text-[15px] font-medium shadow-sm transition-all hover:shadow-md ${
                    isMe 
                      ? 'bg-[#312E81] text-white rounded-[1.5rem] rounded-br-none shadow-indigo-100' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-[1.5rem] rounded-bl-none shadow-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Modern Professional Input Bar */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex space-x-1 pr-1 border-r border-slate-100">
             <button type="button" className="p-2 text-slate-400 hover:text-[#312E81] transition-colors"><Camera size={20} /></button>
          </div>
          
          <div className="flex-1 relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message..."
              className="w-full bg-slate-100 border-none outline-none rounded-2xl px-5 py-3.5 text-[15px] font-medium focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400"
            />
          </div>

          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3.5 rounded-2xl shadow-lg transition-all active:scale-90 ${
              inputText.trim() 
                ? 'bg-[#312E81] text-white shadow-indigo-200 rotate-0' 
                : 'bg-slate-100 text-slate-300 shadow-none'
            }`}
          >
            <Send size={22} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
