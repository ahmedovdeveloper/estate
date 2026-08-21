import { User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin',
    name: 'Главный Администратор',
    email: 'admin@uzestate.uz',
    phone: '+998 71 200-00-00',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-01-01T00:00:00Z',
    savedPropertyIds: ['uz-prop-1', 'uz-prop-2']
  },
  {
    id: 'user-owner-1',
    username: 'sardor_realty',
    password: '123',
    name: 'Сардор Рахимов',
    email: 'sardor@realty-tashkent.uz',
    phone: '+998 90 123-45-67',
    role: 'owner',
    agencyName: 'Tashkent Real Estate & Co',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-02-10T11:20:00Z',
    savedPropertyIds: ['uz-prop-3']
  },
  {
    id: 'user-owner-2',
    username: 'zarina_estate',
    password: '123',
    name: 'Зарина Каримова',
    email: 'zarina@cityhomes.uz',
    phone: '+998 97 765-43-21',
    role: 'owner',
    agencyName: 'Премиум Недвижимость Узбекистан',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-03-05T09:15:00Z',
    savedPropertyIds: []
  },
  {
    id: 'user-seeker-1',
    username: 'timur_invest',
    password: '123',
    name: 'Тимур Алиев',
    email: 'timur.a@gmail.com',
    phone: '+998 93 555-88-99',
    role: 'seeker',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-05-18T14:40:00Z',
    savedPropertyIds: ['uz-prop-1', 'uz-prop-5']
  },
  {
    id: 'user-seeker-2',
    username: 'malika_rent',
    password: '123',
    name: 'Малика Усманова',
    email: 'malika.u@yandex.uz',
    phone: '+998 99 888-11-22',
    role: 'seeker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-06-22T16:05:00Z',
    savedPropertyIds: ['uz-prop-2']
  }
];

export const MOCK_USERS = INITIAL_USERS;

