import { Property } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'uz-prop-1',
    title: 'Роскошная 3-комнатная квартира в Tashkent City',
    description: 'Эксклюзивные апартаменты в самом сердце Ташкента (Tashkent City, Gardens Residence). Дизайнерский ремонт в стиле неоклассика, панорамные окна с видом на парк и фонтаны, полностью укомплектована европейской мебелью и премиальной техникой Miele.',
    price: 1800,
    pricePeriod: '/ мес',
    currency: '$',
    dealType: 'rent',
    propertyType: 'apartment',
    location: {
      address: 'ул. Навои, 1, ЖК Gardens Residence',
      neighborhood: 'Шайхантахурский район',
      city: 'Ташкент',
      country: 'Узбекистан',
      lat: 41.3142,
      lng: 69.2485
    },
    rating: 4.9,
    reviewsCount: 38,
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      areaSqFt: 135,
      builtYear: 2023,
      livingRooms: 1,
      parkingSpaces: 2,
      floor: 9,
      totalFloors: 16
    },
    facilities: [
      { type: 'metro', name: 'Метро Пахтакор / Узбекистанская', distance: '350 м' },
      { type: 'park', name: 'Парк Tashkent City', distance: '100 м' },
      { type: 'mall', name: 'Tashkent City Mall', distance: '250 м' },
      { type: 'restaurant', name: 'Ресторан Manas & Sky Bar', distance: '150 м' },
      { type: 'school', name: 'Cambridge International School', distance: '800 м' },
      { type: 'gym', name: 'BeFit Pro Fitness Club', distance: '200 м' }
    ],
    amenities: [
      'Подземный паркинг',
      'Круглосуточная охрана 24/7',
      'Консьерж-сервис',
      'Система Умный дом',
      'Кондиционеры Daikin в каждой комнате',
      'Посудомоечная машина',
      'Гардеробная комната',
      'Скоростной оптоволоконный интернет'
    ],
    agent: {
      id: 'agent-sardor',
      name: 'Сардор Рахимов',
      role: 'Ведущий риелтор Tashkent Real Estate',
      phone: '+998 90 123-45-67',
      email: 'sardor@realty-tashkent.uz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.9,
      dealsCount: 94
    },
    reviews: [
      {
        id: 'rev-1',
        userName: 'Алишер Махмудов',
        userRole: 'IT Предприниматель',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rating: 5.0,
        date: '3 дня назад',
        comment: 'Великолепная квартира, шикарный вид на парк Ташкент Сити. Все новое, чистое и готово к заселению.'
      }
    ],
    createdAt: '2026-08-01T10:00:00Z',
    ownerId: 'user-owner-1'
  },
  {
    id: 'uz-prop-2',
    title: 'Коттедж в элитном районе Мирабад',
    description: 'Просторный двухэтажный дом с благоустроенным зеленым двором, летней кухней, зоной барбекю и подогреваемым бассейном. Тихая охраняемая махалля рядом с улицей Чехова и посольствами.',
    price: 380000,
    pricePeriod: '',
    currency: '$',
    dealType: 'sale',
    propertyType: 'house',
    location: {
      address: 'проезд Чехова, 12',
      neighborhood: 'Мирабадский район',
      city: 'Ташкент',
      country: 'Узбекистан',
      lat: 41.2941,
      lng: 69.2785
    },
    rating: 4.95,
    reviewsCount: 22,
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      bedrooms: 5,
      bathrooms: 4,
      areaSqFt: 380,
      builtYear: 2022,
      livingRooms: 2,
      parkingSpaces: 4,
      floor: 1,
      totalFloors: 2
    },
    facilities: [
      { type: 'school', name: 'Международная школа Ташкента (TIS)', distance: '1.1 км' },
      { type: 'metro', name: 'Метро Ойбек / Минг Урик', distance: '650 м' },
      { type: 'restaurant', name: 'Giotto & Cafe Paul', distance: '400 м' },
      { type: 'hospital', name: 'Клиника Medion', distance: '900 м' }
    ],
    amenities: [
      'Бассейн с подогревом',
      'Летняя терраса с топчаном',
      'Сауна и хаммам',
      'Гараж на 4 авто',
      'Автономное отопление (Buderus)',
      'Видеонаблюдение по периметру'
    ],
    agent: {
      id: 'agent-zarina',
      name: 'Зарина Каримова',
      role: 'Эксперт по элитной недвижимости',
      phone: '+998 97 765-43-21',
      email: 'zarina@cityhomes.uz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.95,
      dealsCount: 110
    },
    reviews: [],
    createdAt: '2026-08-05T12:00:00Z',
    ownerId: 'user-owner-2'
  },
  {
    id: 'uz-prop-3',
    title: 'Уютная 2-комнатная квартира на Юнусабаде',
    description: 'Светлая, теплая и полностью мебелированная квартира на Юнусабаде (14-й квартал, новостройка). Свежий евроремонт, теплые полы, развитая инфраструктура, 5 минут до метро Туркистон.',
    price: 550,
    pricePeriod: '/ мес',
    currency: '$',
    dealType: 'rent',
    propertyType: 'apartment',
    location: {
      address: 'Юнусабад-14, дом 24А',
      neighborhood: 'Юнусабадский район',
      city: 'Ташкент',
      country: 'Узбекистан',
      lat: 41.3654,
      lng: 69.2887
    },
    rating: 4.75,
    reviewsCount: 19,
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      areaSqFt: 68,
      builtYear: 2021,
      livingRooms: 1,
      parkingSpaces: 1,
      floor: 4,
      totalFloors: 9
    },
    facilities: [
      { type: 'metro', name: 'Метро Туркистон', distance: '450 м' },
      { type: 'mall', name: 'Mega Planet Юнусабад', distance: '1.2 км' },
      { type: 'school', name: 'Школа №259', distance: '300 м' },
      { type: 'hospital', name: 'Городская больница №7', distance: '800 м' }
    ],
    amenities: [
      'Лифт',
      'Балкон',
      'Стиральная машина автомат',
      'Wi-Fi интернет',
      'Кондиционер зима-лето',
      'Домофон'
    ],
    agent: {
      id: 'agent-sardor',
      name: 'Сардор Рахимов',
      role: 'Ведущий риелтор',
      phone: '+998 90 123-45-67',
      email: 'sardor@realty-tashkent.uz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.9,
      dealsCount: 94
    },
    reviews: [],
    createdAt: '2026-08-08T09:30:00Z',
    ownerId: 'user-owner-1'
  },
  {
    id: 'uz-prop-4',
    title: 'Вилла с садом в Самарканде возле Регистана',
    description: 'Уникальная традиционная вилла с элементами восточного зодчества и современными удобствами. Идеально подходит как для комфортной жизни, так и под элитный бутик-отель. Просторный айван, фонтан во дворе, резные колонны.',
    price: 240000,
    pricePeriod: '',
    currency: '$',
    dealType: 'sale',
    propertyType: 'villa',
    location: {
      address: 'ул. Регистанская, 45',
      neighborhood: 'Исторический центр',
      city: 'Самарканд',
      country: 'Узбекистан',
      lat: 39.6542,
      lng: 66.9750
    },
    rating: 4.98,
    reviewsCount: 45,
    photos: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      bedrooms: 6,
      bathrooms: 5,
      areaSqFt: 450,
      builtYear: 2020,
      livingRooms: 2,
      parkingSpaces: 3,
      floor: 1,
      totalFloors: 2
    },
    facilities: [
      { type: 'temple', name: 'Площадь Регистан', distance: '500 м' },
      { type: 'restaurant', name: 'Ресторан Platan & Самарканд', distance: '300 м' },
      { type: 'park', name: 'Университетский бульвар', distance: '800 м' },
      { type: 'station', name: 'Вокзал Самарканд (Афросиаб)', distance: '4.2 км' }
    ],
    amenities: [
      'Традиционный восточный айван',
      'Фонтан во внутреннем дворике',
      'Фруктовый сад (хурма, гранат, инжир)',
      'Система климат-контроля',
      'Высокоскоростной интернет'
    ],
    agent: {
      id: 'agent-zarina',
      name: 'Зарина Каримова',
      role: 'Эксперт по недвижимости Самарканда',
      phone: '+998 97 765-43-21',
      email: 'zarina@cityhomes.uz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.95,
      dealsCount: 110
    },
    reviews: [],
    createdAt: '2026-08-10T14:15:00Z',
    ownerId: 'user-owner-2'
  },
  {
    id: 'uz-prop-5',
    title: 'Офисное пространство Open Space в БЦ Orient',
    description: 'Современный представительский офис класса А в Яккасарайском районе. Панорамное остекление, оборудованные переговорные комнаты, серверная комната, кухня для сотрудников и круглосуточный доступ.',
    price: 3200,
    pricePeriod: '/ мес',
    currency: '$',
    dealType: 'rent',
    propertyType: 'office',
    location: {
      address: 'ул. Шота Руставели, 53Б',
      neighborhood: 'Яккасарайский район',
      city: 'Ташкент',
      country: 'Узбекистан',
      lat: 41.2825,
      lng: 69.2550
    },
    rating: 4.8,
    reviewsCount: 14,
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      bedrooms: 0,
      bathrooms: 3,
      areaSqFt: 220,
      builtYear: 2023,
      livingRooms: 3,
      parkingSpaces: 5,
      floor: 6,
      totalFloors: 12
    },
    facilities: [
      { type: 'metro', name: 'Метро Космонавтов', distance: '900 м' },
      { type: 'restaurant', name: 'Кафе и лаундж-зона БЦ', distance: '50 м' },
      { type: 'station', name: 'Северный вокзал Ташкента', distance: '2.1 км' }
    ],
    amenities: [
      'Оптоволоконный интернет 1 Гбит/с',
      'Центральная вентиляция и чиллер-фанкойл',
      'Система контроля доступа по FaceID / картам',
      'Подземный паркинг на 5 мест'
    ],
    agent: {
      id: 'agent-sardor',
      name: 'Сардор Рахимов',
      role: 'Специалист коммерческой недвижимости',
      phone: '+998 90 123-45-67',
      email: 'sardor@realty-tashkent.uz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.9,
      dealsCount: 94
    },
    reviews: [],
    createdAt: '2026-08-12T11:00:00Z',
    ownerId: 'user-owner-1'
  },
  {
    id: 'uz-prop-6',
    title: 'Земельный участок под строительство в Кибрае',
    description: 'Ровный участок 8 соток в экологически чистом пригородном районе Кибрай (рядом с резиденцией и рекой Чирчик). Газ, электричество, артезианская вода, асфальтированный подъезд, все документы на 100% готовы.',
    price: 85000,
    pricePeriod: '',
    currency: '$',
    dealType: 'sale',
    propertyType: 'land',
    location: {
      address: 'Кибрайский район, махалля Салар',
      neighborhood: 'Кибрай',
      city: 'Ташкентская область',
      country: 'Узбекистан',
      lat: 41.3850,
      lng: 69.3780
    },
    rating: 4.88,
    reviewsCount: 8,
    photos: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      bedrooms: 0,
      bathrooms: 0,
      areaSqFt: 800,
      builtYear: 2025,
      livingRooms: 0,
      parkingSpaces: 4,
      floor: 0,
      totalFloors: 0
    },
    facilities: [
      { type: 'park', name: 'Ботанический сад и набережная', distance: '1.5 км' },
      { type: 'school', name: 'Школа №1 Кибрай', distance: '800 м' }
    ],
    amenities: [
      'Газ магистральный',
      'Электричество 3 фазы',
      'Ограждение по периметру',
      'Широкая улица'
    ],
    agent: {
      id: 'agent-zarina',
      name: 'Зарина Каримова',
      role: 'Эксперт по загородной недвижимости',
      phone: '+998 97 765-43-21',
      email: 'zarina@cityhomes.uz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.95,
      dealsCount: 110
    },
    reviews: [],
    createdAt: '2026-08-15T15:20:00Z',
    ownerId: 'user-owner-2'
  },
  {
    id: 'uz-prop-7',
    title: 'Аутентичный гостевой дом в Бухаре (Ляби-Хауз)',
    description: 'Двухэтажный дом в исторической части старой Бухары в 200 метрах от ансамбля Ляби-Хауз. Полностью отреставрирован с сохранением старинной резьбы по ганчу и дереву, 6 спален со своими санузлами.',
    price: 195000,
    pricePeriod: '',
    currency: '$',
    dealType: 'sale',
    propertyType: 'commercial',
    location: {
      address: 'ул. Б. Накшбанди, 78',
      neighborhood: 'Старый город',
      city: 'Бухара',
      country: 'Узбекистан',
      lat: 39.7715,
      lng: 64.4215
    },
    rating: 4.92,
    reviewsCount: 29,
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      bedrooms: 6,
      bathrooms: 6,
      areaSqFt: 320,
      builtYear: 2021,
      livingRooms: 2,
      parkingSpaces: 2,
      floor: 1,
      totalFloors: 2
    },
    facilities: [
      { type: 'temple', name: 'Ансамбль Ляби-Хауз', distance: '200 м' },
      { type: 'restaurant', name: 'Чайхана Ляби-Хауз & Ресторан Белла Италия', distance: '150 м' },
      { type: 'park', name: 'Парк Саманидов', distance: '1.2 км' }
    ],
    amenities: [
      'Кондиционеры во всех номерах',
      'Внутренний дворик со старинным декором',
      'Готовый бизнес с лицензией'
    ],
    agent: {
      id: 'agent-zarina',
      name: 'Зарина Каримова',
      role: 'Эксперт по недвижимости',
      phone: '+998 97 765-43-21',
      email: 'zarina@cityhomes.uz',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      verified: true,
      rating: 4.95,
      dealsCount: 110
    },
    reviews: [],
    createdAt: '2026-08-16T18:00:00Z',
    ownerId: 'user-owner-2'
  }
];
