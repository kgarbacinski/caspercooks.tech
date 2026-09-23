# Brief: caspercooks.tech — redesign v2 („ma robić wow”)

Dokument przekazania do nowej sesji. Przeczytaj w całości przed pierwszą akcją.

## Kontekst

Portfolio Kacpra (Next 15, React 19, Tailwind 3, framer-motion, lenis). Gałąź `redesign/papercraft`,
**nic nie jest zacommitowane** — pierwszy krok nowej sesji: commit obecnego stanu jako punkt wyjścia
(zapytaj użytkownika, czy może).

Wizja: strona w stylu gabeonchain.com — hero to **lewitująca papierowa diorama** (5 pokoi na wyspie
w pustce, świecące kable pod spodem), cała strona w motywie papercraft. Przełącznik DEV ⇄ CEO
zmienia dioramę (developer: zielone kable; founder: pomarańczowe) i akcent.

## Werdykt użytkownika o v1 (dosłownie)

> „no tak średnio podoba; tak biednie teraz wygląda”

Konkretne uwagi:
1. **Przełączenie na CEO** — za mało się dzieje. Pomysły użytkownika: *nowy ludek wskakuje, a stary
   zeskakuje*, albo *ubrania mu się zmieniają* (animacja przebierania).
2. **Hover pokoju jest za sztywny** — ma się podświetlać **grafika całego pokoju** (dokładny kształt),
   a nie sztywny wielokąt/trójkąt.
3. **Niektóre sekcje wyglądają biednie** — wolno je **całkowicie przebudować**, zachowując tylko
   **teksty o Kacprze**. Nie trzymaj się struktury starej strony.
4. Ogólnie: „niesamowita strona z efektami wow, dopracowana do finalnego stopnia”.

## Stan v1 (co już jest i działa)

| Plik | Co robi |
|---|---|
| `components/FloatingDiorama.tsx` | hero: dwie wyspy (`public/diorama/island*.webp`, wycięte z tła), lewitacja, tilt za kursorem, paralaksa, iskry (canvas), hover pokoju (wielokąt + clip-path — **do wymiany**), choreografia przełączenia (fazy) |
| `contexts/ThemeContext.tsx` | fazy przełączenia `leaving → covered → entering → idle`, oś czasu `SWITCH` |
| `components/ThemeWipe.tsx` | kurtyna z papieru kraft + woskowa pieczęć KG |
| `components/PageEffects.tsx` | Lenis (`window.__lenis`), fold-in kart, reflektor pod kursorem na kartach |
| `components/ui/Section.tsx` | nagłówek sekcji + miniatura pokoju (`public/diorama/rooms/{dev,founder}-N.webp`) + `CableDivider` |
| `app/globals.css` | tokeny, `.paper-card` (ziarno, deckle), `@keyframes lights-on` (światła pokój po pokoju) |
| `tailwind.config.ts` | paleta: night / cocoa / paper / ember / `accent` (zmienna CSS) |
| sekcje | `AboutSection`, `ProjectsTimeline`, `TechStack`, `BrandsShowcase`, `TikTokSection`, `ContactSection`, `Footer` — przestylowane, ale strukturalnie stare → **kandydaci do przebudowy** |

Źródła grafik (pełna rozdzielczość 2752×1536): `../casper-room/gen/keys/wide5_face.jpg` (dev),
`founder5.jpg` (CEO). Zdjęcie twarzy: `../casper-room/ref/head_color.jpg`.

## Pomysły do realizacji (rekomendacje — dobierz i rozwiń)

### A. Figurka jako osobna warstwa → wskakiwanie / przebieranie
Dziś figurka jest „wklejona” w obraz wyspy, więc nie da się jej animować. Plan:
1. W Gemini (Nano Banana, edycja obrazu) z każdej dioramy zrób wersję **bez figurki**
   („remove the figurine, fill the floor naturally, keep everything else identical”).
2. Z oryginałów wytnij **samą figurkę** (dev: t-shirt; CEO: marynarka) → sprite z przezroczystością
   (maska: różnica oryginał vs wersja bez figurki + czyszczenie). Dodatkowo z Gemini: 3–4 pozy
   figurki na jednolitym tle (skok/kucnięcie/lądowanie, obie stylizacje) → wycięcie.
3. Animacja przełączenia (wybierz najlepszą, najlepiej obie):
   - **skok**: stara figurka kuca (squash), wybija się łukiem poza wyspę (stretch, rotacja),
     nowa spada z góry na miejsce z odbiciem i kurzem z papieru,
   - **przebieranie**: figurka obraca się jak kartka (rotateY 90°), w połowie podmiana sprite'a,
     wokół rozsypują się papierowe ścinki/konfetti; albo „papierowy pasek” zjeżdża po ubraniu
     i odsłania nowe (clip-path),
   - ewentualnie figurka reaguje na hover (macha, rozgląda się) — kilka klatek sprite'ów.
4. Wyspa bez figurki + figurka jako warstwa = figurka może też podążać wzrokiem/tiltem osobno (paralaksa głębi).

### B. Hover pokoju = dokładny kształt pokoju
- Wygeneruj **maskę każdego pokoju** (10 masek: 5 × 2 dioramy). Opcje: Gemini edycja
  „paint room N pure white, everything else pure black” → progowanie w ImageMagick; albo
  segmentacja lokalna (SAM przez `pip install segment-anything`/`transformers`, jeśli się uda).
