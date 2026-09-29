// Пробни податоци за демото. Сите имиња, цени и оценки се измислени.

export const SPORTS = ['Фитнес', 'Фудбал', 'Кошарка', 'Тенис', 'Борилачки', 'Јога', 'Пливање', 'Трчање', 'Исхрана'];
export const CITIES = ['Скопје', 'Битола', 'Охрид', 'Тетово', 'Куманово', 'Онлајн'];

export const TRAINERS = [
  { id: 't1', name: 'Марија Стојанова', sport: 'Фитнес', sports: ['Фитнес', 'Исхрана'], city: 'Скопје', area: 'Аеродром', type: 'both', rating: 4.9, reviews: 38, goalsReached: 21, price: 900, onlinePrice: 2500, pricesPublic: true, founder: true, monthTop: true, accepting: true, lat: 41.9853, lng: 21.4700,
    bio: 'Сертифициран персонален тренер со 8 години искуство. Работам со почетници и со луѓе што сакаат да ослабат без гладување.',
    certs: ['NASM персонален тренер', 'Нутриционист ниво 2'], badges: ['Основач', 'Тренер на месецот', 'Трансформација'] },
  { id: 't2', name: 'Бојан Петровски', sport: 'Тенис', sports: ['Тенис'], city: 'Битола', area: 'Центар', type: 'live', rating: 4.8, reviews: 24, goalsReached: 9, price: 1000, onlinePrice: 0, pricesPublic: false, founder: true, accepting: true, lat: 41.0297, lng: 21.3292,
    bio: 'Поранешен национален репрезентативец. Тренирам деца над 18, рекреативци и натпреварувачи.', certs: ['ITF Level 2'], badges: ['Основач'] },
  { id: 't3', name: 'Елена Трајковска', sport: 'Исхрана', sports: ['Исхрана'], city: 'Онлајн', area: '', type: 'online', rating: 5.0, reviews: 41, goalsReached: 30, price: 0, onlinePrice: 1800, pricesPublic: true, founder: false, accepting: true, lat: 41.9981, lng: 21.4254,
    bio: 'Нутриционист. Правам планови за исхрана што можат да се држат и после 3 месеци.', certs: ['Дипл. нутриционист'], badges: ['Мајстор за резултати'] },
  { id: 't4', name: 'Стефан Николов', sport: 'Фитнес', sports: ['Фитнес'], city: 'Охрид', area: 'Центар', type: 'both', rating: 4.8, reviews: 19, goalsReached: 8, price: 800, onlinePrice: 2200, pricesPublic: true, founder: false, accepting: true, lat: 41.1172, lng: 20.8016,
    bio: 'Сила и маса. Програми базирани на прогресивно оптоварување.', certs: ['ISSA'], badges: [] },
  { id: 't5', name: 'Горан Костовски', sport: 'Борилачки', sports: ['Борилачки'], city: 'Скопје', area: 'Карпош', type: 'live', rating: 4.7, reviews: 15, goalsReached: 6, price: 700, onlinePrice: 0, pricesPublic: true, founder: true, accepting: false, lat: 42.0045, lng: 21.3930,
    bio: 'Кик-бокс и ММА за рекреативци и натпреварувачи.', certs: ['Мајсторски појас'], badges: ['Основач'] },
  { id: 't6', name: 'Ива Ристовска', sport: 'Јога', sports: ['Јога'], city: 'Скопје', area: 'Центар', type: 'both', rating: 4.9, reviews: 27, goalsReached: 11, price: 600, onlinePrice: 1500, pricesPublic: true, founder: false, accepting: true, lat: 41.9960, lng: 21.4320,
    bio: 'Јога за флексибилност и помалку стрес. Часови во мали групи и онлајн.', certs: ['RYT 500'], badges: [] },
  { id: 't7', name: 'Никола Спасов', sport: 'Трчање', sports: ['Трчање'], city: 'Скопје', area: 'Кисела Вода', type: 'online', rating: 4.6, reviews: 12, goalsReached: 7, price: 0, onlinePrice: 1600, pricesPublic: true, founder: false, accepting: true, lat: 41.9800, lng: 21.4400,
    bio: 'Подготовки за 10 км, полумаратон и маратон.', certs: ['UESCA тренер за трчање'], badges: [] },
  { id: 't8', name: 'Арбен Бајрами', sport: 'Фудбал', sports: ['Фудбал'], city: 'Тетово', area: 'Центар', type: 'live', rating: 4.8, reviews: 20, goalsReached: 10, price: 700, onlinePrice: 0, pricesPublic: true, founder: true, accepting: true, lat: 42.0106, lng: 20.9715,
    bio: 'Индивидуална техника и кондиција за фудбалери.', certs: ['UEFA B лиценца'], badges: ['Основач'] },
];

