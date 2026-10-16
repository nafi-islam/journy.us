# 🗺️ journy.us

journy is an interactive geography game built with [Svelte](https://svelte.dev/) and [Skeleton](https://www.skeleton.dev/). The inspiration came from when I realized, I'm terrible at playing [travle](https://www.travle.earth/usa). The game challenges players to journey from a start state to a target state by guessing neighboring states within a limited number of guesses.

Try the game [here](https://www.journy.us/)!

## ⭐️ Features

- **Game Modes**: Choose between a daily challenge or practice mode
- **Endless Daily Challenges**: A new puzzle every day at your local midnight, the same puzzle for everyone
- **Daily Statistics Tracking**: Players can follow their progress day by day through games played, win rate, and their streak
- **Fog of War Map**: The daily map only reveals the start, the target, and the states you guess
- **Interactive US Map**: States are visually highlighted based on guessed paths
- **Auto-Complete Guessing**: Suggests valid US states to help players make informed guesses
- **Guess Guide**: Visual cues (🟩🟧🟥) to show if a guess is on a shortest path
- **Dark & Light Mode**: Switch between dark and light themes
- **Animated Win Effect**: Celebrate a win with confetti
- **Share**: Share your daily challenge guess guide with friends for friendly competition
- **Responsive Design**: Fully optimized for desktop and mobile

## 🧭 How It Works

The map is a graph: each of the lower 48 states is a node, and two states are connected when they share a border line (corners don't count). A breadth-first search finds the shortest route between the start and target states. The shortest route sets the par, and you get par + 3 guesses. Daily puzzles are generated from the date with a seeded shuffle, so they never run out and every player gets the same one.

## 🛠 Tech Stack

- **Frontend**: Svelte 5, SvelteKit 3, Skeleton 5, Tailwind CSS 4
- **Game Engine**: plain TypeScript in `src/lib/engine` (graph, BFS, rules, daily generator, stats)
- **Map**: pre-built SVG paths (projected once with d3-geo from us-atlas)
- **State Management**: Svelte runes
- **Testing**: Vitest (unit) and Playwright (browser)
- **Build & Hosting**: Vite, prerendered static site on Vercel

## 🏗 Installation & Setup

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v22.17 or later)
- [npm](https://www.npmjs.com/)
- [Google Chrome](https://www.google.com/chrome/) (for the browser tests)

### Clone the Repository

```sh
git clone https://github.com/nafi-islam/journy.us.git
cd journy.us
```

### Install Dependencies

```sh
npm install
```

### Run the Development Server

```sh
npm run dev
```

Then open `http://localhost:5173/` in your browser.

### Run the Tests

```sh
npm test
```

### Build for Production

```sh
npm run build
```

## 🔥 Contributing

I'm all for contributions! Feel free to fork the repo, create a new branch, and submit a pull request. Start with [`CLAUDE.md`](CLAUDE.md): it explains how the game works, the project structure, and the conventions. The game logic lives in `src/lib/engine` and the user interface in `src/lib/components`.

1. Fork the repo
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a pull request

---