- Użyj masek jako `mask-image` na kopii wyspy: hover = pokój rozjaśnia się dokładnie w swoim
  kształcie, reszta przygasa; pokój lekko **wyjeżdża do przodu** (translateZ/scale 1.04 + cień),
  miękka poświata po konturze maski (drop-shadow w kolorze akcentu).
- Strefy klikalne też z masek (hit-test po kanale alfa na canvasie zamiast prostokątów).

### C. Sekcje od nowa (tylko teksty zostają) — każda jako „pokój”
Propozycje (wybierz, doprecyzuj, zrób naprawdę efektownie):
- **About** — przypięta (sticky) scena: kamera „wjeżdża” w pokój Dev cave / CEO office
  (zoom + paralaksa warstw miniatury), tekst pojawia się jak notatki przypinane do tablicy.
- **Projects** — oś czasu jako **papierowe szuflady/teczki**, które wysuwają się przy scrollu
  (horizontal pinned scroll), albo stos kart, który się tasuje; logo firm jak pieczątki.
- **Tech stack** — **pegboard z narzędziami** (każda technologia to papierowe narzędzie na haczyku,
  hover je zdejmuje i pokazuje „used in”).
- **Brands** — **szyldy/witryny sklepów** na papierowej uliczce (horizontal scroll), każda marka
  jako fasada; hover zapala neon/lampę.
- **TikTok** — telefon w studiu z ring lightem, który „nagrywa” (czerwona kropka, licznik).
- **Contact** — **list + koperta**: po wysłaniu formularza kartka składa się, wchodzi do koperty,
  woskowa pieczęć KG ją zamyka i koperta odlatuje (formularz musi dalej działać: POST `/api/contact`,
  pola `{name,email,message,type}`).
- Między sekcjami: kable, ale też może **jedna ciągła „wyspa”** — scroll prowadzi przez pokoje.

### D. Ogólne „wow”
- Preloader: pieczęć KG + zapalanie świateł jako intro.
- Kursor: mała papierowa latarka/iskra, trail z iskier.
- Dźwięk (opcjonalnie, domyślnie wyłączony): szelest papieru przy przełączeniu, klik pieczęci.
- Dopracowanie: typografia (Fraunces + JetBrains Mono; rozważ usunięcie Inter), rytm odstępów,
  mikrointerakcje na każdym przycisku.

## Wymagania jakościowe (nie pomijać)
- **Nie modelujemy ręcznie 3D/proceduralnie** — grafiki z Gemini/AI albo wysokiej jakości assety
  (patrz pamięć „no-hand-modeling”).
- **Pętla krytyka**: po każdym dużym kroku niezależny subagent-krytyk (ocena 1–10: wow, polish,
  spójność, switch, bliskość do gabeonchain) na **zrzutach klatek w czasie rzeczywistym**; cel ≥ 9.
  Na końcu self-review + krytyk (wymóg użytkownika).
- Teksty o Kacprze bez zmian treści; mobile 390 px musi wyglądać świetnie; `prefers-reduced-motion`.
- `npx tsc --noEmit` i `npx next build` przechodzą; zatrzymaj `next dev` przed buildem
  (inaczej psuje `.next` → „__webpack_modules__[moduleId] is not a function”).

## Pułapki z poprzedniej sesji (oszczędzą godziny)
- **Zrzuty animacji**: karta Brave zwykle jest w tle → przeglądarka zamraża rAF, zrzuty kłamią.
  Używaj skryptu CDP: `/tmp/casper-room/cdp_shots.mjs` (Node 24:
  `~/.nvm/versions/node/v24.19.0/bin/node cdp_shots.mjs <url> <outdir> '<plan JSON>' [w] [h]`,
  plan: `[[ms,"shot"|"eval:<js>",name],…]`) — headless Chrome w czasie rzeczywistym.
  Do pomiaru timingu: `/tmp/casper-room/cdp_probe.mjs`. (Kopie leżą też w `../casper-room/cdp_shots.mjs` i `cdp_probe.mjs`; jeśli zniknęły,
  odtwórz: prosty klient CDP na wbudowanym `WebSocket` z Node 24.) Uwaga: capture ma ~250 ms opóźnienia.
  `--virtual-time-budget` w headless NIE działa z tą stroną (zatrzymuje się ~1 s).
- **Framer-motion `times` w długich sekwencjach keyframe'ów** rozjeżdżały się o ~300 ms —
  proste tweeny z `delay` albo CSS `@keyframes` są pewniejsze (zapalanie świateł jest w CSS).
- Tailwind `boxShadow` z kolorami `rgb(r g b / a)` → podstawia currentColor; używaj `rgba(r,g,b,a)`.
- Gemini (Brave, zalogowany Kacper): obrazy wklejaj przez schowek
  (`osascript -e 'set the clipboard to (read (POSIX file "…jpg") as JPEG picture)'` + cmd+v),
  wysyłaj przyciskiem (Enter często nie działa), pełna rozdzielczość: „Download full size image”
  → `~/Downloads/Gemini_Generated_Image_*` (filtruj po czasie — w Downloads leżą stare pliki
  o tej samej nazwie!). **Veo w Gemini dodaje widoczny znak wodny i odmawia animowania realnej
  twarzy** — nie używaj go do assetów na stronę.
- Wycinanie wyspy z czarnego tła: próg jasności 9% + morfologia + największy komponent
  (komendy w historii: `magick … -threshold 9% -morphology Open Disk:5 -morphology Close Disk:10
  -connected-components 8 …`).
