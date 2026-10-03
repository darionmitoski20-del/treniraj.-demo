// Пробни податоци за демото. Сите имиња, цени и оценки се измислени.

export const SPORTS = ['Фитнес', 'Фудбал', 'Кошарка', 'Тенис', 'Борилачки', 'Јога', 'Пливање', 'Трчање', 'Исхрана', 'Рехабилитација'];
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
  { id: 'p1', name: 'Фит Зона Аеродром', category: 'Теретани', city: 'Скопје', address: 'бул. Јане Сандански 12', hours: 'Пон–Пет 06–23 · Саб–Нед 08–20',
    website: 'fitzona.mk', instagram: 'fitzona.aerodrom', phone: '070 123 456', email: 'info@fitzona.mk',
    desc: 'Теретана од 800 м² со зона за кардио, слободни тегови и групни часови. Паркинг за членовите.',
    offer: '−20% прв месец', code: 'TRENIRAJBE20', featured: true, lat: 41.9870, lng: 21.4760 },
  { id: 'p2', name: 'Фан Шоп Центар', category: 'Фан шопови', city: 'Скопје', address: 'ул. Македонија 5', hours: 'Пон–Саб 09–21',
    website: 'fanshop-centar.mk', instagram: 'fanshop.centar', phone: '071 222 333', email: '',
    desc: 'Дресови, шалови и опрема за навивачи. Печатење име и број на дрес за 1 ден.', offer: '−10% на дресови', code: 'FAN10', lat: 41.9965, lng: 21.4314 },
  { id: 'p3', name: 'Протеин Маркет', category: 'Суплементи', city: 'Онлајн', address: '', hours: 'Нарачки 24/7 · достава за 1–2 дена',
    website: 'proteinmarket.mk', instagram: 'proteinmarket.mk', phone: '', email: 'naracki@proteinmarket.mk',
    desc: 'Протеини, креатин и витамини со достава низ цела Македонија.', offer: '−15% на протеини', code: 'PROT15' },
  { id: 'p4', name: 'Физио Плус', category: 'Физиотерапија', city: 'Битола', address: 'ул. Широк Сокак 40', hours: 'Пон–Пет 08–19',
    website: '', instagram: 'fizioplus.bt', phone: '075 444 555', email: 'fizioplus@mail.mk',
    desc: 'Рехабилитација по спортски повреди, масажи и кинезитерапија.', offer: '', code: '', lat: 41.0310, lng: 21.3340 },
  { id: 'p5', name: 'Спорт Опрема Охрид', category: 'Фан шопови', city: 'Охрид', address: 'ул. Туристичка 18', hours: 'Секој ден 09–22',
    website: 'sportoprema-ohrid.mk', instagram: '', phone: '072 666 777', email: '',
    desc: 'Патики за трчање, опрема за пливање и планинарење.', offer: '−10% на патики', code: 'RUN10', lat: 41.1150, lng: 20.8000 },
  { id: 'p6', name: 'Пауер Џим Тетово', category: 'Теретани', city: 'Тетово', address: 'ул. Илинденска 101', hours: 'Пон–Саб 07–22',
    website: '', instagram: 'powergym.tetovo', phone: '078 888 999', email: '',
    desc: 'Теретана со борилачка сала и сауна.', offer: '', code: '', lat: 42.0080, lng: 20.9690 },
  { id: 'p7', name: 'Базен Аква', category: 'Здравје и рекреација', city: 'Скопје', address: 'ул. Никола Карев 2', hours: 'Секој ден 07–21',
    website: 'aqua-bazen.mk', instagram: 'aqua.bazen', phone: '02 3 111 222', email: '',
    desc: 'Затворен базен 25 м, школа за пливање за возрасни.', offer: '', code: '', lat: 42.0010, lng: 21.4450 },
];

// Демо бизнис-корисник (партнер) и неговата статистика
export const PARTNER_STATS = { p1: { views: 1240, couponViews: 186, clicks: 94 } };
export const PARTNER_CATEGORIES = ['Теретани', 'Фан шопови', 'Суплементи', 'Физиотерапија', 'Здравје и рекреација'];

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

