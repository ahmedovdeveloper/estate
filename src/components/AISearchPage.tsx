import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  MapPin,
  Heart,
  Maximize2,
  Navigation,
  RotateCcw,
  Compass,
  ArrowRight,
  Layers,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Property, ChatMessage } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface AISearchPageProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (propertyId: string, e?: React.MouseEvent) => void;
  onNavigateToMapTab?: (filteredIds?: string[]) => void;
}

export const AISearchPage: React.FC<AISearchPageProps> = ({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onNavigateToMapTab
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "👋 Здравствуйте! Я ваш персональный **AI-консультант по недвижимости Узбекистана** (UzEstate).\n\nНапишите в свободной форме, что вы ищете — например:\n- *«Снять 2-комнатную квартиру в Ташкенте рядом с метро до $800»*\n- *«Купить коттедж в Мирабадском районе»*\n- *«Вилла в Самарканде с бассейном»*\n\nЯ мгновенно подберу подходящие объекты и **отображу их на интерактивной карте** справа!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchedPropertyIds: ['uz-prop-1', 'uz-prop-2', 'uz-prop-3']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.311081, 69.240562]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [mobileView, setMobileView] = useState<'chat' | 'map'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick smart prompts
  const quickPrompts = [
    '🏡 3-комнатная в Tashkent City',
    '🚇 Квартира возле метро на Чиланзаре',
    '💰 Коттедж в Мирабадском районе',
    '🏛️ Вилла в Самарканде рядом с Регистаном',
    '🏢 Офис в аренду в центре Ташкента',
    '🌿 Участок в Бухаре'
  ];

  // Derive all matched property IDs from the latest assistant message or overall messages
  const latestAssistantMsg = useMemo(() => {
    return [...messages].reverse().find((m) => m.sender === 'assistant');
  }, [messages]);

  const activeMatchedProperties = useMemo(() => {
    if (!latestAssistantMsg || !latestAssistantMsg.matchedPropertyIds || latestAssistantMsg.matchedPropertyIds.length === 0) {
      return properties.slice(0, 4);
    }
    const matched = properties.filter((p) => latestAssistantMsg.matchedPropertyIds?.includes(p.id));
    return matched.length > 0 ? matched : properties.slice(0, 4);
  }, [latestAssistantMsg, properties]);

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

      const matchedIds: string[] = data.matchedPropertyIds || [];
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Я нашел подходящие объекты в нашей базе недвижимости Узбекистана.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: matchedIds
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update map center if received
      if (data.mapCenter && Array.isArray(data.mapCenter)) {
        setMapCenter([data.mapCenter[0], data.mapCenter[1]]);
        setMapZoom(data.mapZoom || 13);
      } else if (matchedIds.length > 0) {
        const found = properties.find((p) => matchedIds.includes(p.id));
        if (found) {
          setMapCenter([found.location.lat, found.location.lng]);
          setMapZoom(13);
        }
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: "Я подобрал актуальные варианты: обратите внимание на **Tashkent City Boulevard** и коттедж в Самарканде. Они отображены на карте!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedPropertyIds: ['uz-prop-1', 'uz-prop-2']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusOnMap = (property: Property) => {
    setSelectedMapProperty(property);
    setMapCenter([property.location.lat, property.location.lng]);
    setMapZoom(15);
    // On mobile, switch to map view
    setMobileView('map');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: "👋 Здравствуйте! Чат очищен. Напишите любой поисковый запрос, и AI сразу покажет лучшие объекты на карте!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: ['uz-prop-1', 'uz-prop-2', 'uz-prop-3']
      }
    ]);
    setSelectedMapProperty(null);
    setMapCenter([41.311081, 69.240562]);
    setMapZoom(12);
  };

  // Simple Markdown text formatter
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Bullet points
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const bulletText = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-stone-800">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>{renderInlineStyles(bulletText)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineStyles(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineStyles = (text: string) => {
    // Replace **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-stone-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-stone-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-5rem)] sm:h-[calc(100vh-4.5rem)] overflow-hidden bg-stone-100" id="ai-search-page-container">
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
                AI Поиск & Карта
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Умный подбор недвижимости Узбекистана с моментальной визуализацией на карте
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile view toggle (Chat / Map) */}
          <div className="flex sm:hidden bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setMobileView('chat')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                mobileView === 'chat' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              Диалог
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                mobileView === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              Карта ({activeMatchedProperties.length})
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetChat}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Очистить диалог"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>

          {/* Open in full map tab */}
          {onNavigateToMapTab && (
            <button
              onClick={() => {
                const ids = activeMatchedProperties.map((p) => p.id);
                onNavigateToMapTab(ids);
              }}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Полная карта</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Body: Left Chat, Right Map */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* LEFT COLUMN: AI Chat & Found Properties (7 cols on lg) */}
        <div
          className={`lg:col-span-6 xl:col-span-6 flex flex-col bg-stone-50 border-r border-stone-200 h-full overflow-hidden ${
            mobileView === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
          id="ai-search-chat-column"
        >
          
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
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
                    <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`space-y-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm shadow-xs ${
                        isUser
                          ? 'bg-stone-900 text-white rounded-tr-xs'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        renderFormattedMarkdown(msg.text)
                      )}
                      
                      <span
                        className={`text-[9px] block mt-2 ${
                          isUser ? 'text-white/60 text-right' : 'text-stone-400 text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Matched Property Cards preview inside chat */}
                    {matchedProps.length > 0 && (
                      <div className="space-y-2 pt-1 w-full animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <Sparkles className="w-3.5 h-3.5" /> Найдено объектов ({matchedProps.length}):
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Все отмечены на карте справа 👉
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {matchedProps.map((p) => {
                            const isFav = favorites.includes(p.id);
                            const isSelected = selectedMapProperty?.id === p.id;

                            return (
                              <div
                                key={p.id}
                                className={`bg-white rounded-2xl p-3 border transition-all hover:shadow-md flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                                    : 'border-stone-200 hover:border-amber-300'
                                }`}
                              >
                                <div>
                                  <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-16/10 bg-stone-100">
                                    <img
                                      src={p.photos[0]}
                                      alt={p.title}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-2 left-2 flex items-center gap-1">
                                      <span
                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs ${
                                          p.dealType === 'rent'
                                            ? 'bg-stone-900/90 text-white'
                                            : 'bg-emerald-700/90 text-white'
                                        }`}
                                      >
                                        {p.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(p.id, e);
                                      }}
                                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-md shadow-xs cursor-pointer ${
                                        isFav ? 'text-rose-500' : 'text-stone-600 hover:text-rose-500'
                                      }`}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-black text-stone-900">
                                      {p.price.toLocaleString()} {p.currency}
                                      {p.pricePeriod || ''}
                                    </span>
                                    <span className="text-[10px] text-stone-500 font-medium">
                                      {p.specs.bedrooms} комн • {p.specs.areaSqFt} м²
                                    </span>
                                  </div>

                                  <h4 className="font-bold text-xs text-stone-900 line-clamp-1 mb-1">
                                    {p.title}
                                  </h4>

                                  <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mb-2.5">
                                    <MapPin className="w-3 h-3 shrink-0 text-amber-600" />
                                    <span>{p.location.neighborhood}, {p.location.city}</span>
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-100">
                                  <button
                                    onClick={() => handleFocusOnMap(p)}
                                    className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <MapPin className="w-3 h-3 text-amber-600" />
                                    <span>На карте</span>
                                  </button>
                                  <button
                                    onClick={() => onSelectProperty(p)}
                                    className="py-1.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Открыть</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-stone-200 text-xs text-stone-600 flex items-center gap-2.5 shadow-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>AI анализирует параметры и наносит объекты на карту...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-white/70 border-t border-stone-200 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white text-stone-700 border border-stone-200/90 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 transition-colors shadow-2xs cursor-pointer font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Спросите что угодно (например: аренда 3-комнатной в центре до $1500)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                title="Отправить запрос"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Map with Real-Time Matched Pins (6 cols on lg) */}
        <div
          className={`lg:col-span-6 xl:col-span-6 h-full relative overflow-hidden bg-stone-200 ${
            mobileView === 'chat' ? 'hidden lg:block' : 'block'
          }`}
          id="ai-search-map-column"
        >
          {/* Header Map Status Badge */}
          <div className="absolute top-4 left-4 z-[20] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[11px] font-black text-stone-900 leading-tight">
                На карте: {activeMatchedProperties.length} {activeMatchedProperties.length === 1 ? 'объект' : 'объектов'}
              </p>
              <p className="text-[9px] text-stone-500 leading-none">
                Отображение в реальном времени
              </p>
            </div>
          </div>

          {/* Interactive Leaflet Map Component */}
          <InteractiveMap
            properties={activeMatchedProperties}
            selectedProperty={selectedMapProperty}
            onSelectProperty={(prop) => {
              setSelectedMapProperty(prop);
              setMapCenter([prop.location.lat, prop.location.lng]);
            }}
            center={mapCenter}
            zoom={mapZoom}
            showCityQuickJump={true}
            className="w-full h-full"
          />

          {/* Floating Selected Property Card on bottom of Map */}
          {selectedMapProperty && (
            <div className="absolute bottom-5 inset-x-4 z-[25] max-w-md mx-auto animate-in slide-in-from-bottom-3">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200/90 shadow-2xl flex items-center gap-3 relative">
                <button
                  onClick={() => setSelectedMapProperty(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center shadow-md hover:bg-stone-700 cursor-pointer"
                  title="Закрыть"
                >
                  ✕
                </button>
                <img
                  src={selectedMapProperty.photos[0]}
                  alt={selectedMapProperty.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      selectedMapProperty.dealType === 'rent' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {selectedMapProperty.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                    </span>
                    <span className="text-xs font-black text-stone-900">
                      {selectedMapProperty.price.toLocaleString()} {selectedMapProperty.currency}{selectedMapProperty.pricePeriod || ''}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 truncate mt-0.5">
                    {selectedMapProperty.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{selectedMapProperty.location.neighborhood}, {selectedMapProperty.location.city}</span>
                  </p>
                </div>
                <button
                  onClick={() => onSelectProperty(selectedMapProperty)}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Открыть</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
