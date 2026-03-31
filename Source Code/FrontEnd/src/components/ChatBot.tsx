import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isAIReady, setIsAIReady] = useState(false);
  const [model, setModel] = useState<any>(null);

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

  // ✅ Initialize AI
  useEffect(() => {
    if (!apiKey) {
      console.error("API Key Missing");
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const aiModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      setModel(aiModel);
      setIsAIReady(true);
    } catch (error: any) {
      console.error("FULL ERROR:", error);

      let errorMessage = "Unknown error";

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: errorMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, []);

  // ✅ Scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ✅ Send Message
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

    if (!isAIReady || !model) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "AI not ready. Check API key.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
      return;
    }

    try {
      const prompt = `
You are BAYMAX, a healthcare assistant.
Give simple, safe advice.
Always suggest consulting a doctor for serious issues.

User: ${userText}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "bot",
          text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error: any) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          sender: "bot",
          text: "Failed to connect AI. Try again.",
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
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-[#00A99D] text-white rounded-full flex items-center justify-center ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <MessageCircle />
      </button>

      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[380px] bg-white rounded-xl shadow-lg flex flex-col">
          <div className="bg-[#00A99D] p-4 text-white flex justify-between">
            <span>BAYMAX</span>
            <span>{isAIReady ? "AI Online 🟢" : "AI Offline 🔴"}</span>
            <button onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          <div className="p-4 h-[400px] overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-2">
                <b>{msg.sender}:</b> {msg.text}
              </div>
            ))}

            {isTyping && <div>Bot is typing...</div>}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border p-2"
            />
            <button onClick={handleSend}>
              {isTyping ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