// Примерни рецепти од тренерите
export const SEED_RECIPES = [
  { id: 'rc1', trainerId: 't1', name: 'Овесна каша со протеин', cat: 'Појадок', mins: 10, servings: 1, kcal: 420, protein: 32, carbs: 52, fat: 9,
    ingredients: [['60 г', 'овесни снегулки'], ['250 мл', 'млеко или вода'], ['1 мерка', 'протеин (ванила)'], ['1', 'банана'], ['1 лажичка', 'путер од кикирики']],
    steps: ['Свари ги снегулките со млекото 4–5 минути.', 'Тргни од оган и измешај го протеинот.', 'Стави исечена банана и путер од кикирики одозгора.'] },
  { id: 'rc2', trainerId: 't1', name: 'Пилешко со ориз и зеленчук', cat: 'Ручек', mins: 30, servings: 2, kcal: 560, protein: 45, carbs: 60, fat: 12,
    ingredients: [['400 г', 'пилешки гради'], ['150 г', 'ориз (сув)'], ['1', 'тиквичка'], ['1', 'црвена пиперка'], ['1 лажица', 'маслиново масло'], ['по вкус', 'сол, бибер, паприка']],
    steps: ['Свари го оризот според упатството.', 'Исечи го месото на коцки, зачини и пропржи 8–10 минути.', 'Додади го зеленчукот и пржи уште 5 минути.', 'Сервирај со оризот. Втората порција е за утре.'] },
  { id: 'rc3', trainerId: 't1', name: 'Грчки јогурт со бобинки', cat: 'Ужина', mins: 3, servings: 1, kcal: 210, protein: 18, carbs: 22, fat: 5,
    ingredients: [['200 г', 'грчки јогурт'], ['80 г', 'бобинки (свежи или замрзнати)'], ['1 лажичка', 'мед'], ['10 г', 'ореви']],
    steps: ['Стави го јогуртот во чинија.', 'Додади бобинки, мед и искршени ореви.'] },
  { id: 'rc4', trainerId: 't3', name: 'Салата со туна и леб од интегрално брашно', cat: 'Вечера', mins: 10, servings: 1, kcal: 390, protein: 34, carbs: 30, fat: 14,
    ingredients: [['1 конзерва', 'туна во сопствен сок'], ['1', 'домат'], ['½', 'краставица'], ['5–6', 'маслинки'], ['1 парче', 'интегрален леб']],
    steps: ['Исечи го зеленчукот.', 'Измешај со оцедена туна и маслинки.', 'Зачини со лимон и малку маслиново масло.'] },
  { id: 'rc5', trainerId: 't1', name: 'Омлет со спанаќ и сирење', cat: 'Појадок', mins: 12, servings: 1, kcal: 380, protein: 28, carbs: 8, fat: 26,
    ingredients: [['3', 'јајца'], ['50 г', 'спанаќ'], ['30 г', 'фета сирење'], ['1 парче', 'интегрален леб']],
    steps: ['Искрши ги јајцата и додади спанаќ.', 'Пржи на тивок оган 4–5 минути, посипи со сирење.', 'Сервирај со леб.'] },
  { id: 'rc6', trainerId: 't1', name: 'Леб со авокадо и јајце', cat: 'Појадок', mins: 10, servings: 1, kcal: 450, protein: 20, carbs: 34, fat: 24,
    ingredients: [['2 парчиња', 'интегрален леб'], ['½', 'авокадо'], ['2', 'јајца']],
    steps: ['Испржи или свари ги јајцата.', 'Намачкај авокадо на лебот и стави јајце одозгора.'] },
  { id: 'rc7', trainerId: 't1', name: 'Мелено месо со компири и салата', cat: 'Ручек', mins: 35, servings: 1, kcal: 640, protein: 48, carbs: 55, fat: 22,
    ingredients: [['200 г', 'телешко мелено месо'], ['250 г', 'компири'], ['1', 'домат'], ['1 лажица', 'маслиново масло']],
    steps: ['Исечи ги компирите и испечи ги во рерна 25 минути.', 'Пропржи го месото со зачини.', 'Сервирај со салата од домат.'] },
  { id: 'rc8', trainerId: 't1', name: 'Лосос со ориз и брокула', cat: 'Ручек', mins: 25, servings: 1, kcal: 610, protein: 42, carbs: 52, fat: 24,
    ingredients: [['150 г', 'лосос'], ['80 г', 'ориз (сув)'], ['150 г', 'брокула']],
    steps: ['Свари ориз и брокула.', 'Испечи го лососот 10 минути во тава.', 'Сервирај заедно.'] },
  { id: 'rc9', trainerId: 't1', name: 'Пилешки ќофтиња со зеленчук', cat: 'Вечера', mins: 30, servings: 1, kcal: 420, protein: 40, carbs: 18, fat: 20,
    ingredients: [['200 г', 'мелени пилешки гради'], ['1', 'јајце'], ['200 г', 'тиквички'], ['1 лажичка', 'маслиново масло']],
    steps: ['Измешај месо и јајце, формирај ќофтиња.', 'Испечи 15–20 минути.', 'Сервирај со печени тиквички.'] },
  { id: 'rc10', trainerId: 't1', name: 'Леќа чорба со леб', cat: 'Вечера', mins: 30, servings: 2, kcal: 360, protein: 22, carbs: 50, fat: 6,
    ingredients: [['200 г', 'црвена леќа'], ['1', 'морков'], ['1', 'кромид'], ['1 парче', 'интегрален леб']],
    steps: ['Сомели ги кромидот и морковот.', 'Додади леќа и вода, вари 20 минути.', 'Сервирај со леб.'] },
  { id: 'rc11', trainerId: 't1', name: 'Урми и бадеми', cat: 'Ужина', mins: 1, servings: 1, kcal: 190, protein: 5, carbs: 22, fat: 10,
    ingredients: [['3', 'урми'], ['20 г', 'бадеми']],
    steps: ['Сервирај урмите со бадемите.'] },
  { id: 'rc12', trainerId: 't1', name: 'Сиренце со краставица', cat: 'Ужина', mins: 3, servings: 1, kcal: 160, protein: 20, carbs: 6, fat: 6,
    ingredients: [['150 г', 'свежо сирење'], ['1', 'краставица']],
    steps: ['Исечи ја краставицата и послужи со сирењето.'] },
];

