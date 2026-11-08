export type TestQ = { q: string; a: string[] }; // a[0] дұрыс жауап, экранда араластырылады
export const tests: Record<string, { name: string; q: TestQ[] }> = {
  HTML: { name: "HTML", q: [
    { q: "Ең үлкен тақырып тегі қайсы?|Какой тег задаёт самый крупный заголовок?|Which tag makes the largest heading?", a: ["h1", "h6", "head", "title"] },
    { q: "Сілтеме жасайтын тег?|Какой тег создаёт ссылку?|Which tag creates a link?", a: ["a", "link", "href", "p"] },
    { q: "Сурет қосатын тег?|Какой тег вставляет картинку?|Which tag inserts an image?", a: ["img", "picture", "src", "image"] },
    { q: "Нөмірленген тізім тегі?|Тег нумерованного списка?|Tag for an ordered list?", a: ["ol", "ul", "li", "dl"] },
    { q: "Мобильге бейімдейтін meta?|Какой meta адаптирует под мобильные?|Which meta makes a page mobile-friendly?", a: ["viewport", "charset", "author", "robots"] },
    { q: "Бір жолды мәтін үшін input түрі?|Тип input для одной строки?|Input type for single-line text?", a: ["text", "line", "string", "char"] },
  ] },
  CSS: { name: "CSS", q: [
    { q: "Мәтін түсін өзгертетін қасиет?|Свойство цвета текста?|Property for text colour?", a: ["color", "font", "text-style", "paint"] },
    { q: "Flex қосу?|Как включить flex?|How to enable flexbox?", a: ["display: flex", "flex: on", "position: flex", "float: flex"] },
    { q: "Сыртқы бос орын қасиеті?|Свойство внешнего отступа?|Property for outer spacing?", a: ["margin", "padding", "gap", "border"] },
    { q: "Класс селекторы қалай жазылады?|Как пишется селектор класса?|How is a class selector written?", a: [".name", "#name", "*name", "@name"] },
    { q: "z-index не істейді?|Что делает z-index?|What does z-index do?", a: ["Қабат реті|Порядок слоёв|Layer order", "Өлшем|Размер|Size", "Түс|Цвет|Colour", "Шрифт|Шрифт|Font"] },
    { q: "Media query не үшін?|Для чего media query?|What is a media query for?", a: ["Экранға бейімдеу|Адаптация под экран|Adapting to the screen", "Видео қосу|Вставка видео|Embedding video", "Дыбыс|Звук|Sound", "Сурет сығу|Сжатие картинок|Image compression"] },
  ] },
  JavaScript: { name: "JavaScript", q: [
    { q: "Өзгермейтін айнымалы кілт сөзі?|Ключевое слово для константы?|Keyword for a constant?", a: ["const", "let", "var", "set"] },
    { q: "typeof null нәтижесі?|Результат typeof null?|Result of typeof null?", a: ["object", "null", "undefined", "number"] },
    { q: "Массив соңына қосатын әдіс?|Метод добавления в конец массива?|Method to add to the end of an array?", a: ["push", "pop", "shift", "slice"] },
    { q: "=== нені тексереді?|Что проверяет ===?|What does === compare?", a: ["Мәні мен түрін|Значение и тип|Value and type", "Тек мәнін|Только значение|Value only", "Тек түрін|Только тип|Type only", "Атын|Имя|Name"] },
    { q: "[1,2,3].map(x => x * 2) нәтижесі?|Результат [1,2,3].map(x => x * 2)?|Result of [1,2,3].map(x => x * 2)?", a: ["[2,4,6]", "[1,2,3]", "6", "undefined"] },
    { q: "Асинхронды функция кілт сөзі?|Ключевое слово асинхронной функции?|Keyword for an async function?", a: ["async", "defer", "parallel", "lazy"] },
  ] },
  Python: { name: "Python", q: [
    { q: "Тізім қалай жасалады?|Как создать список?|How to create a list?", a: ["[1, 2]", "(1, 2)", "{1, 2}", "<1, 2>"] },
    { q: "len('abc') нәтижесі?|Результат len('abc')?|Result of len('abc')?", a: ["3", "2", "4", "abc"] },
    { q: "Цикл кілт сөзі?|Ключевое слово цикла?|Loop keyword?", a: ["for", "loop", "repeat", "each"] },
    { q: "Функция жариялау?|Объявление функции?|Declare a function?", a: ["def", "func", "function", "fn"] },
    { q: "Түсініктеме белгісі?|Знак комментария?|Comment symbol?", a: ["#", "//", "--", "/*"] },
    { q: "Сөздік (dict) қалай жазылады?|Как записать словарь?|How to write a dict?", a: ["{'a': 1}", "['a': 1]", "('a': 1)", "<a=1>"] },
  ] },
  Git: { name: "Git", q: [
    { q: "Репозиторийді бастау?|Инициализация репозитория?|Initialise a repository?", a: ["git init", "git start", "git new", "git create"] },
    { q: "Өзгерісті сақтау?|Сохранить изменения?|Save changes?", a: ["git commit", "git push", "git pull", "git clone"] },
    { q: "Серверге жіберу?|Отправить на сервер?|Send to the server?", a: ["git push", "git get", "git send", "git up"] },
    { q: "Жаңа бұтақ жасау?|Создать новую ветку?|Create a new branch?", a: ["git branch name", "git new name", "git fork name", "git split name"] },
    { q: "Файлды индекске қосу?|Добавить файл в индекс?|Stage a file?", a: ["git add", "git put", "git load", "git index"] },
    { q: "Репозиторийді көшіру?|Клонировать репозиторий?|Clone a repository?", a: ["git clone", "git copy", "git load", "git dup"] },
  ] },
  Security: { name: "Қауіпсіздік|Безопасность|Security", q: [
    { q: "Күшті құпиясөз қандай?|Какой пароль надёжный?|Which password is strong?", a: ["Ұзын, әріп-сан-символ|Длинный, буквы-цифры-символы|Long, letters-digits-symbols", "123456", "password", "Туған күн|Дата рождения|Birthday"] },
    { q: "Phishing дегеніміз не?|Что такое фишинг?|What is phishing?", a: ["Жалған сайт арқылы алдау|Обман через фальшивый сайт|Tricking via a fake site", "Желі жылдамдығы|Скорость сети|Network speed", "Антивирус түрі|Вид антивируса|Antivirus type", "Бағдарлама тілі|Язык программирования|Programming language"] },
    { q: "HTTPS нені береді?|Что даёт HTTPS?|What does HTTPS provide?", a: ["Шифрланған байланыс|Шифрованное соединение|Encrypted connection", "Көбірек жылдамдық|Больше скорости|More speed", "Тегін хостинг|Бесплатный хостинг|Free hosting", "Жарнама|Реклама|Ads"] },
    { q: "2FA деген не?|Что такое 2FA?|What is 2FA?", a: ["Екі сатылы растау|Двухфакторная проверка|Two-step verification", "Екі құпиясөз|Два пароля|Two passwords", "Екі аккаунт|Два аккаунта|Two accounts", "Екі браузер|Два браузера|Two browsers"] },
    { q: "SQL injection-нан қорғау?|Защита от SQL-инъекций?|Preventing SQL injection?", a: ["Параметрленген сұраныс|Параметризованные запросы|Parameterised queries", "Түсті өзгерту|Менять цвет|Change colour", "Кэшті өшіру|Отключить кэш|Disable the cache", "Шрифтті үлкейту|Увеличить шрифт|Bigger font"] },
    { q: "Құпиясөз базада қалай сақталады?|Как хранить пароли в базе?|How should passwords be stored?", a: ["Хэш түрінде|В виде хэша|As a hash", "Ашық мәтінмен|Открытым текстом|Plain text", "Cookie-де|В cookie|In a cookie", "Email-мен|В email|By email"] },
  ] },
};

