import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import axios from "axios";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I am BAYMAX, your personal healthcare companion. How can I help you today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // ✅ Smooth auto scroll (FIXED)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: userText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message: userText,
      });

      const aiReply =
        res.data?.content ||
        res.data?.message?.content ||
        "No response from AI";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: aiReply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error: any) {
      console.error("Frontend Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text:
            error?.response?.data?.error ||
            "⚠️ Failed to connect AI. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-[#00A99D] text-white rounded-full flex items-center justify-center shadow-lg transition ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <MessageCircle size={26} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
          fixed 
          bottom-6 right-6 
          w-[350px] sm:w-[380px] 
          h-[70vh] max-h-[520px] 
          bg-white 
          rounded-2xl 
          shadow-2xl 
          flex flex-col 
          overflow-hidden 
          z-50"
        >
          {/* Header */}
          <div className="bg-[#00A99D] text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">BAYMAX</h2>
              <p className="text-xs opacity-80">AI Healthcare Assistant 🟢</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 transition z-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages (SCROLL FIXED) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] break-words px-4 py-2 rounded-2xl text-sm shadow ${
                    msg.sender === "user"
                      ? "bg-[#00A99D] text-white rounded-br-none"
                      : "bg-white text-gray-800 border rounded-bl-none"
                  }`}
                >
                  {/* ✅ TEXT FORMATTING FIX */}
                  {msg.text.split("\n").map((line, index) => (
                    <p key={index} className="mb-1 leading-relaxed">
                      {line}
                    </p>
                  ))}

                  <div className="text-[10px] mt-1 opacity-70 text-right">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-white px-4 py-2 rounded-xl shadow text-sm">
                  <Loader2 className="animate-spin inline mr-2" size={14} />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe your symptoms..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A99D]"
            />

            <button
              onClick={handleSend}
              className="bg-[#00A99D] text-white p-2 rounded-full flex items-center justify-center shadow"
            >
              {isTyping ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          {/* ⚠️ Warning Message */}
          <div className="px-3 pb-2 text-xs text-red-500 flex items-center gap-1">
            ⚠️ AI is not 100% accurate. Please consult a doctor.
          </div>
        </div>
      )}
    </>
  );
}
