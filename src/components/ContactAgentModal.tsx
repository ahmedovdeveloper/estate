import React, { useState } from 'react';
import { X, Send, Phone, Mail, CheckCircle2, MessageSquare } from 'lucide-react';
import { Property } from '../types';

interface ContactAgentModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactAgentModal: React.FC<ContactAgentModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!isOpen || !property) return null;

  const [message, setMessage] = useState(
    `Здравствуйте, ${property.agent.name}! Меня заинтересовал объект "${property.title}" (${property.dealType === 'rent' ? 'Аренда' : 'Продажа'}, ${property.price.toLocaleString()} ${property.currency}). Объявление ещё актуально для просмотра?`
  );
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 relative border border-stone-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSent ? (
          <form onSubmit={handleSend} className="space-y-4">
            
            {/* Agent Header */}
            <div className="flex items-center gap-3 pb-2 border-b border-stone-100">
              <img
                src={property.agent.avatar}
                alt={property.agent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-stone-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-base text-stone-900">{property.agent.name}</h4>
                <p className="text-xs text-stone-500">{property.agent.role}</p>
                <div className="flex items-center gap-3 text-[11px] text-stone-600 mt-0.5">
                  <span>⭐ {property.agent.rating.toFixed(1)} рейтинг</span>
                  <span>•</span>
                  <span>{property.agent.dealsCount} закрытых сделок</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ваше сообщение риелтору
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
              />
              <input
                type="text"
                required
                placeholder="Телефон / Telegram"
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`tel:${property.agent.phone}`}
                className="py-3 px-4 rounded-xl border border-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50"
              >
                <Phone className="w-3.5 h-3.5" /> Позвонить
              </a>

              <button
                type="submit"
                className="flex-1 py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Отправить запрос
              </button>
            </div>

          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Запрос успешно отправлен!</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Риелтор <strong>{property.agent.name}</strong> получил ваше обращение по объекту <strong>«{property.title}»</strong> и свяжется с вами в ближайшее время.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
