import React from 'react';
import { X, Bell, Home, MessageSquare, Tag } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Снижение цены! 💰',
      desc: '3-комнатная квартира в Tashkent City теперь $1,800/мес (было $2,000).',
      time: '10 мин назад',
      unread: true,
      icon: <Tag className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 2,
      title: 'Ответ риелтора 💬',
      desc: 'Сардор Рахимов ответил на ваш запрос по просмотру объекта.',
      time: '1 час назад',
      unread: true,
      icon: <MessageSquare className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      title: 'Новый объект в вашем районе 🏠',
      desc: 'Новый пентхаус добавлен в Мирабадском районе Ташкента.',
      time: 'Вчера',
      unread: false,
      icon: <Home className="w-4 h-4 text-purple-600" />
    }
  ];

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-5 sm:p-6 relative border border-stone-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-stone-900" />
            <h3 className="font-bold text-lg text-stone-900">Уведомления</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-stone-100 py-2">
          {notifications.map((n) => (
            <div key={n.id} className="py-3 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-stone-100 shrink-0 mt-0.5">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                  <span className="text-[10px] text-stone-400">{n.time}</span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
              {n.unread && (
                <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Отметить все как прочитанные
          </button>
        </div>

      </div>
    </div>
  );
};
