import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_DATA } from '../../constants';

import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'model', text: 'Hi there! Welcome to Ghar Ka Swaad. How can I help you today? Do you have questions about our menu, plans, or delivery?' }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const contents = newHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      const pricingInfo = BRAND_DATA.plans.map(p => `${p.name}: ₹${p.price_per_meal}/meal, ₹${p.monthly_price}/month`).join(', ');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `You are a helpful customer support AI for 'Ghar Ka Swaad', a home-cooked tiffin service in Nagpur. Be polite, concise, and helpful. You help users with FAQs, plans, pricing (${pricingInfo}), delivery times, and menu queries. Focus on providing relevant brief answers without making up details.`,
          temperature: 0.7,
        }
      });
      
      if (response.text) {
        setMessages([...newHistory, { role: 'model', text: response.text }]);
      } else {
        setMessages([...newHistory, { role: 'model', text: "Hmm, I didn't quite get that. Could you try rephrasing?" }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...newHistory, { role: 'model', text: "I'm having a little trouble connecting right now. Can you try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const faqs = [
    "What are your plans?",
    "Where do you deliver?",
    "How to cancel a subscription?"
  ];

  return (
    <div className="relative">
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-4 bg-orange-600 text-white rounded-full shadow-2xl hover:bg-orange-700 transition-colors flex items-center justify-center group hover:scale-110 active:scale-95"
      >
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md hidden sm:block">
          AI Assistant
        </span>
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 sm:right-6 w-[calc(100vw-40px)] sm:w-[350px] h-[450px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-orange-600 text-white p-3 sm:p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={22} className="shrink-0" />
                <div className="flex flex-col">
                  <h3 className="font-semibold leading-tight text-sm sm:text-base text-white">Ghar Ka Swaad AI</h3>
                  <p className="text-[10px] sm:text-xs text-orange-200">Online | Ready to help</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="text-white bg-orange-500/50 hover:bg-orange-500 p-1.5 rounded-md transition-colors"
                aria-label="Close Chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {messages.length === 1 && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-xs text-gray-500 font-medium px-1">Common Questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {faqs.map((faq, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setInput(faq);
                          setTimeout(() => {
                            const sendBtn = document.getElementById('ai-send-btn');
                            sendBtn?.click();
                          }, 50);
                        }}
                        className="text-left text-[11px] sm:text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors shadow-sm"
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-2 items-center bg-gray-50 p-1 pl-3 rounded-xl border border-gray-200 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2 min-w-0"
                />
                <button
                  id="ai-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
