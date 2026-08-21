import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROPERTIES } from './src/data/mockProperties';
import { INITIAL_USERS } from './src/data/mockUsers';
import { Property, User } from './src/types';

dotenv.config();

let propertiesStore: Property[] = [...INITIAL_PROPERTIES];
let usersStore: User[] = [...INITIAL_USERS];

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ================= AUTH ROUTES =================

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Введите имя пользователя и пароль' });
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check admin
    if (cleanUser === 'admin' && cleanPass === 'admin') {
      let adminUser = usersStore.find((u) => u.username === 'admin');
      if (!adminUser) {
        adminUser = {
          id: 'user-admin',
          username: 'admin',
          name: 'Главный Администратор',
          email: 'admin@uzestate.uz',
          phone: '+998 71 200-00-00',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          createdAt: new Date().toISOString(),
          savedPropertyIds: []
        };
        usersStore.push(adminUser);
      }
      return res.json({ success: true, user: adminUser, token: 'token-admin-session' });
    }

    // Check in users store
    const existing = usersStore.find(
      (u) => u.username.toLowerCase() === cleanUser && (u.password === cleanPass || !u.password)
    );

    if (existing) {
      const { password: _, ...userSafe } = existing;
      return res.json({ success: true, user: userSafe, token: `token-${existing.id}` });
    }

    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  });

  // Register
  app.post('/api/auth/register', (req, res) => {
    const { username, password, name, email, phone, role, agencyName } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, error: 'Заполните обязательные поля (логин, пароль, имя)' });
    }

    const cleanUser = username.trim().toLowerCase();
    if (usersStore.some((u) => u.username.toLowerCase() === cleanUser)) {
      return res.status(400).json({ success: false, error: 'Пользователь с таким логином уже существует' });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: cleanUser,
      password: password.trim(),
      name: name.trim(),
      email: email ? email.trim() : `${cleanUser}@uzestate.uz`,
      phone: phone ? phone.trim() : '+998 90 000-00-00',
      role: role === 'owner' ? 'owner' : 'seeker',
      agencyName: agencyName ? agencyName.trim() : undefined,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      savedPropertyIds: []
    };

    usersStore.push(newUser);
    const { password: _, ...userSafe } = newUser;
    return res.status(201).json({ success: true, user: userSafe, token: `token-${newUser.id}` });
  });

  // ================= ADMIN ROUTES =================

  // Get all users (Admin only)
  app.get('/api/admin/users', (req, res) => {
    const usersWithStats = usersStore.map((u) => {
      const listingsCount = propertiesStore.filter(
        (p) => p.ownerId === u.id || p.agent?.email === u.email
      ).length;
      const { password: _, ...safeUser } = u;
      return {
        ...safeUser,
        listingsCount
      };
    });

    res.json({
      success: true,
      total: usersWithStats.length,
      users: usersWithStats
    });
  });

  // Admin update user
  app.put('/api/admin/users/:id', (req, res) => {
    const userIndex = usersStore.findIndex((u) => u.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }

    const body = req.body;
    usersStore[userIndex] = {
      ...usersStore[userIndex],
      name: body.name || usersStore[userIndex].name,
      email: body.email || usersStore[userIndex].email,
      phone: body.phone || usersStore[userIndex].phone,
      role: body.role || usersStore[userIndex].role,
      agencyName: body.agencyName !== undefined ? body.agencyName : usersStore[userIndex].agencyName
    };

    const { password: _, ...safeUser } = usersStore[userIndex];
    res.json({ success: true, user: safeUser });
  });

  // Admin delete user
  app.delete('/api/admin/users/:id', (req, res) => {
    const id = req.params.id;
    if (id === 'user-admin') {
      return res.status(400).json({ success: false, error: 'Нельзя удалить главного администратора' });
    }

    usersStore = usersStore.filter((u) => u.id !== id);
    res.json({ success: true, message: 'Пользователь удален' });
  });

  // ================= PROPERTY ROUTES =================

  // Get all properties with filters
  app.get('/api/properties', (req, res) => {
    const {
      search,
      dealType,
      propertyType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      sortBy
    } = req.query;

    let filtered = [...propertiesStore];

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.address.toLowerCase().includes(q) ||
          p.location.neighborhood.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (city && city !== 'all' && typeof city === 'string') {
      filtered = filtered.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (dealType && dealType !== 'all') {
      filtered = filtered.filter((p) => p.dealType === dealType);
    }

    if (propertyType && propertyType !== 'all') {
      filtered = filtered.filter((p) => p.propertyType === propertyType);
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    if (bedrooms && bedrooms !== 'all' && !isNaN(Number(bedrooms))) {
      filtered = filtered.filter((p) => p.specs.bedrooms >= Number(bedrooms));
    }

    if (sortBy) {
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'newest') {
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }

    res.json({
      success: true,
      total: filtered.length,
      data: filtered
    });
  });

  // Get single property
  app.get('/api/properties/:id', (req, res) => {
    const prop = propertiesStore.find((p) => p.id === req.params.id);
    if (!prop) {
      return res.status(404).json({ success: false, error: 'Объект не найден' });
    }
    res.json({ success: true, data: prop });
  });

  // Create property
  app.post('/api/properties', (req, res) => {
    const body = req.body;
    if (!body.title || !body.price || !body.dealType || !body.propertyType) {
      return res.status(400).json({ success: false, error: 'Заполните обязательные поля объекта' });
    }

    const newProperty: Property = {
      id: `uz-prop-${Date.now()}`,
      title: body.title,
      description: body.description || 'Отличный объект недвижимости в Узбекистане с развитой инфраструктурой.',
      price: Number(body.price),
      pricePeriod: body.dealType === 'rent' ? (body.pricePeriod || '/ мес') : '',
      currency: body.currency || '$',
      dealType: body.dealType,
      propertyType: body.propertyType,
      location: {
        address: body.location?.address || 'ул. Амира Темура, 10',
        neighborhood: body.location?.neighborhood || 'Центр',
        city: body.location?.city || 'Ташкент',
        country: 'Узбекистан',
        lat: Number(body.location?.lat) || 41.2995 + (Math.random() - 0.5) * 0.05,
        lng: Number(body.location?.lng) || 69.2401 + (Math.random() - 0.5) * 0.05
      },
      rating: 5.0,
      reviewsCount: 0,
      photos: body.photos && body.photos.length > 0 ? body.photos : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      featured: Boolean(body.featured),
      specs: {
        bedrooms: Number(body.specs?.bedrooms) || 2,
        bathrooms: Number(body.specs?.bathrooms) || 1,
        areaSqFt: Number(body.specs?.areaSqFt) || 75,
        builtYear: Number(body.specs?.builtYear) || new Date().getFullYear(),
        livingRooms: Number(body.specs?.livingRooms) || 1,
        parkingSpaces: Number(body.specs?.parkingSpaces) || 1,
        floor: body.specs?.floor ? Number(body.specs.floor) : 1,
        totalFloors: body.specs?.totalFloors ? Number(body.specs.totalFloors) : 9
      },
      facilities: body.facilities || [
        { type: 'metro', name: 'Метро рядом', distance: '500 м' },
        { type: 'school', name: 'Школа / Лицей', distance: '400 м' },
        { type: 'restaurant', name: 'Кафе и магазины', distance: '200 м' }
      ],
      amenities: body.amenities || ['Кондиционер', 'Паркинг', 'Охрана 24/7', 'Wi-Fi'],
      agent: body.agent || {
        id: `agent-${Date.now()}`,
        name: 'Собственник',
        role: 'Владелец недвижимости',
        phone: '+998 90 123-45-67',
        email: 'contact@uzestate.uz',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        verified: true,
        rating: 5.0,
        dealsCount: 1
      },
      reviews: [],
      createdAt: new Date().toISOString(),
      ownerId: body.ownerId || 'user-admin'
    };

    propertiesStore.unshift(newProperty);
    res.status(201).json({ success: true, data: newProperty });
  });

  // Update property (Admin / Owner)
  app.put('/api/properties/:id', (req, res) => {
    const id = req.params.id;
    const index = propertiesStore.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Объект не найден' });
    }

    const body = req.body;
    const existing = propertiesStore[index];

    propertiesStore[index] = {
      ...existing,
      title: body.title !== undefined ? body.title : existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      currency: body.currency || existing.currency,
      pricePeriod: body.dealType === 'rent' ? (body.pricePeriod || '/ мес') : '',
      dealType: body.dealType || existing.dealType,
      propertyType: body.propertyType || existing.propertyType,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      photos: body.photos && body.photos.length > 0 ? body.photos : existing.photos,
      amenities: body.amenities || existing.amenities,
      location: {
        ...existing.location,
        address: body.location?.address || existing.location.address,
        neighborhood: body.location?.neighborhood || existing.location.neighborhood,
        city: body.location?.city || existing.location.city,
        lat: body.location?.lat ? Number(body.location.lat) : existing.location.lat,
        lng: body.location?.lng ? Number(body.location.lng) : existing.location.lng
      },
      specs: {
        ...existing.specs,
        bedrooms: body.specs?.bedrooms !== undefined ? Number(body.specs.bedrooms) : existing.specs.bedrooms,
        bathrooms: body.specs?.bathrooms !== undefined ? Number(body.specs.bathrooms) : existing.specs.bathrooms,
        areaSqFt: body.specs?.areaSqFt !== undefined ? Number(body.specs.areaSqFt) : existing.specs.areaSqFt,
        builtYear: body.specs?.builtYear !== undefined ? Number(body.specs.builtYear) : existing.specs.builtYear,
        floor: body.specs?.floor !== undefined ? Number(body.specs.floor) : existing.specs.floor,
        totalFloors: body.specs?.totalFloors !== undefined ? Number(body.specs.totalFloors) : existing.specs.totalFloors
      }
    };

    res.json({ success: true, data: propertiesStore[index] });
  });

  // Delete property (Admin / Owner)
  app.delete('/api/properties/:id', (req, res) => {
    const id = req.params.id;
    const initialLen = propertiesStore.length;
    propertiesStore = propertiesStore.filter((p) => p.id !== id);

    if (propertiesStore.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Объект не найден' });
    }

    res.json({ success: true, message: 'Объект успешно удален' });
  });

  // Add review
  app.post('/api/properties/:id/reviews', (req, res) => {
    const prop = propertiesStore.find((p) => p.id === req.params.id);
    if (!prop) {
      return res.status(404).json({ success: false, error: 'Объект не найден' });
    }

    const { userName, userRole, rating, comment } = req.body;
    const newReview = {
      id: `rev-${Date.now()}`,
      userName: userName || 'Проверенный гость',
      userRole: userRole || 'Арендатор',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      rating: Number(rating) || 5,
      date: 'Только что',
      comment: comment || 'Отличная недвижимость!'
    };

    prop.reviews.unshift(newReview);
    prop.reviewsCount += 1;
    const totalRating = prop.reviews.reduce((sum, r) => sum + r.rating, 0);
    prop.rating = Number((totalRating / prop.reviews.length).toFixed(1));

    res.status(201).json({ success: true, data: newReview, property: prop });
  });

  // AI Assistant (Russian + Uzbekistan context)
  app.post('/api/ai/assistant', async (req, res) => {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    const catalogSummary = propertiesStore.map((p) => ({
      id: p.id,
      title: p.title,
      dealType: p.dealType === 'rent' ? 'Аренда' : 'Продажа',
      type: p.propertyType,
      price: `${p.price} ${p.currency}${p.pricePeriod || ''}`,
      rawPrice: p.price,
      city: p.location.city,
      neighborhood: p.location.neighborhood,
      address: p.location.address,
      lat: p.location.lat,
      lng: p.location.lng,
      rooms: p.specs.bedrooms,
      area: `${p.specs.areaSqFt} м²`,
      amenities: p.amenities.slice(0, 4).join(', ')
    }));

    // Helper for heuristic search
    const findMatchingProperties = (query: string): string[] => {
      const q = query.toLowerCase();
      const scored = propertiesStore.map((p) => {
        let score = 0;
        const text = `${p.title} ${p.description} ${p.location.city} ${p.location.neighborhood} ${p.location.address} ${p.propertyType} ${p.dealType} ${p.amenities.join(' ')}`.toLowerCase();
        
        // City match
        if (q.includes('ташкент') && p.location.city.toLowerCase().includes('ташкент')) score += 5;
        if (q.includes('самарканд') && p.location.city.toLowerCase().includes('самарканд')) score += 5;
        if (q.includes('бухар') && p.location.city.toLowerCase().includes('бухар')) score += 5;

        // Deal type match
        if ((q.includes('аренд') || q.includes('снять') || q.includes('посуточно')) && p.dealType === 'rent') score += 4;
        if ((q.includes('куп') || q.includes('продаж') || q.includes('инвестиц')) && p.dealType === 'sale') score += 4;

        // Neighborhood / district match
        if (q.includes('мирабад') && text.includes('мирабад')) score += 4;
        if (q.includes('юнусабад') && text.includes('юнусабад')) score += 4;
        if (q.includes('чиланзар') && text.includes('чиланзар')) score += 4;
        if (q.includes('шайхантахур') && text.includes('шайхантахур')) score += 4;
        if (q.includes('city') && text.includes('city')) score += 4;

        // Type match
        if ((q.includes('квартир') || q.includes('апартамент')) && p.propertyType === 'apartment') score += 3;
        if ((q.includes('дом') || q.includes('коттедж') || q.includes('участок')) && (p.propertyType === 'house' || p.propertyType === 'villa' || p.propertyType === 'land')) score += 3;
        if (q.includes('вилл') && p.propertyType === 'villa') score += 4;
        if (q.includes('офис') && (p.propertyType === 'office' || p.propertyType === 'commercial')) score += 4;

        // Amenities / Metro
        if (q.includes('метро') && (text.includes('метро') || p.facilities?.some(f => f.type === 'metro'))) score += 3;
        if (q.includes('бассейн') && text.includes('бассейн')) score += 3;
        if (q.includes('парк') && text.includes('парк')) score += 2;

        // Room count
        if ((q.includes('1-комн') || q.includes('однокомн') || q.includes('1 комн')) && p.specs.bedrooms === 1) score += 4;
        if ((q.includes('2-комн') || q.includes('двухкомн') || q.includes('2 комн')) && p.specs.bedrooms === 2) score += 4;
        if ((q.includes('3-комн') || q.includes('трехкомн') || q.includes('3 комн')) && p.specs.bedrooms === 3) score += 4;
        if ((q.includes('4-комн') || q.includes('четырехкомн') || q.includes('4 комн')) && p.specs.bedrooms >= 4) score += 4;

        return { id: p.id, score };
      });

      const filtered = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
      if (filtered.length > 0) {
        return filtered.map((f) => f.id);
      }
      return propertiesStore.slice(0, 3).map((p) => p.id);
    };

    const systemInstruction = `Вы — официальный AI-консультант по недвижимости портала UzEstate (Недвижимость Узбекистана).
Ваша задача:
1. Помогать клиентам находить идеальные квартиры, дома, виллы, участки и коммерческую недвижимость в Ташкенте, Самарканде, Бухаре и других городах Узбекистана на русском языке.
2. Внимательно учитывать бюджет, тип сделки (аренда или покупка), район (Мирабад, Юнусабад, Чиланзар, Шайхантахур, Самарканд и др.), этаж, инфраструктуру и станции метро.
3. Обязательно рекомендовать РЕАЛЬНЫЕ объекты из каталога ниже при совпадении критериев.
4. В конце своего ответа ОБЯЗАТЕЛЬНО добавьте строку в точном формате:
MATCHED_IDS: [id_объекта_1, id_объекта_2]
(например: MATCHED_IDS: [uz-prop-1, uz-prop-3]).
5. Отвечайте дружелюбно, структурировано, профессионально с использованием форматирования Markdown.

АКТУАЛЬНЫЙ КАТАЛОГ ОБЪЕКТОВ В БАЗЕ ДАННЫХ:
${JSON.stringify(catalogSummary, null, 2)}
`;

    try {
      const ai = getGeminiClient();
      let responseText = '';
      let matchedPropertyIds: string[] = [];

      if (ai) {
        const prompt = `История диалога: ${JSON.stringify(conversationHistory.slice(-4))}
Запрос пользователя: "${message}"`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        responseText = response.text || 'Вот подходящие варианты недвижимости из нашего каталога:';

        // Extract MATCHED_IDS: [...] from response
        const matchRegex = /MATCHED_IDS:\s*\[(.*?)\]/i;
        const match = responseText.match(matchRegex);
        if (match && match[1]) {
          matchedPropertyIds = match[1]
            .split(',')
            .map((s) => s.trim().replace(/['"`]/g, ''))
            .filter((id) => propertiesStore.some((p) => p.id === id));
          
          // Clean the MATCHED_IDS line from user-facing text
          responseText = responseText.replace(matchRegex, '').trim();
        }

        // Also check if any property titles or IDs appear in text
        propertiesStore.forEach((p) => {
          if ((responseText.includes(p.id) || responseText.includes(p.title)) && !matchedPropertyIds.includes(p.id)) {
            matchedPropertyIds.push(p.id);
          }
        });
      }

      // If still empty or no AI key, use heuristic matching
      if (matchedPropertyIds.length === 0) {
        matchedPropertyIds = findMatchingProperties(message);
      }

      if (!responseText) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('аренд') || lowerMsg.includes('снять') || lowerMsg.includes('квартир')) {
          responseText = "Я подобрал отличные варианты для аренды в Ташкенте с развитой инфраструктурой, мебелью и близостью к метро. Посмотрите объекты ниже и на интерактивной карте:";
        } else if (lowerMsg.includes('куп') || lowerMsg.includes('дом') || lowerMsg.includes('вилл') || lowerMsg.includes('самарканд')) {
          responseText = "Для покупки и долгосрочных инвестиций рекомендую обратить внимание на эти проверенные объекты недвижимости с полным пакетом документов:";
        } else {
          responseText = "По вашему запросу найдены актуальные объекты в каталоге недвижимости Узбекистана. Вы можете сразу увидеть их локацию на карте:";
        }
      }

      const matchedProps = propertiesStore.filter((p) => matchedPropertyIds.includes(p.id));
      
      // Calculate center map coords if properties found
      let mapCenter: [number, number] = [41.311081, 69.240562];
      let mapZoom = 12;

      if (matchedProps.length > 0) {
        const avgLat = matchedProps.reduce((sum, p) => sum + p.location.lat, 0) / matchedProps.length;
        const avgLng = matchedProps.reduce((sum, p) => sum + p.location.lng, 0) / matchedProps.length;
        mapCenter = [avgLat, avgLng];
        mapZoom = matchedProps.length === 1 ? 14 : 12;
      }

      res.json({
        reply: responseText,
        matchedPropertyIds,
        mapCenter,
        mapZoom,
        matchedCount: matchedProps.length
      });
    } catch (err: any) {
      console.error('Gemini assistant error:', err);
      const fallbackIds = findMatchingProperties(message);
      res.json({
        reply: "Я нашел подходящие объекты в каталоге недвижимости по вашему запросу. Все они отмечены на интерактивной карте ниже:",
        matchedPropertyIds: fallbackIds,
        mapCenter: [41.311081, 69.240562],
        mapZoom: 12
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UzEstate Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
