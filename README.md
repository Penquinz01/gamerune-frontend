# GameRune

GameRune is a React app for discovering games and quickly comparing the details that matter before deciding what to play or buy.

The app is designed to help users browse games, search by name, filter by genre, and open a game card for more information.

## Planned Game Details

Each game listing can include:

- Price
- Description
- Estimated time to finish
- User or critic rating
- ProtonDB rating for Linux and Steam Deck compatibility

## Current UI

The current interface includes:

- Responsive full-screen layout
- Search header
- Genre filter sidebar
- Square game cards with image areas
- Expandable cards for larger previews
- Dark radial-gradient theme based on the project color palette

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Environment Files

The app uses Vite environment variables for backend endpoints.

- `.env` stores shared endpoint path defaults.
- `.env.local` stores local machine settings and is ignored by Git.
- `.env.production` stores production endpoint settings.

After changing any env file, restart the Vite dev server so the new values are loaded.
