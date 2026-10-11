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
```

dev tip: whenever vite restarts itself (first `npm run dev` after a fresh install, or after you
edit `vite.config.ts` / `svelte.config.js`), the page can fail with a postcss "unknown word"
error for `+layout.svelte`. stop the dev server and start it again; it's not a code problem.

## testing

- **unit tests (vitest)** live next to the code as `src/**/*.test.ts`. they cover the graph,
  bfs, scoring, win / lose rules and the v1 daily json. run `npm run test:unit`.
- **browser tests (playwright)** live in `tests/e2e/`. they build the app, serve it with
  `vite preview` on port 4173 and drive your installed google chrome. run `npm run test:e2e`.
  - the clock is frozen on **2026-10-11** (utc), whose daily is utah → tennessee
    (optimal 3: wyoming, nebraska, missouri). see `tests/e2e/helpers.ts`.
  - the map is still fetched from jsdelivr in v1, so e2e tests need a network connection.
  - `daily.spec.ts` pins the exact v1 localStorage shapes. don't loosen it.
- **known bugs** are written as the correct behavior and marked as expected failures
  (`it.fails` in vitest, `test.fail` in playwright). when you fix one, remove the marker so it
  becomes a normal test. to see why the e2e ones fail today:
  `SHOW_V1_BUGS=1 npx playwright test bugs`.
- **deploy gate**: `vercel.json` runs `npm run test:unit && npm run build`, so a failing unit
  test blocks a vercel deploy (there is no github actions ci).

## tech stack (v1, current `main`)

- **sveltekit 2 + svelte 4** — ui framework. `.svelte` files hold markup, a
  `<script lang="ts">` block (typescript) and a `<style>` block.
- **skeleton ui 2** (vintage theme) on **tailwind css 3** — components (modals, toasts,
  autocomplete, accordion, light switch) and styling.
- **d3-geo + topojson-client** — draws the us map from the `us-atlas` topojson (fetched from
  jsdelivr at runtime) with the albers usa projection.
- **canvas-confetti**, **tabler icons**, **vercel analytics + speed insights**.
- **vercel** hosts the site (`@sveltejs/adapter-vercel`).
- no backend, no database. all player data lives in the browser's `localStorage`.

the v2 refactor upgrades this stack; see "v2 refactor" below.

## project structure

```
src/
  app.html, app.postcss, app.d.ts
  routes/
    +layout.svelte      header (stats / settings / help buttons), modals, toasts, analytics
    +page.svelte        Prompt → Map → GuessInput → Guesses → GameStatus
  lib/
    statesGraph.ts      adjacency list of the 48 states
    utils.ts            bfs, random puzzle, scoring, win / lose rules (gameStatus)
    stores.ts           svelte stores (shared state)
    statistics.ts       load / save journyStats
    components/
      Prompt.svelte         loads the daily (json) or a practice puzzle, restores progress
      Map.svelte            renders the map, colors start / target / guesses
      GuessInput.svelte     autocomplete input + guess / practice / play again button
      Guesses.svelte        guess chips with 🟩🟧🟥
      GameStatus.svelte     no ui: confetti, result modal, records the daily result
      DailyChallengeModal.svelte  stats, result, share
      PracticeModal.svelte  your route vs shortest route
      HelpModal / SettingsModal / Footer
  lib/*.test.ts         vitest unit tests (next to the code they test)
static/
  validChallenges.json  v1 daily puzzles 2025-04-07 → 2030-04-05 (generated)
generateValidChallenges/  standalone ts-node script that generated the json
tests/e2e/              playwright browser tests (helpers.ts + *.spec.ts)
playwright.config.ts    e2e config (builds, previews on :4173, uses google chrome)
vercel.json             deploy gate: unit tests run before the build
```

## how the game works

### graph

`src/lib/statesGraph.ts`. 48 states (no alaska, hawaii or dc). an edge means the two states
share a **land boundary line**:

- water-only boundaries do not count (michigan–minnesota, michigan–illinois,
  new york–rhode island).
- **four corners**: states meeting at a single point do not count. v1 had arizona ↔ colorado
  but not utah ↔ new mexico; v2 removes arizona ↔ colorado so the rule is consistent.

every edge must be listed in both directions. the graph must stay connected (tests check both).

### bfs (`src/lib/utils.ts`)

- `findShortestPath(start, target)` — first shortest path found (order follows the adjacency
  list). used for the win check and the "shortest route" text.
- `findAllShortestPaths(start, target)` — every shortest path. used for scoring.
- `getRandomStatePair()` — random practice puzzle with 2–5 states in between.

### rules (`gameStatus` in `utils.ts`)

optimal = states between start and target on a shortest path. budget = optimal + 3.
guesses can be in any order; they only need to connect start to target.

1. **win**: guesses connect start → target using exactly `optimal` guesses
2. **sub-win**: guesses connect start → target within the budget
3. **lose**: budget used without connecting
4. otherwise **playing**

### guess guide (scoring)

- 🟩 on any shortest path
- 🟧 borders a state on any shortest path (start and target included)
- 🟥 otherwise

### daily puzzle

v1 reads today's **utc** date from `static/validChallenges.json` (3–5 states in between).
challenge #1 is **2025-04-07**. v2 computes the puzzle from the date instead (see below).

### share text

```
journy #553 3/6
🟩🟩🟩
https://www.journy.us/
```

### localStorage contract (do not break)

players' stats live here. any change must import the old data (see "v2 refactor").

| key                                               | shape                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `journyStats`                                     | `{ [date]: { won, guessCount, shortestPathLength, isDaily: true } }` — one entry per finished daily         |
| `journyDailyStats`                                | `{ [date]: { guessedStates: string[], guessCount, won } }` — today's in-progress daily (older dates pruned) |
| `modeCurrent`, `modeUserPrefers`, `modeOsPrefers` | skeleton v2 light / dark preference (json booleans, `true` = light)                                         |

stats: played = entries, win % = wins / played, streak = consecutive daily wins,
distribution = wins by guess count (1–8).

---

## v2 refactor (in progress on `refactor/journy-v2`)

goal: a **refactor and sophisticated redesign, not a rewrite**. keep journy's soul (daily,
wordle-esque, vintage road-trip look, lowercase voice, fog-of-war daily map, emoji share,
confetti). **keep v1's code and logic wherever possible.**

### mandatory track (ships as v2.0)

- **m0 — safety net**: vitest unit tests + playwright browser tests that pin v1 behavior,
  including known bugs as expected failures. no github actions: vercel's build runs the unit
  tests first, so a failing test blocks a deploy.
- **m1 — engine in typescript**: move game logic into `src/lib/engine/` (plain `.ts`, no
  svelte) by porting `utils.ts`; ui stays svelte. explicit game states, calendar-day streaks,
  versioned storage with v1 import.
- **m2 — daily from the date**: seeded shuffle over every valid pair, so puzzles never run
  out and the json goes away. a `SWITCH_DATE` keeps v1 puzzles until the cutover.
- **m3 — platform upgrade + ui uplift**: latest sveltekit, svelte 5 (runes), tailwind 4,
  **skeleton 5** (kept on purpose, custom theme from the vintage preset), prerendered static
  site, map pre-built into svg at build time.
- **m4 — release**: preview deploy, real-device testing, v1 save import check, switch date.

### feature track (after v2.0)

f1 road-atlas map (hand-drawn style, fog of war, route reveal animation, android haptics) ·
f2 postcard result screen with a sourced state fact · f3 opt-in hints (warmer / colder, then
compass) · f4 practice by census region · f5 twist daily (avoid a state / pass through a
state).

### decisions (and why)

| decision                                                            | why                                                                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| four corners: neither diagonal is an edge                           | an edge = a shared land boundary line; a point isn't a line. matches how water boundaries are already excluded                                   |
| keep skeleton (v2 → v5)                                             | owner preference; skeleton 5 supports svelte 5 + tailwind 4, has every component journy uses and still ships the vintage theme                   |
| prerender the site (static)                                         | v1 runs a serverless function on every visit to render html that has no puzzle in it. static is faster, free and has no node runtime to maintain |
| daily derived from the date                                         | never expires, one copy of the graph / bfs, no public answer-key file, enables a future archive                                                  |
| local-midnight rollover                                             | v1 rolled at utc midnight (evening in the us). applies from `SWITCH_DATE`                                                                        |
| storage: one versioned key, import v1, never delete v1 keys in v2.0 | protects returning players' stats and makes rollback safe                                                                                        |
| hints opt-in per puzzle, 💡 marker in share                         | keeps the default daily pure and shares honest                                                                                                   |
| regions = u.s. census bureau regions                                | official, covers all 48 states exactly once                                                                                                      |
| twist = its own daily                                               | experts get a challenge without changing the main daily                                                                                          |

### v1 bugs being fixed

numbers match `tests/e2e/bugs.spec.ts` (4–8 were v1 design choices or data issues, not ui bugs).

- **bug 1**: the enter key still submits guesses after the game is over (and overwrites saved
  stats).
- **bug 2**: switching to practice before guessing reuses the daily puzzle and reveals its
  answer.
- **bug 3**: streaks don't reset when a day is skipped.
- **bug 9**: after a mid-game reload the guess button says "practice", because any saved
  progress for today counts as "played today".
- nitpicks fixed along the way: NaN win rate for new players, the result modal replaying on
  reload.

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

### debugging

- use `console.log` / `console.group` while working; remove them (or leave them commented out)
  before committing, as in `chore: missing function headers and print clean ups`.
- to inspect a daily puzzle locally, read it from the browser console:
  `await fetch('/validChallenges.json').then(r => r.json()).then(c => c['YYYY-MM-DD'])`.
- reset your local game state with `localStorage.clear()` in the browser console.
