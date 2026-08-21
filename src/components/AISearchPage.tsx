import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  MapPin,
  Heart,
  RotateCcw,
  Compass,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Map as MapIcon,
  Loader2,
  X
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
      text: "👋 Здравствуйте! Напишите, что именно вы ищете (город, район, метро, комнатность или бюджет) — я сразу подберу варианты и покажу их на карте!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchedPropertyIds: ['uz-prop-1', 'uz-prop-2', 'uz-prop-3']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.311081, 69.240562]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [mobileTab, setMobileTab] = useState<'chat' | 'map'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Quick suggestions
  const quickPrompts = [
    '🏡 3-комн в Tashkent City',
    '🚇 Возле метро Чиланзар',
    '💰 Коттедж в Мирабаде',
    '🏛️ Самарканд',
    '🏢 Офис в центре',
    '💎 Аренда до $800'
  ];

  // Matched properties from the latest assistant message
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

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, mobileTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
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
          message: query,
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
        text: data.reply || 'Вот подходящие объекты из нашего каталога:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: matchedIds
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update map center coordinates safely
      if (data.mapCenter && Array.isArray(data.mapCenter)) {
        const cLat = Number(data.mapCenter[0]);
        const cLng = Number(data.mapCenter[1]);
        if (Number.isFinite(cLat) && Number.isFinite(cLng)) {
          setMapCenter([cLat, cLng]);
          setMapZoom(Number.isFinite(data.mapZoom) ? data.mapZoom : 13);
        }
      } else if (matchedIds.length > 0) {
        const found = properties.find((p) => matchedIds.includes(p.id));
        if (found && found.location) {
          const fLat = Number(found.location.lat);
          const fLng = Number(found.location.lng);
          if (Number.isFinite(fLat) && Number.isFinite(fLng)) {
            setMapCenter([fLat, fLng]);
            setMapZoom(13);
            setSelectedPropertyId(found.id);
          }
        }
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Подобраны актуальные варианты недвижимости в Ташкенте и Самарканде. Они отмечены на карте!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedPropertyIds: ['uz-prop-1', 'uz-prop-2']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocusOnMap = (property: Property) => {
    if (!property || !property.location) return;
    const pLat = Number(property.location.lat);
    const pLng = Number(property.location.lng);
    if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
      setSelectedPropertyId(property.id);
      setMapCenter([pLat, pLng]);
      setMapZoom(15);
      setMobileTab('map');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: "👋 Здравствуйте! Чат очищен. Напишите параметры поиска, и я мгновенно подберу объекты!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedPropertyIds: ['uz-prop-1', 'uz-prop-2', 'uz-prop-3']
      }
    ]);
    setSelectedPropertyId(null);
    setMapCenter([41.311081, 69.240562]);
    setMapZoom(12);
  };

  // Simple Markdown renderer
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

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
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-100 relative" id="ai-chat-page-root">
      
      {/* 1. Header Bar: Ultra-Clean on Mobile (no unnecessary text), Informative on Desktop */}
      <div className="bg-white border-b border-stone-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-2xs shrink-0 z-20">
        
        {/* Left: Minimal AI Icon & Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          {/* Desktop Only Text */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base text-stone-900 leading-tight">
                AI Поиск & Карта
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Умный подбор недвижимости по Узбекистану
            </p>
          </div>
        </div>

        {/* Center/Right: Switcher [Чат | Карта] + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Mobile Switcher Tab */}
          <div className="flex lg:hidden bg-stone-100 p-0.5 rounded-xl border border-stone-200 shadow-2xs">
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                mobileTab === 'chat'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Чат</span>
            </button>
            <button
              onClick={() => setMobileTab('map')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                mobileTab === 'map'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Карта ({activeMatchedProperties.length})</span>
            </button>
          </div>

          {/* Reset Chat Button */}
          <button
            onClick={handleResetChat}
            className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Очистить диалог"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>

          {/* Open in Full Map Tab (Desktop) */}
          {onNavigateToMapTab && (
            <button
              onClick={() => {
                const ids = activeMatchedProperties.map((p) => p.id);
                onNavigateToMapTab(ids);
              }}
              className="hidden sm:flex px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Карта объектов</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* CHAT VIEW                                                                  */}
        {/* ========================================================================= */}
        <div
          className={`lg:col-span-7 xl:col-span-7 flex flex-col bg-stone-50 border-r border-stone-200 h-full overflow-hidden ${
            mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
          id="ai-chat-column"
        >
          
          {/* Scrollable Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const matchedProps = msg.matchedPropertyIds
                ? properties.filter((p) => msg.matchedPropertyIds?.includes(p.id))
                : [];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[92%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Message Bubble */}
                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl shadow-2xs ${
                        isUser
                          ? 'bg-stone-900 text-white rounded-tr-xs'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-xs sm:text-sm font-medium">{msg.text}</p>
                      ) : (
                        renderFormattedMarkdown(msg.text)
                      )}
                      
                      <span
                        className={`text-[8px] sm:text-[9px] block mt-1 ${
                          isUser ? 'text-white/60 text-right' : 'text-stone-400 text-left'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Matched Property Cards */}
                    {matchedProps.length > 0 && (
                      <div className="space-y-2 pt-0.5 w-full animate-fade-in">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] sm:text-[11px] font-black text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Подобрано ({matchedProps.length}):</span>
                          </span>

                          <button
                            onClick={() => setMobileTab('map')}
                            className="lg:hidden text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Показать на карте</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Property Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchedProps.map((p) => {
                            const isFav = favorites.includes(p.id);
                            const isSelected = selectedPropertyId === p.id;

                            return (
                              <div
                                key={p.id}
                                className={`bg-white rounded-2xl p-2 sm:p-2.5 border transition-all hover:shadow-md flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                                    : 'border-stone-200 hover:border-amber-300'
                                }`}
                              >
                                <div>
                                  {/* Photo */}
                                  <div className="relative rounded-xl overflow-hidden mb-1.5 aspect-16/9 bg-stone-100">
                                    <img
                                      src={p.photos[0]}
                                      alt={p.title}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span
                                      className={`absolute top-1 left-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ${
                                        p.dealType === 'rent'
                                          ? 'bg-stone-900/90 text-white'
                                          : 'bg-emerald-700/90 text-white'
                                      }`}
                                    >
                                      {p.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(p.id, e);
                                      }}
                                      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-md shadow-xs cursor-pointer ${
                                        isFav ? 'text-rose-500' : 'text-stone-600 hover:text-rose-500'
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500' : ''}`} />
                                    </button>
                                  </div>

                                  {/* Details */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-black text-stone-900">
                                      {p.price.toLocaleString()} {p.currency}
                                      {p.pricePeriod || ''}
                                    </span>
                                    <span className="text-[10px] text-stone-500 font-medium">
                                      {p.specs.bedrooms}к • {p.specs.areaSqFt}м²
                                    </span>
                                  </div>

                                  <h4 className="font-bold text-[11px] sm:text-xs text-stone-900 line-clamp-1 mt-0.5">
                                    {p.title}
                                  </h4>

                                  <p className="text-[9px] sm:text-[10px] text-stone-500 truncate flex items-center gap-0.5 mt-0.5 mb-1.5">
                                    <MapPin className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                                    <span>{p.location.neighborhood}, {p.location.city}</span>
                                  </p>
                                </div>

                                {/* Buttons: [На карте] + [Открыть] */}
                                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-stone-100">
                                  <button
                                    onClick={() => handleFocusOnMap(p)}
                                    className="py-1 px-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <MapPin className="w-2.5 h-2.5 text-amber-600" />
                                    <span>На карте</span>
                                  </button>
                                  <button
                                    onClick={() => onSelectProperty(p)}
                                    className="py-1 px-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Открыть</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
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
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-xs border border-stone-200 text-xs text-stone-600 flex items-center gap-2 shadow-2xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>AI ищет и расставляет метки на карте...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Ribbon (Compact) */}
          <div className="px-2.5 sm:px-4 py-1.5 bg-white border-t border-stone-200 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[10px] sm:text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 transition-colors cursor-pointer font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Bar: Raised on Mobile (pb-20) to stay strictly ABOVE BottomNav */}
          <div className="p-2 sm:p-3.5 bg-white border-t border-stone-200 shrink-0 pb-20 sm:pb-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Напишите запрос AI (район, комнатность, цена)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-stone-100 border border-stone-200 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs font-medium"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                title="Отправить сообщение"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAP VIEW                                                                   */}
        {/* ========================================================================= */}
        <div
          className={`lg:col-span-5 xl:col-span-5 h-full relative overflow-hidden bg-stone-200 ${
            mobileTab === 'chat' ? 'hidden lg:block' : 'block'
          }`}
          id="ai-map-column"
        >
          {/* Interactive Leaflet Map */}
          <InteractiveMap
            properties={activeMatchedProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(prop) => {
              setSelectedPropertyId(prop.id);
              if (prop.location) {
                const pLat = Number(prop.location.lat);
                const pLng = Number(prop.location.lng);
                if (Number.isFinite(pLat) && Number.isFinite(pLng)) {
                  setMapCenter([pLat, pLng]);
                }
              }
            }}
            center={mapCenter}
            zoom={mapZoom}
            showCityQuickJump={true}
            className="w-full h-full"
          />

          {/* Floating Selected Property Preview Card on Map */}
          {selectedProperty && (
            <div className="absolute bottom-20 sm:bottom-4 inset-x-3 z-[25] max-w-sm mx-auto animate-fade-in">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-2xl flex items-center gap-2.5 relative">
                <button
                  onClick={() => setSelectedPropertyId(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center shadow-md hover:bg-stone-700 cursor-pointer"
                  title="Закрыть"
                >
                  ✕
                </button>
                <img
                  src={selectedProperty.photos[0]}
                  alt={selectedProperty.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      selectedProperty.dealType === 'rent' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {selectedProperty.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                    </span>
                    <span className="text-xs font-black text-stone-900">
                      {selectedProperty.price.toLocaleString()} {selectedProperty.currency}{selectedProperty.pricePeriod || ''}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 truncate mt-0.5">
                    {selectedProperty.title}
                  </h4>
                  <p className="text-[9px] text-stone-500 truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-stone-400" />
                    <span>{selectedProperty.location.neighborhood}, {selectedProperty.location.city}</span>
                  </p>
                </div>
                <button
                  onClick={() => onSelectProperty(selectedProperty)}
                  className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer"
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
