# Осы апта: UI жұмысын төрт адамға бөлу

Мақсат: үш негізгі беттің UI-ін Next.js + TypeScript + Tailwind CSS көмегімен дайындау. Бастапқы Career Studio UI бөлек PR арқылы `dev` тармағына беріледі. Әр қатысушы төмендегі өз тапсырмасын нақты жақсартып, өз аккаунтымен жеке commit және PR жасайды. Бұл жоспар төрт адамның орнына авторлығы жасанды commit жасауды білдірмейді.

| Қатысушы        | Тармақ                      | Өзгертуге жауапты файлдар                                                    | Тапсырма және қабылдау шарты                                                                                                                                                                                                     |
| --------------- | --------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Сүгірбай А.Ж.   | `feature/home-navigation`   | `components/home.tsx`, `components/navigation.tsx`, `components/catalog.tsx` | Басты беттің үш карточкасын, каталог іздеуін және мобильді навигацияны аяқтау. 360 px көріністе карточкалар бір бағанмен ашылсын, мәзір клавиатурамен басқарылсын, каталогтың «табылмады» күйі анық көрсетілсін.                 |
| Орунбасар А.И.  | `feature/post-editor`       | `components/post-editor.tsx`                                                 | Пост жасау/өңдеу формасын жақсарту: өрістерге түсінікті көмек мәтіні мен қате хабарламаларын қосу; бос орындардан тұратын сипаттама қабылданбасын; алдын ала қарау бірден жаңарсын; сақтау кезінде қайталанған басу бұғатталсын. |
| Траймбетқызы А. | `feature/dashboard-history` | `components/workspace-dashboard.tsx`                                         | Жеке кабинет пен әрекеттер тарихының UI-ін аяқтау: күн бойынша сұрыптау және сүзгілерді тазарту батырмасын қосу; іздеу/сүзгі бірлесіп жұмыс істесін; мобильді тарих карточкалары мен бос күйі тексерілсін.                       |
| Сәмбет Ж.Қ.     | `feature/post-view`         | `components/post-view.tsx`, `tests/ui.spec.ts`                               | Постты көру бетін толықтыру: вакансия дағдыларын көрсету және сәйкес бағытқа сілтеме қосу; ұзын тақырып/мәтін дұрыс тасымалдансын; жалақысы жоқ және пост табылмаған күйлері тексерілсін; негізгі E2E сценарийін толықтыру.      |

## Ортақ файлдар

`components/workspace-shell.tsx`, `components/ui.tsx`, `components/motion.tsx`, `app/globals.css`, `lib/data.ts`, `lib/workspace.ts`, `lib/use-workspace.ts` — ортақ. Өзгерту қажет болса, командамен алдын ала келісіңіз. Жеке стиль үшін өз модуліңізде Tailwind кластарын немесе бөлек CSS Module қолданыңыз; төрт адам бір уақытта `globals.css` файлын өзгертпесін.

## Әр адам VS Code-та қалай жұмыс істейді

1. Бастапқы UI PR-ы `dev`-ке біріктірілгеннен кейін репозиторийді VS Code-та ашыңыз.
2. VS Code-та өз GitHub аккаунтыңызбен кіріңіз. Commit үшін өз GitHub аккаунтыңызға қосылған email-ді немесе GitHub ұсынған `noreply` email-ді пайдаланыңыз. Құпия кілт пен токенді чатқа/кодқа жазбаңыз.
3. Терминалда өз тармағыңызды ашыңыз. Төмендегі мысал — Сүгірбай А.Ж. үшін; қалғандары кестедегі өз тармағын қолданады:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feature/home-navigation
npm ci
npm run dev
```

4. Өз міндетіңіздегі файлдарды өзгертіңіз. Source Control → Changes ішінен тек өз файлдарыңызды stage етіңіз. Немесе терминалда:

```bash
npm run lint
npm run typecheck
npm run build
git add components/home.tsx components/navigation.tsx components/catalog.tsx
git commit -m "feat: improve home intent cards and mobile navigation"
git push -u origin feature/home-navigation
```

5. GitHub-та Pull Request ашыңыз: **base: `dev`**, **compare: өз feature тармағыңыз**. PR-ға не өзгергенін, қалай тексерілгенін және скриншот қосыңыз.
6. Кемінде бір басқа қатысушы қарап бекітеді. `main` мен `dev`-ке тікелей push жасамаңыз.

## Қалған үш қатысушыға commit мысалдары

Тек нақты өзгерткен файлдарыңызды stage етіңіз:

```bash
# Орунбасар А.И. — өз feature/post-editor тармағында
git add components/post-editor.tsx
git commit -m "feat: improve post editor validation and preview"
git push -u origin feature/post-editor

# Траймбетқызы А. — өз feature/dashboard-history тармағында
git add components/workspace-dashboard.tsx
git commit -m "feat: add history sorting and filter reset"
git push -u origin feature/dashboard-history

# Сәмбет Ж.Қ. — өз feature/post-view тармағында
git add components/post-view.tsx tests/ui.spec.ts
git commit -m "feat: improve post details and UI coverage"
git push -u origin feature/post-view
```

## GitHub-та үлес қалай көрінеді

- Әркімнің feature тармағында өз commit-і және PR-ы көрінеді.
- Commit email-і өз GitHub аккаунтына байланыстырылсын. Бір адамның атын төрт рет ауыстырып жазу төрт адамның үлесі болып саналмайды.
- Репозиторийдің Commits/PR тізімі мен профильдегі contribution графигі әртүрлі. Профиль графигінде көрінуі GitHub ережелеріне, email сәйкестігіне және өзгерістердің default тармаққа біріктірілуіне байланысты.
- Әр адам кемінде бір нақты мағыналы өзгеріс жасап, commit жібереді. Алдымен commit санын емес, тапсырманың қабылдау шартын тексеріңіз.

## Тексеру және review

Review жұптары: Сүгірбай → Орунбасар → Траймбетқызы → Сәмбет → Сүгірбай.

Ортақ тексерулер: `npm run lint`, `npm run typecheck`, `npm run build`. UI тесті: `npm test`. Cloud ортада тексерілген браузер қажет болса, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test` қолданылады.