// Напредок на другите демо клиенти (тие секогаш го споделуваат)
export const DEMO_PROGRESS = {
  c2: { goal: 'Сила и маса', goalLabel: '+5 кг мускулна маса', level: 'Редовно тренира', injuries: '', data: [
    { week: 1, weight: 72.0, waist: 80, workouts: 4 }, { week: 2, weight: 72.4, waist: 80, workouts: 4 }, { week: 3, weight: 72.9, waist: 81, workouts: 5 },
    { week: 4, weight: 73.1, waist: 81, workouts: 3 }, { week: 5, weight: 73.8, waist: 81, workouts: 5 }, { week: 6, weight: 74.2, waist: 82, workouts: 4 } ] },
  c3: { goal: 'Сила и маса', goalLabel: 'Бенч прес 100 кг', level: 'Напреден', injuries: 'Лево рамо — без тешки потисоци над глава', data: [
    { week: 1, weight: 88.0, waist: 92, workouts: 4 }, { week: 2, weight: 88.3, waist: 92, workouts: 4 }, { week: 3, weight: 88.1, waist: 91, workouts: 4 },
    { week: 4, weight: 88.6, waist: 91, workouts: 5 }, { week: 5, weight: 88.9, waist: 91, workouts: 5 }, { week: 6, weight: 89.0, waist: 90, workouts: 5 } ] },
  c4: { goal: 'Полумаратон', goalLabel: '21 км под 2 часа', level: 'Малку тренира', injuries: '', data: [
    { week: 1, weight: 61.0, waist: 70, workouts: 3 }, { week: 2, weight: 60.6, waist: 70, workouts: 3 }, { week: 3, weight: 60.5, waist: 69, workouts: 4 },
    { week: 4, weight: 60.1, waist: 69, workouts: 4 }, { week: 5, weight: 59.8, waist: 68, workouts: 2 }, { week: 6, weight: 59.6, waist: 68, workouts: 4 } ] },
};
