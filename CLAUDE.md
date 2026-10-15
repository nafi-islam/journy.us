# CLAUDE.md

context for anyone (human or ai) working on journy. read this first. it is meant to be enough
for a brand new contributor who has never seen the game, svelte or skeleton.

---

## what journy is

[journy.us](https://www.journy.us/) is a daily us geography game inspired by
[travle](https://travle.earth/usa). each day you get a start state and a target state and
you name the states in between to connect them, in as few guesses as possible.

- the map is a **graph**: the lower 48 states are nodes, shared land borders are edges.
- a **breadth-first search (bfs)** finds the shortest route(s). the shortest route sets the
  par ("optimal") and you get **optimal + 3** guesses.
- two modes: the **daily challenge** (same puzzle for everyone, stats + streaks + emoji
  share) and **practice** (unlimited random puzzles with the full map visible, for learning).
- the feel is **wordle-esque**: one daily, simple input, shareable 🟩🟧🟥 result, vintage
  road-trip look, lowercase voice ("your journy today is...").

open source: <https://github.com/nafi-islam/journy.us>. contributions welcome via pull request.

## commands

```sh
npm install        # install dependencies
npm run dev        # dev server at http://localhost:5173
npm run build      # production build
npm run preview    # serve the production build
npm run check      # svelte-check (types)
npm run lint       # prettier + eslint
npm run format     # prettier --write
npm run test:unit  # vitest (engine / logic tests)
npm run test:e2e   # playwright (browser flows, uses your installed google chrome)
npm test           # unit tests, then e2e
npm run puzzles -- --from 2026-11-01 --days 30   # preview upcoming dailies
npm run map        # rebuild src/lib/map/mapData.ts (only if the projection / data changes)
```

dev tip: after editing `vite.config.ts`, restart the dev server. v1's setup could show a postcss
"unknown word" error after vite restarted itself; v2 has no postcss config, but a restart is
still the first thing to try if hot reload misbehaves.

## testing

- **unit tests (vitest)** live next to the code as `src/**/*.test.ts`. they cover the graph,
  bfs, scoring, win / lose rules and the v1 daily json. run `npm run test:unit`.
- **browser tests (playwright)** live in `tests/e2e/`. they build the app, serve it with
  `vite preview` on port 4173 and drive your installed google chrome. run `npm run test:e2e`.
  - the clock is frozen on **2026-10-11** (utc), whose daily is utah → tennessee
    (optimal 3: wyoming, nebraska, missouri). see `tests/e2e/helpers.ts`.
  - tests find elements by accessible names and `data-testid`s (`guess-chip`, `main-button`,
    `map`, `dialog-backdrop`, `stat-*`, `game-mode-switch`, `color-mode-switch`). skeleton 5
    keeps closed dialogs in the page (hidden), so assert inside `openDialog(page)`.
  - `daily.spec.ts` pins the exact v1 localStorage shapes. don't loosen it.
  - `layout.spec.ts` opens every screen on 320px and 375px phones and fails if any text is cut
    off or the page scrolls sideways. add new screens / dialogs to it.
  - `closeModal(page)` waits for a dialog to be open, then for it to finish fading out. a
    result dialog opens ~500ms after the last guess, so never press escape blindly.
- **known bugs** are written as the correct behavior and marked as expected failures
  (`it.fails` in vitest, `test.fail` in playwright). when you fix one, remove the marker so it
  becomes a normal test. to see why the e2e ones fail today:
  `SHOW_V1_BUGS=1 npx playwright test bugs`.
- **deploy gate**: `vercel.json` runs `npm run test:unit && npm run build`, so a failing unit
  test blocks a vercel deploy (there is no github actions ci).

## tech stack (v2)

- **sveltekit 3 + svelte 5** (runes) — ui framework. a `.svelte` file holds markup, a
  `<script lang="ts">` block (typescript) and optionally a `<style>` block. state uses runes
  (`$state`, `$derived`, `$props`). sveltekit config lives in `vite.config.ts` (there is no
  `svelte.config.js` in sveltekit 3).
- **skeleton 5** (`@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`, vintage theme) on
  **tailwind css 4** — components (Dialog, Toast, Combobox, Switch, Accordion) and styling.
  tailwind 4 is configured in css (`src/app.css`), not a `tailwind.config` file.
- **vite 8**, **typescript 6**, **vitest 4** (unit), **playwright** (browser), **eslint 10**,
  **prettier** (with the svelte + tailwind plugins).
- **the map is pre-built**: `scripts/build-map.ts` projects `us-atlas` (albers usa, same as v1)
  with d3-geo once and writes svg paths to `src/lib/map/mapData.ts`. d3 is a dev tool only.
- **canvas-confetti**, **tabler icons** (`@tabler/icons-svelte-runes`), self-hosted fonts via
  **fontsource** (gloria hallelujah for the logo, abril fatface for headings).
- **vercel analytics + speed insights** via vercel's plain script snippet in `src/app.html`.
- **vercel** hosts the site. every page is **prerendered** (`src/routes/+layout.ts`), so it is
  served as static files from the cdn; the game runs in the browser.
- no backend, no database. all player data lives in the browser's `localStorage`.

imports inside `src` use the `#lib` alias (node subpath imports, declared in `package.json`)
**with the file extension**, e.g. `import { game } from '#lib/game.svelte.ts'`. the engine's
own files import each other with relative paths.

## project structure

```
src/
  app.html              html shell: pre-paint light / dark script, analytics snippet
  app.css               tailwind + skeleton imports, the journy theme tweaks, small animations
  routes/
    +layout.ts          prerender = true (static site)
    +layout.svelte      header (stats / settings / help buttons), lazy modals, toasts, footer
    +page.svelte        Prompt → Map → GuessInput → Guesses, starts the game on mount
  lib/
    engine/             the game logic, plain typescript (no svelte). each file has a .test.ts
      statesGraph.ts      adjacency list of the 48 states
      search.ts           bfs: findShortestPath, findAllShortestPaths, countStatesBetween
      rules.ts            win / lose rules (evaluateGame), guess guide (getGuessScore)
      game.ts             guess input checks (formatStateName, checkGuess)
      practice.ts         random practice puzzles (getRandomStatePair)
      daily.ts            today's daily: SWITCH_DATE, legacy lookup, seeded generator
      legacy.ts           v1 daily json types + the v1 graph those puzzles use
      dates.ts            date keys, day math, challenge numbers
      stats.ts            played / win % / streaks / distribution (computeStats)
      storage.ts          localStorage (journyStats, journyDailyStats, version)
    game.svelte.ts      the ui's game state (runes): puzzle, guesses, mode, open dialog.
                        calls the engine; replaces v1's stores + Prompt/GameStatus logic
    map/mapData.ts      generated svg paths + centroids for every state (npm run map)
    theme.ts            light / dark mode (keeps skeleton v2's localStorage keys)
    toaster.ts          app-wide toasts
    confetti.ts         the win confetti
    components/
      Prompt.svelte         "your journy today is... to go from x to y"
      Map.svelte            the map (daily: only start / target / guesses; practice: all)
      GuessInput.svelte     autocomplete (Combobox, tab completes) + guess / practice / play again
      Guesses.svelte        guess chips with 🟩🟧🟥
      Modal.svelte          shared dialog frame (skeleton Dialog)
      Modals.svelte         all modals, loaded lazily after the first paint
      DailyChallengeModal.svelte  stats, today's result, share
      PracticeModal.svelte  your route vs shortest route
      HelpModal / SettingsModal / Footer
static/
  validChallenges.json  v1 daily puzzles (used until SWITCH_DATE, then deleted)
generateValidChallenges/  v1's standalone generator for the json (deleted after SWITCH_DATE)
scripts/
  puzzles.ts            prints upcoming daily puzzles (npm run puzzles)
  build-map.ts          builds src/lib/map/mapData.ts (npm run map)
tests/e2e/              playwright browser tests (helpers.ts + *.spec.ts)
playwright.config.ts    e2e config (builds, previews on :4173, uses google chrome)
vercel.json             deploy gate: unit tests run before the build
```

## how the game works

### graph

`src/lib/engine/statesGraph.ts`. 48 states (no alaska, hawaii or dc). an edge means the two states
share a **land boundary line**:

- water-only boundaries do not count (michigan–minnesota, michigan–illinois,
  new york–rhode island).
- **four corners**: states meeting at a single point do not count. v1 had arizona ↔ colorado
  but not utah ↔ new mexico; v2 removed arizona ↔ colorado so the rule is consistent (105
  borders).
- **legacy puzzles keep the v1 graph**: the daily puzzles in `validChallenges.json` were
  generated when arizona ↔ colorado was a border (79 upcoming days route through it), so
  `engine/legacy.ts` exports `legacyStatesGraph` (current graph + that border) and those days
  are played on it. every engine function takes an optional `graph` argument for this, and
  the svelte side keeps the current puzzle's graph in the `puzzleGraph` store. practice (and,
  from m2, generated dailies) use the current graph.

every edge must be listed in both directions. the graph must stay connected (tests check both).

### bfs (`engine/search.ts`)

- `findShortestPath(start, target, graph?)` — first shortest path found (order follows the
  adjacency list). used for the win check and the "shortest route" text.
- `findAllShortestPaths(start, target, graph?)` — every shortest path. used for scoring.
- `getRandomStatePair()` (`engine/practice.ts`) — practice puzzle with 2–5 states in between.

### rules (`evaluateGame` in `engine/rules.ts`)

optimal = states between start and target on a shortest path. budget = optimal + 3.
guesses can be in any order; they only need to connect start to target.

1. **win**: guesses connect start → target using exactly `optimal` guesses
2. **sub-win**: guesses connect start → target within the budget
3. **lose**: budget used without connecting (`>=`, so extra guesses can never reopen a game)
4. otherwise **playing**

`checkGuess` (`engine/game.ts`) refuses a guess when the game is over, the name isn't a state,
it was already guessed, or it's the start / target. `game.svelte.ts` exposes `evaluateGame`'s
result as `game.status` (a `$derived` rune) for the svelte components.

### guess guide (scoring)

- 🟩 on any shortest path
- 🟧 borders a state on any shortest path (start and target included)
- 🟥 otherwise

### daily puzzle (`engine/daily.ts`)

challenge #1 is **2025-04-07**. every daily has 3–5 states in between.

- **before `SWITCH_DATE`** (legacy): the puzzle comes from `static/validChallenges.json`
  (generated by v1's `generateValidChallenges/`), keyed by the **utc** date, played on the
  v1 graph.
- **from `SWITCH_DATE`** (generated): the puzzle is computed from the date in the browser,
  keyed by the player's **local** date. no download, never runs out.
- `SWITCH_DATE` is **`2026-11-01`** (challenge #574, the v2 cutover). it can never be later than
  `2030-04-06` (the day after the json ends; a test checks there is no gap). moving it never
  changes which puzzle a date gets. once it has passed, delete `static/validChallenges.json`,
  `generateValidChallenges/` and the legacy branch of `engine/daily.ts` / `engine/legacy.ts`.
- `getTodayKey()` = local date once it reaches the switch, otherwise utc. on switch night
  (behind utc) players get the switch-day puzzle from utc midnight until their local midnight,
  so no puzzle ever changes mid-day.

how the generator picks a puzzle (deterministic: same date → same puzzle, forever):

1. **pool**: every pair of states (each pair once) with 3–5 states between them on the current
   graph — 465 pairs, built in ~5 ms.
2. **day index** = days since 2025-04-07. **cycle** = day index ÷ 465. each cycle shuffles the
   whole pool with a seeded random generator (fnv-1a hash of `salt:cycle:n` → mulberry32 →
   fisher-yates), and each day takes the next pair. every pair is used once per cycle
   (~15 months), so no repeats — including reversed pairs.
3. **cycle boundary**: the first 60 days of a cycle are swapped (with days from the middle of
   the list) if their pair appeared in the last 60 days of the previous cycle, so a pair
   never comes back within 60 days.
4. a seeded coin flip per day picks which state is the start.

never change `DAILY_SALT`, the pool rules or the shuffle after release: that would change
every player's daily. `daily.test.ts` pins a few dates to catch accidents. preview upcoming
puzzles with `npm run puzzles -- --from YYYY-MM-DD --days N`.

### share text

```
journy #553 3/6
🟩🟩🟩
https://www.journy.us/
```

### localStorage contract (do not break)

players' stats live here. **rule: keep v1's keys and shapes and only ever add optional
fields.** then returning players need no migration and a rollback to v1 still reads
everything (verified by running v1 against v2-written storage). all access goes through
`engine/storage.ts`, which never throws on bad data.

| key                                               | shape                                                                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `journyStats`                                     | `{ [date]: { won, guessCount, shortestPathLength, isDaily: true } }` — one entry per finished daily                  |
| `journyDailyStats`                                | `{ [date]: { guessedStates: string[], guessCount, won, resultSeen? } }` — today's daily (older dates pruned on load) |
| `journyStorageVersion`                            | `2` — added in v2 for future migrations                                                                              |
| `modeCurrent`, `modeUserPrefers`, `modeOsPrefers` | skeleton v2 light / dark preference (json booleans, `true` = light)                                                  |

`resultSeen` (v2) = the result modal was shown, so it isn't replayed on reload.

stats (`engine/stats.ts`): played = entries, win % = wins / played (0 for new players),
streak = daily wins on consecutive calendar days (a loss or a skipped day resets it; the
current streak is alive while the last win is today or yesterday), distribution = wins by
guess count (1–8).

---

## v2 refactor (in progress on `refactor/journy-v2`)

goal: a **refactor and sophisticated redesign, not a rewrite**. keep journy's soul (daily,
wordle-esque, vintage road-trip look, lowercase voice, fog-of-war daily map, emoji share,
confetti). **keep v1's code and logic wherever possible.**

### mandatory track (ships as v2.0)

- **m0 — safety net**: vitest unit tests + playwright browser tests that pin v1 behavior,
  including known bugs as expected failures. no github actions: vercel's build runs the unit
  tests first, so a failing test blocks a deploy.
- **m1 — engine in typescript** ✅: game logic ported from `utils.ts` into
  `src/lib/engine/` (plain `.ts`, no svelte); ui stays svelte. finished games refuse
  guesses, calendar-day streaks, additive storage, four corners fixed (legacy days keep the
  v1 graph). bugs 1, 2, 3, 9 and 10 fixed.
- **m2 — daily from the date** ✅: seeded shuffle over every valid pair, so puzzles never run
  out. `SWITCH_DATE` keeps v1 puzzles until the cutover; after it, local-midnight rollover.
  the json + generator folder get deleted once the switch date has passed.
- **m3 — platform upgrade + ui uplift** ✅: sveltekit 3, svelte 5 (runes), tailwind 4,
  **skeleton 5** (kept on purpose, vintage preset + journy tweaks), prerendered static site,
  map pre-built into svg (11 kb gzipped), lazy-loaded modals, labelled buttons. lighthouse
  (local): performance 94, accessibility 100, seo 100 (live v1: 84 / 89 / 90).
- **m4 — release**: preview deploy, real-device testing, v1 save import check, switch date.

### feature track (after v2.0)

f1 road-atlas map (hand-drawn style, fog of war, route reveal animation, android haptics) ·
f2 postcard result screen with a sourced state fact · f3 opt-in hints (warmer / colder, then
compass) · f4 practice by census region · f5 twist daily (avoid a state / pass through a
state).

### decisions (and why)

| decision                                                   | why                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| four corners: neither diagonal is an edge                  | an edge = a shared land boundary line; a point isn't a line. matches how water boundaries are already excluded                                   |
| keep skeleton (v2 → v5)                                    | owner preference; skeleton 5 supports svelte 5 + tailwind 4, has every component journy uses and still ships the vintage theme                   |
| prerender the site (static)                                | v1 runs a serverless function on every visit to render html that has no puzzle in it. static is faster, free and has no node runtime to maintain |
| daily derived from the date                                | never expires, one copy of the graph / bfs, no public answer-key file, enables a future archive                                                  |
| local-midnight rollover                                    | v1 rolled at utc midnight (evening in the us). applies from `SWITCH_DATE`                                                                        |
| storage: keep v1 keys and shapes, only add optional fields | no migration step for returning players, and rollback to v1 keeps working (safer than a new key + import, which was the first plan)              |
| hints opt-in per puzzle, 💡 marker in share                | keeps the default daily pure and shares honest                                                                                                   |
| regions = u.s. census bureau regions                       | official, covers all 48 states exactly once                                                                                                      |
| twist = its own daily                                      | experts get a challenge without changing the main daily                                                                                          |

### bugs (v1 bugs fixed in m1, plus ones found during v2)

numbers match `tests/e2e/bugs.spec.ts` (4–8 were v1 design choices or data issues, not ui bugs).
each one is now a regression test.

- **bug 1**: the enter key still submitted guesses after the game was over (and overwrote
  saved stats).
- **bug 2**: switching to practice before guessing reused the daily puzzle and revealed its
  answer.
- **bug 3**: streaks didn't reset when a day was skipped.
- **bug 9**: after a mid-game reload the guess button said "practice", because any saved
  progress for today counted as "played today".
- **bug 10**: sharing from the stats modal after playing practice shared the practice guesses.
- **bug 11** (found in v2 testing): tapping practice within ~500ms of finishing the daily
  popped up a practice result for a game not played yet. the pending result is now cancelled
  when a new puzzle starts, and only a result that was really shown counts as seen.
- nitpicks: NaN win rate for new players, the result modal replaying on reload.

### future notes

- **"play past journys" archive**: planned as a feature extension for the **04.07
  anniversary** (journy's daily launched 2025-04-07). possible once the daily is derived from
  the date.
- global leaderboard / api and a share image are future discussions.

---

## conventions

these follow the history of the repo. please keep them.

### git

- commit message: one line, `type: lowercase summary`, no body. types used in this repo:
  `feat`, `fix`, `chore`, `nitpick` (tiny polish), `build`, `test`, `docs`; combined types are
  fine (`feat/chore: ...`). examples from history:
  `feat: add confetti animation when user wins`, `fix: win conditions + isValidAltPath fix`,
  `nitpick: remove unused imports, console logs, bad comments`.
- commit often, but only at working stopping points (tests and build pass) so any hash is safe
  to revert to.
- larger work happens on a branch and merges through a pull request with a summary body
  (features added, developer breakdown, main files worked in) like PR #1.

### code

- keep it simple and readable for someone new to the game and to svelte. prefer small pure
  functions over clever abstractions.
- port existing logic instead of rewriting it; keep function names when moving code.
- comments: a header above each function in the existing style, e.g.
  `// Function to find all shortest paths using BFS`; short lowercase inline comments;
  `<!-- Section -->` markers in svelte markup.
- formatting: prettier (tabs, single quotes, 100 cols — see `.prettierrc`). run `npm run format`.
- keyboard: skeleton 5's combobox follows the aria combobox pattern (arrow keys move through
  suggestions, they are not tabbable). v1's skeleton 2 autocomplete rendered buttons, so tab
  walked through them; journy now makes tab complete the input instead (`GuessInput.svelte`).
- colors: use skeleton's theme colors (`primary`, `secondary`, `tertiary`, `surface`). light /
  dark pairs like `bg-surface-100-900` only exist when the two shades **add up to 1000**; any
  other pair (e.g. `fill-surface-300-600`) silently generates nothing. for other combinations
  use an explicit `dark:` variant (`fill-surface-300 dark:fill-surface-400`).
  `src/lib/components/colorPairs.test.ts` fails the build on a bad pair.
- the map draws two layers: every state's fill first, then every border on top (so shared
  borders are never half covered). keep that order when changing `Map.svelte`.

### debugging

- use `console.log` / `console.group` while working; remove them (or leave them commented out)
  before committing, as in `chore: missing function headers and print clean ups`.
- to see any day's daily puzzle (and its answer): `npm run puzzles -- --from YYYY-MM-DD --days 1`.
- svelte 5 devtools: `$inspect(value)` logs a rune whenever it changes (remove before committing).
- reset your local game state with `localStorage.clear()` in the browser console.