export const PARTNERS = [
  { id: 'p1', name: 'Фит Зона Аеродром', category: 'Теретани', city: 'Скопје', offer: '−20% прв месец', code: 'TRENIRAJ20', featured: true, lat: 41.9870, lng: 21.4760 },
  { id: 'p2', name: 'Фан Шоп Вардар', category: 'Фан шопови', city: 'Скопје', offer: '−10% на дресови', code: 'FAN10' },
  { id: 'p3', name: 'Протеин Маркет', category: 'Суплементи', city: 'Онлајн', offer: '−15% на протеини', code: 'PROT15' },
  { id: 'p4', name: 'Физио Плус', category: 'Физиотерапија', city: 'Битола', offer: 'Бесплатна проценка', code: 'FIZIO0' },
  { id: 'p5', name: 'Спорт Опрема Охрид', category: 'Фан шопови', city: 'Охрид', offer: '−10% на патики', code: 'RUN10' },
  { id: 'p6', name: 'Пауер Џим Тетово', category: 'Теретани', city: 'Тетово', offer: 'Бесплатен пробен ден', code: 'PROBA1' },
];

export const CHALLENGES = [
  { id: 'ch1', name: '30 дена движење', days: 30, paid: false, fee: 0, by: 't1', desc: 'Секој ден најмалку 30 минути активност.' },
  { id: 'ch2', name: '100 склекови дневно', days: 14, paid: false, fee: 0, by: 't4', desc: 'Раздели ги во серии колку што ти треба.' },
  { id: 'ch3', name: 'Првите 10 км', days: 42, paid: true, fee: 300, by: 't7', desc: 'Од 0 до 10 км за 6 недели. Награда за топ 3.' },
  { id: 'ch4', name: 'Без шеќер', days: 21, paid: false, fee: 0, by: 't3', desc: '21 ден без додаден шеќер, со совети од нутриционист.' },
];

// Други учесници на ранг листата (измислени)
export const LEADERBOARD_OTHERS = [
  { name: 'Теодора Ј.', done: 14 }, { name: 'Дарко С.', done: 13 }, { name: 'Никола Д.', done: 12 },
  { name: 'Ивана М.', done: 9 }, { name: 'Лука Б.', done: 7 }, { name: 'Сара А.', done: 5 },
];

// Клиенти на демо тренерот (Марија)
export const DEMO_CLIENTS = [
  { id: 'c2', name: 'Никола Д.', goal: 'Сила и маса', type: 'Онлајн', progress: 45, since: 'јуни' },
  { id: 'c3', name: 'Дарко С.', goal: 'Сила и маса', type: 'Онлајн', progress: 85, since: 'март' },
  { id: 'c4', name: 'Теодора Ј.', goal: 'Полумаратон', type: 'Онлајн', progress: 60, since: 'мај' },
];

export const DEMO_REQUESTS = [
  { id: 'r1', clientId: 'c5', clientName: 'Ивана М.', trainerId: 't1', goal: 'Намалување тежина · во живо', status: 'pending' },
  { id: 'r2', clientId: 'c6', clientName: 'Лука Б.', trainerId: 't1', goal: 'Кондиција · онлајн', status: 'pending' },
];

