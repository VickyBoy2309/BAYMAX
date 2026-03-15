import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini (Only works if VITE_GEMINI_API_KEY is defined in .env)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: 'Hello! I am BAYMAX, your personal healthcare companion. How can I help you today?', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }
  ]);

  const [chatSession, setChatSession] = useState<any>(null);

  // Initialize the Gemini Chat Session
  useEffect(() => {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          systemInstruction: "You are BAYMAX, a personal healthcare companion. You are empathetic, helpful, clear, and concise. You provide general health advice and information but always remind users to consult a real doctor for serious issues. Do not use markdown headers, keep text simple."
        });
        const chat = model.startChat({
          history: [],
          generationConfig: { maxOutputTokens: 200 }
        });
        setChatSession(chat);
      } catch (err) {
        console.error("Failed to initialize Gemini:", err);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Check if API key exists
    if (!genAI || !chatSession) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'I am currently offline. Please add your VITE_GEMINI_API_KEY to the .env file to enable my AI capabilities!',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const result = await chatSession.sendMessage(userText);
      const botResponse = result.response.text();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to my neural network right now. Please try again later.',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className={`fixed bottom-8 right-8 w-16 h-16 bg-[#00A99D] text-white rounded-full shadow-[0_8px_20px_-4px_rgba(0,169,157,0.5)] flex items-center justify-center hover:bg-teal-600 hover:scale-105 transition-all z-40 group ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-7 h-7 group-hover:animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#00A99D] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold tracking-wide">BAYMAX Support</h3>
                <p className="text-teal-100 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span> 
                  {genAI ? "AI Online" : "AI Offline"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-slate-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse gap-2' : 'mr-auto gap-2'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white shadow-sm ${msg.sender === 'bot' ? 'bg-[#00A99D]' : 'bg-blue-600'}`}>
                  {msg.sender === 'bot' ? <Bot className="w-5 h-5" /> : (user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />)}
                </div>
                
                {/* Bubble */}
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 text-sm shadow-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>

              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex max-w-[85%] mr-auto gap-2">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white bg-[#00A99D] shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1.5 h-[42px]">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask Baymax..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D] disabled:opacity-50 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-[#00A99D] text-white p-2.5 rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-[#00A99D] transition-colors flex-shrink-0 shadow-sm"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
