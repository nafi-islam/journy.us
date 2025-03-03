# 🗺️ journy.us

journy is an interactive geography game built with [Svelte](https://svelte.dev/) and [Skeleton UI](https://www.skeleton.dev/). The inspiration came from when I realized, I'm terrible at playing [travle](https://www.travle.earth/usa). The game challenges players to journey from a randomly selected start state to a target state by guessing neighboring states within a limited number of guesses.

Try the game [here](https://www.journy.us/)!

## ⭐️ Features

- **Dynamic State Selection**: Each game session generates a unique starting and target state.
- **Interactive US Map**: States are visually highlighted based on guessed paths.
- **Auto-Complete Guessing**: Suggests valid US states to help players make informed guesses.
- **Dark & Light Mode**: Switch between dark and light themes.
- **Animated Win Effect**: Players can celebrate a win with a confetti 
- **Responsive Design**: Fully optimized for desktop and mobile

## 🛠 Tech Stack

- **Frontend**: Svelte, SvelteKit, Skeleton UI
- **Backend**: Utils
- **Map Rendering**: d3.js
- **State Management**: Svelte Stores
- **Build Tool**: Vite

## 🏗 Installation & Setup

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or later)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) as package manager

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
npm dev
```
Then open `http://localhost:5173/` in your browser.

### Build for Production
```sh
npm build
```

## 🔥 Contributing

I'm all for contributions! Feel free to fork the repo, create a new branch, and submit a pull request. Frontend code can be found in `src/lib/components` and backend code is either processed in the file for encapsulation or found in `src/lib/utils.ts`.

1. Fork the repo
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a pull request

---
