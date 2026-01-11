
import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, Smile, Sparkles, AlertCircle, X, Globe, Loader2, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from '@google/genai';

interface PostCreationBoxProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const PostCreationBox: React.FC<PostCreationBoxProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { user, createPost } = useAuth();
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  // Use useMemo to ensure AI client is stable across renders
  const ai = useMemo(() => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, []);

  const handlePost = async () => {
    if (!text.trim() && !attachedImage) return;
    if (!ai) {
      setError("AI Services are currently unavailable. Please try again later.");
      return;
    }
    
    setIsPosting(true);
    setError(null);

    try {
      const moderationResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this social media post for hate speech, bullying, or harassment: "${text}"`,
        config: {
          systemInstruction: "You are a content safety expert. Respond ONLY with 'REJECT' if the content contains hate speech, bullying, or severe negativity. Respond ONLY with 'ALLOW' if it is safe for a general social media audience.",
        }
      });

      const moderationResult = moderationResponse.text?.trim().toUpperCase();
      
      if (moderationResult === 'REJECT') {
        setError("This post violates our Community Standards. Please adjust your message.");
        setIsPosting(false);
        return;
      }

      await createPost(text, attachedImage || undefined);
      
      setText('');
      setAttachedImage(null);
      setAiSuggestions([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Post Creation Error:", err);
      setError("Failed to share post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const simulateImagePicker = async () => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomImg = `https://picsum.photos/seed/${Math.random()}/800/1000`;
    setAttachedImage(randomImg);
    setIsUploading(false);
    if (!text) generateAutoCaptions(randomImg);
  };

  const generateAiImage = async () => {
    if (!imagePrompt.trim() || !ai) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let foundImage = false;
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            setAttachedImage(`data:image/png;base64,${base64Data}`);
            foundImage = true;
            break;
          }
        }
      }

      if (foundImage) {
        setShowImageGen(false);
        setImagePrompt('');
        if (!text) generateAutoCaptions();
      } else {
        setError("AI could not generate an image for this prompt. Try being more descriptive.");
      }
    } catch (err) {
      console.error("Image Generation Error:", err);
      setError("Image generation failed. This might be due to safety filters or service availability.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateAutoCaptions = async (imageUrl?: string) => {
    if (!ai) return;
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const promptText = imageUrl 
        ? "Generate 3 short, creative professional network captions for an image." 
        : text 
          ? `Generate 3 creative variations of this post: "${text}"`
          : "Generate 3 interesting status updates for a social media post.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: promptText,
        config: {
          systemInstruction: "Return exactly 3 different captions, separated by '|'. No hashtags. Maximum 12 words per caption. Style: Casual, engaging, and friendly.",
        }
      });

      const suggestions = response.text?.split('|').map(s => s.trim()) || [];
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error("Gemini Caption Generation Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-4 mb-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profilePic} 
            alt="My Profile" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-gray-600 transition-colors font-medium text-sm"
          >
            What's on your mind, {user?.name.split(' ')[0]}?
          </button>
          <div className="p-2 text-indigo-500">
            <Sparkles size={24} onClick={() => { setIsModalOpen(true); setShowImageGen(true); }} className="cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300 max-w-xl mx-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
            <div className="flex items-center">
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-700 hover:bg-slate-50 rounded-full">
                <X size={24} />
              </button>
              <h2 className="text-lg font-bold ml-2">Create post</h2>
            </div>
            <button 
              onClick={handlePost}
              disabled={(!text.trim() && !attachedImage) || isPosting || isUploading || isGeneratingImage}
              className={`px-6 py-1.5 rounded-lg font-bold text-sm transition-all flex items-center space-x-2 ${
                (!text.trim() && !attachedImage) || isPosting || isUploading || isGeneratingImage
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-[#0F172A] text-white active:scale-95 shadow-md shadow-slate-200'
              }`}
            >
              {isPosting && <Loader2 size={16} className="animate-spin" />}
              <span>{isPosting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            <div className="flex items-center space-x-3 mb-6">
              <img src={user?.profilePic} className="w-12 h-12 rounded-full border border-gray-100 shadow-sm" />
              <div>
                <p className="font-bold text-gray-900 leading-tight">{user?.name}</p>
                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-md mt-1 w-fit">
                  <Globe size={11} className="text-gray-600" />
                  <span className="text-[11px] font-bold text-gray-600">Public</span>
                </div>
              </div>
            </div>

            <textarea
              autoFocus
              placeholder={`What's on your mind, ${user?.name.split(' ')[0]}?`}
              className="w-full text-xl text-gray-800 outline-none resize-none placeholder-gray-400 min-h-[120px] mb-4 font-medium"
              value={text}
              disabled={isPosting}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
            />

            {/* AI Image Generation Overlay */}
            {showImageGen && (
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black text-indigo-800 flex items-center uppercase tracking-wider">
                     <Wand2 size={18} className="mr-2" /> AI Image Generator
                   </h3>
                   <button onClick={() => setShowImageGen(false)} className="text-slate-400 hover:text-slate-600">
                     <X size={18} />
                   </button>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Describe the image you want..." 
                    className="w-full p-4 pr-12 bg-white rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-sm shadow-sm font-medium"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateAiImage()}
                  />
                  <button 
                    onClick={generateAiImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="w-full h-48 bg-gray-50 rounded-2xl flex flex-col items-center justify-center space-y-3 border-2 border-dashed border-gray-200 animate-pulse">
                <Loader2 size={32} className="text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-500 font-bold">Uploading to Storage...</span>
              </div>
            )}

            {attachedImage && !isUploading && (
              <div className="relative rounded-2xl overflow-hidden mt-2 group animate-in zoom-in-95 duration-200">
                <img src={attachedImage} alt="Post preview" className="w-full object-contain max-h-[350px] bg-black/5 rounded-2xl shadow-sm" />
                {!isPosting && (
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm">Action Required</p>
                  <p className="text-xs leading-relaxed opacity-90">{error}</p>
                </div>
              </div>
            )}

            {aiSuggestions.length > 0 && !isPosting && (
              <div className="mt-8 space-y-3 pb-6">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                    <Sparkles size={14} className="mr-1.5" /> Gemini Suggestions
                  </p>
                </div>
                <div className="grid gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setText(suggestion)}
                      className="text-sm bg-indigo-50 text-indigo-800 p-4 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all text-left italic font-medium shadow-sm active:scale-[0.98]"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Tools */}
          <div className={`border-t border-gray-200 p-4 bg-white ${isPosting ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 shadow-inner">
                <span className="text-sm font-bold text-slate-700">Add to your post</span>
                <div className="flex space-x-5">
                   <button onClick={simulateImagePicker} className="text-emerald-500 hover:scale-125 transition-transform"><ImageIcon size={24} /></button>
                   <button onClick={() => setShowImageGen(!showImageGen)} className="text-indigo-600 hover:scale-125 transition-transform"><Wand2 size={24} /></button>
                   <button 
                    onClick={() => generateAutoCaptions(attachedImage || undefined)} 
                    disabled={isAiLoading}
                    className="text-slate-600 hover:scale-125 transition-transform"
                   >
                     {isAiLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCreationBox;
