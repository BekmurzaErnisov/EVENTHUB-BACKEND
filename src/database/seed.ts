import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Event } from '../modules/events/entities/event.entity';
import * as bcrypt from 'bcrypt';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const eventRepository = dataSource.getRepository(Event);

  console.log('🌱 Очистка старых данных...');
  await dataSource.query('TRUNCATE TABLE "registrations", "events", "categories", "users" CASCADE;');

  console.log('👤 Создание пользователей...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    { name: 'Иван Иванов', email: 'ivan@example.com', passwordHash },
    { name: 'Анна Смирнова', email: 'anna@example.com', passwordHash },
    { name: 'Алексей Петров', email: 'alex@example.com', passwordHash },
    { name: 'Ольга Соколова', email: 'olga@example.com', passwordHash },
  ];

  const users = await userRepository.save(userRepository.create(usersData));

  console.log('🏷️ Создание категорий...');
  const categoriesData = [
    'Концерт',
    'Лекция',
    'Выставка',
    'Спорт',
    'Мастер-класс',
    'Кино',
    'Нетворкинг',
    'Фестиваль',
  ];

  const categories = await categoryRepository.save(
    categoriesData.map((name) => categoryRepository.create({ name })),
  );

  console.log('🎪 Создание мероприятий...');
  const mockEvents = [
    {
      title: 'Летний джаз в Саду «Эрмитаж»',
      description: 'Прекрасный вечер джазовой музыки под открытым небом.',
      location: 'Москва, ул. Каретный Ряд, 3',
      date: new Date('2026-06-12T19:00:00'),
      price: 1200,
      totalSeats: 50,
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629',
      category: categories.find((c) => c.name === 'Концерт'),
    },
    {
      title: 'Как развивать креативное мышление',
      description: 'Практическая лекция по генерации идей для проектов.',
      location: 'Москва, ул. Покровка, 47',
      date: new Date('2026-06-14T16:00:00'),
      price: 500,
      totalSeats: 30,
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2',
      category: categories.find((c) => c.name === 'Лекция'),
    },
    {
      title: 'Современное искусство: новые имена',
      description: 'Выставка молодых художников и скульпторов.',
      location: 'Москва, ул. Крымский Вал, 10',
      date: new Date('2026-06-15T11:00:00'),
      price: 700,
      totalSeats: 80,
      imageUrl: 'https://images.unsplash.com/photo-1531058240690-006c446962d8',
      category: categories.find((c) => c.name === 'Выставка'),
    },
    {
      title: 'Зеленый забег 5 км',
      description: 'Ежегодный благотворительный забег в парке.',
      location: 'Москва, Парк Горького',
      date: new Date('2026-06-16T09:00:00'),
      price: 1000,
      totalSeats: 150,
      imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3',
      category: categories.find((c) => c.name === 'Спорт'),
    },
    {
      title: 'Керамика для начинающих',
      description: 'Основы работы с глиной и гончарным кругом.',
      location: 'Москва, ул. Большая Никитская, 22',
      date: new Date('2026-06-17T18:30:00'),
      price: 2000,
      totalSeats: 15,
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
      category: categories.find((c) => c.name === 'Мастер-класс'),
    },
    {
      title: 'Показ фильма «Субстанция»',
      description: 'Специальный показ и обсуждение фильма с кинокритиком.',
      location: 'Москва, ул. Сретенка, 12',
      date: new Date('2026-06-18T20:00:00'),
      price: 400,
      totalSeats: 40,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
      category: categories.find((c) => c.name === 'Кино'),
    },
    {
      title: 'IT Meetup: люди, идеи, возможности',
      description: 'Встреча IT-сообщества, доклады и неформальное общение.',
      location: 'Москва, ул. Тверская, 7',
      date: new Date('2026-06-20T19:00:00'),
      price: 0,
      totalSeats: 100,
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
      category: categories.find((c) => c.name === 'Нетворкинг'),
    },
    {
      title: 'Гастрономический фестиваль «Вкус лета»',
      description: 'Дегустация уличной еды, фермерских продуктов и напитков.',
      location: 'Москва, ВДНХ',
      date: new Date('2026-06-21T12:00:00'),
      price: 300,
      totalSeats: 300,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      category: categories.find((c) => c.name === 'Фестиваль'),
    },
  ];

  const eventsToSave = mockEvents.map((evt, index) => {
    return eventRepository.create({
      ...evt,
      organizer: users[index % users.length],
    });
  });

  await eventRepository.save(eventsToSave);

  console.log(
    '✅ Сидинг успешно завершен! Созданы аккаунты, категории и афиша.',
  );
  await app.close();
}

runSeed().catch((err) => {
  console.error('❌ Ошибка во время сидинга:', err);
});
