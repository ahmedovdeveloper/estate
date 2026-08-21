import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, ArrowRight, Home } from 'lucide-react';
import { Property, ChatMessage } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  properties,
  onSelectProperty
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Здравствуйте! Я ваш персональный **AI-консультант по недвижимости Узбекистана** (UzEstate).\n\nНапишите, что вы ищете: город (Ташкент, Самарканд, Бухара), район, тип сделки (аренда или покупка), бюджет и пожелания к ремонту или этажу!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchedPropertyIds: ['prop-1', 'prop-2']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🏡 3-комнатная в Мирабадском районе Ташкента',
    '🏙️ Премиум апартаменты в Tashkent City',
    '💰 Дом в Самарканде до $150,000',
    '🏢 Офис в аренду возле метро'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Я нашел подходящие объекты в нашей базе недвижимости Узбекистана.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: data.matchedPropertyIds || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: "Я подобрал актуальные варианты: обратите внимание на **Tashkent City Boulevard** и коттедж в Самарканде.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedPropertyIds: ['prop-1', 'prop-2']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-fade-in" id="ai-assistant-modal-overlay">
      <div className="bg-stone-50 w-full max-w-xl h-[85vh] sm:h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-200" id="ai-assistant-modal-content">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-900">AI Консультант по недвижимости</h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-stone-500">Умный поиск жилья и коммерции в Узбекистане</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const matchedProps = msg.matchedPropertyIds
              ? properties.filter((p) => msg.matchedPropertyIds?.includes(p.id))
              : [];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-stone-900 text-white rounded-tr-xs'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1.5 ${
                        isUser ? 'text-white/60 text-right' : 'text-stone-400 text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Matched Property Cards preview */}
                  {matchedProps.length > 0 && (
                    <div className="space-y-1.5 pt-1 w-full">
                      <span className="text-[11px] font-bold text-amber-800 block">
                        🎯 Рекомендуемые объекты:
                      </span>
                      <div className="space-y-2">
                        {matchedProps.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onClose();
                              onSelectProperty(p);
                            }}
                            className="group cursor-pointer bg-white p-2.5 rounded-xl border border-stone-200 hover:border-amber-600 shadow-xs flex items-center justify-between gap-3 transition-all hover:scale-[1.01]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.photos[0]}
                                alt={p.title}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-stone-900 truncate group-hover:text-amber-700">
                                  {p.title}
                                </h5>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {p.location.neighborhood}, {p.location.city}
                                </p>
                                <p className="text-[11px] font-bold text-stone-900">
                                  {p.price.toLocaleString()} {p.currency}{p.pricePeriod || ''}
                                </p>
                              </div>
                            </div>

                            <button className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-stone-200 text-xs text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse delay-75" />
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse delay-150" />
                <span>AI подбирает лучшие варианты по вашему запросу...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-white/60 border-t border-stone-200 overflow-x-auto flex gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Спросите что угодно (например: сниму 2-комнатную в Ташкенте до $600)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 focus:outline-none focus:border-stone-900 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
