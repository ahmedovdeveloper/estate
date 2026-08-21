import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import { Property } from '../types';

interface BookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!isOpen || !property) return null;

  const [date, setDate] = useState('2026-08-25');
  const [time, setTime] = useState('11:00');
  const [tourType, setTourType] = useState<'in_person' | 'video_call'>('in_person');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [isSuccess, setIsSuccess] = useState(false);

  const times = ['10:00', '12:00', '14:30', '16:00', '18:30'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-fade-in" id="booking-modal-overlay">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative border border-stone-200" id="booking-modal-content">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Запись на просмотр
              </span>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 line-clamp-1">
                {property.title}
              </h3>
              <p className="text-xs text-stone-500">{property.location.address}, {property.location.city}</p>
            </div>

            {/* Tour Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTourType('in_person')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tourType === 'in_person'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                🚶 Личный визит
              </button>
              <button
                type="button"
                onClick={() => setTourType('video_call')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tourType === 'video_call'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                📹 Видео-показ онлайн
              </button>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" /> Желаемая дата
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> Удобное время
              </label>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      time === t
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5 font-medium">Ваше имя</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Азиз Каримов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5 font-medium">Номер телефона для связи</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-stone-800 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              Подтвердить запись на просмотр
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Заявка успешно отправлена!</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Риелтор <strong>{property.agent.name}</strong> свяжется с вами по номеру {phone} для согласования встречи на {date} в {time}.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