export type SurveyDef = { name: string; dirs: string[]; q: { q: string; o: [string, number][] }[] };
export const surveys: Record<string, SurveyDef> = {
  dir: { name: "IT бағыты|Направление в IT|IT direction", dirs: ["Frontend", "Backend", "QA", "UI/UX"], q: [
    { q: "Қандай жұмыс ұнайды?|Какая работа нравится?|Which work do you like?", o: [["Көрінетін бет жасау|Делать видимые страницы|Building visible pages", 0], ["Логика мен деректер|Логика и данные|Logic and data", 1], ["Қате іздеу|Поиск ошибок|Hunting bugs", 2], ["Түс пен форма|Цвет и форма|Colour and shape", 3]] },
    { q: "Жобадағы рөліңіз?|Ваша роль в проекте?|Your role in a project?", o: [["Интерфейсті кодтау|Верстать интерфейс|Coding the interface", 0], ["Сервер мен база|Сервер и база|Server and database", 1], ["Сапаны тексеру|Проверка качества|Quality checks", 2], ["Макет жасау|Рисовать макеты|Drawing mockups", 3]] },
    { q: "Қай тапсырма қызық?|Какая задача интереснее?|Which task is more fun?", o: [["Анимация|Анимации|Animations", 0], ["API жазу|Писать API|Writing APIs", 1], ["Тест сценарийлері|Тест-сценарии|Test scenarios", 2], ["Қолданушы тәжірибесі|Опыт пользователя|User experience", 3]] },
    { q: "Сізге не жақсы шығады?|Что получается лучше?|What are you good at?", o: [["Дәлдік|Точность|Precision", 0], ["Логикалық есептер|Логические задачи|Logic puzzles", 1], ["Мұқияттылық|Внимательность|Attention to detail", 2], ["Эстетика|Эстетика|Aesthetics", 3]] },
    { q: "Қай құрал қызықтырады?|Какой инструмент привлекает?|Which tool appeals to you?", o: [["Browser DevTools", 0], ["Терминал / база|Терминал / база|Terminal / database", 1], ["Bug tracker", 2], ["Figma", 3]] },
  ] },
  style: { name: "Жұмыс стилі|Стиль работы|Work style", dirs: ["Лидер|Лидер|Leader", "Зерттеуші|Исследователь|Researcher", "Орындаушы|Исполнитель|Doer", "Шығармашыл|Творец|Creator"], q: [
    { q: "Топта жұмыс істегенде...|В команде вы...|In a team you...", o: [["Жоспарды ұйымдастырамын|Организую план|Organise the plan", 0], ["Мәселені зерттеймін|Изучаю проблему|Research the problem", 1], ["Тапсырманы орындаймын|Выполняю задачу|Deliver the task", 2], ["Жаңа идея ұсынамын|Предлагаю идеи|Pitch new ideas", 3]] },
    { q: "Қиын тапсырмада...|Над сложной задачей...|On a hard task...", o: [["Міндеттерді бөлемін|Распределяю роли|Delegate", 0], ["Құжаттарды оқимын|Читаю документацию|Read the docs", 1], ["Қадам-қадам істеймін|Иду шаг за шагом|Go step by step", 2], ["Басқаша жол іздеймін|Ищу нестандартный путь|Try an unusual way", 3]] },
    { q: "Сізге ұнайтыны...|Вам нравится...|You enjoy...", o: [["Шешім қабылдау|Принимать решения|Making decisions", 0], ["Терең талдау|Глубокий анализ|Deep analysis", 1], ["Нақты нәтиже|Чёткий результат|Concrete results", 2], ["Еркін формат|Свободный формат|Freedom to explore", 3]] },
    { q: "Дедлайн жақындаса...|Когда близок дедлайн...|When a deadline nears...", o: [["Команданы жұмылдырамын|Собираю команду|Rally the team", 0], ["Тәуекелді талдаймын|Анализирую риски|Analyse risks", 1], ["Тапсырманы бітіремін|Закрываю задачи|Finish the tasks", 2], ["Жылдам шешім ойлап табамын|Придумываю быстрое решение|Invent a quick fix", 3]] },
    { q: "Қалай үйренесіз?|Как вы учитесь?|How do you learn?", o: [["Басқаны үйретіп|Объясняя другим|By teaching others", 0], ["Кітап пен мақала|Книги и статьи|Books and articles", 1], ["Практикамен|Практикой|By practising", 2], ["Эксперимент жасап|Экспериментами|By experimenting", 3]] },
  ] },
};