// Примерни оценки (seed: не се бројат во просекот, тој е веќе во податоците на тренерот)
export const SEED_REVIEWS = [
  { id: 'rv1', trainerId: 't1', clientId: 'x1', clientName: 'Сара А.', stars: 5, text: 'Прв пат тренирам редовно повеќе од 2 месеци. Препорака!', at: Date.now() - 9 * 864e5, seed: true },
  { id: 'rv2', trainerId: 't1', clientId: 'c2', clientName: 'Никола Д.', stars: 5, text: 'Многу детални корекции на техниката преку снимки.', at: Date.now() - 20 * 864e5, seed: true },
  { id: 'rv3', trainerId: 't1', clientId: 'x2', clientName: 'Мила П.', stars: 4, text: 'Одлични планови, понекогаш е тешко да се најде термин.', at: Date.now() - 34 * 864e5, seed: true },
  { id: 'rv4', trainerId: 't3', clientId: 'x3', clientName: 'Горан В.', stars: 5, text: 'Исхрана што можам да ја држам. −6 кг за 3 месеци.', at: Date.now() - 12 * 864e5, seed: true },
  { id: 'rv5', trainerId: 't2', clientId: 'x4', clientName: 'Петар Л.', stars: 5, text: 'Бекхендот ми е конечно стабилен.', at: Date.now() - 15 * 864e5, seed: true },
  { id: 'rv6', trainerId: 't4', clientId: 'x5', clientName: 'Ема Т.', stars: 5, text: 'Сериозен и мотивирачки тренер.', at: Date.now() - 6 * 864e5, seed: true },
];

// Примерни објави во фидот
export const SEED_POSTS = [
  { id: 'po1', trainerId: 't3', tag: 'Совет', daysAgo: -0.2, likes: ['x1', 'x2', 'x3'], text: 'Појади во рок од 1 час по будење. Не мора голем оброк — јогурт и овошје се сосема доволни за почеток.' },
  { id: 'po2', trainerId: 't1', tag: 'Предизвик', daysAgo: -1, likes: ['x1', 'x4', 'x5', 'x6', 'c2'], text: 'Почнува „30 дена движење“! Секој ден 30 минути активност, прошетката се брои. Приклучи се од делот Предизвици.' },
  { id: 'po3', trainerId: 't7', tag: 'Совет', daysAgo: -2, likes: ['x2'], text: '80% од трчањата треба да ти бидат лесни — со темпо на кое можеш да зборуваш. Брзината доаѓа од другите 20%.' },
  { id: 'po4', trainerId: 't2', tag: 'Новост', daysAgo: -3, likes: ['x3', 'x4'], text: 'Слободни се 3 термини во сабота наутро на теренот во Битола. Прв час бесплатно за нови клиенти.' },
  { id: 'po5', trainerId: 't6', tag: 'Совет', daysAgo: -4, likes: ['x1', 'x5'], text: 'Ако седиш цел ден: на секој час стани и направи 5 длабоки вдишувања со истегнување на рацете нагоре.' },
];

export const TEMPLATES = [
  { id: 'tpl1', name: 'Сила — почетници', meta: '4 недели · 3 дена неделно', days: [
    [ ['Чучањ со шипка', 4, '8', '2 мин'], ['Бенч прес', 4, '8', '2 мин'], ['Веслање со дамбел', 3, '10', '90 сек'] ],
    [ ['Мртво кревање', 3, '6', '3 мин'], ['Потисок над глава', 3, '8', '2 мин'], ['Планк', 3, '45 сек', '60 сек'] ],
    [ ['Искорак', 3, '12', '90 сек'], ['Згибови', 3, 'макс', '2 мин'], ['Трбушни', 3, '15', '60 сек'] ],
  ] },
  { id: 'tpl2', name: 'Намалување тежина', meta: '6 недели · 4 дена неделно', days: [
    [ ['Брзо одење на лента', 1, '30 мин', '—'], ['Чучањ', 3, '15', '60 сек'], ['Склекови', 3, '10', '60 сек'] ],
    [ ['Велосипед', 1, '25 мин', '—'], ['Искорак', 3, '12', '60 сек'], ['Планк', 3, '40 сек', '45 сек'] ],
  ] },
  { id: 'tpl3', name: 'Подготовка за 10 км', meta: '6 недели · трчање', days: [
    [ ['Лесно трчање', 1, '5 км', '—'] ], [ ['Интервали 400 м', 6, '400 м', '90 сек'] ], [ ['Долго трчање', 1, '8 км', '—'] ],
  ] },
];

export const DAY_NAMES = ['Понеделник', 'Вторник', 'Среда', 'Четврток', 'Петок', 'Сабота', 'Недела'];
export const DAY_SHORT = ['ПОН', 'ВТО', 'СРЕ', 'ЧЕТ', 'ПЕТ', 'САБ', 'НЕД'];
export const SLOT_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
