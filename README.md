# Aarvieve Arcade 🎮❤️

A personalized Y8-inspired gaming platform

## Project Structure

This project is organized as an npm workspace. Currently, it contains the frontend client:

- `client/` - The main frontend application built with React, Vite, TypeScript, Tailwind CSS, Phaser.js, Framer Motion, and Zustand. It connects directly to Firebase for backend services (Authentication, Firestore, Storage).

## Setup & Running Locally

1. Install dependencies from the root directory:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Environment Variables

To run the project with real data, copy the `.env.example` file in the `client` directory to `.env` and fill in your Firebase credentials.
```bash
cd client
cp .env.example .env
```
*(You can also set `VITE_USE_MOCK_FIREBASE=true` if you want to test the UI completely offline without setting up Firebase).*

## Deployment

This project is configured for seamless deployment to modern hosting platforms.

### Vercel (Recommended)
Vercel is the best way to host this Vite application.
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
*Note: Make sure to paste your Firebase `.env` variables in the Vercel dashboard.*

### Render
If deploying the frontend to Render as a Static Site:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: `client`
- **Redirects/Rewrites**: Set a rewrite rule from `/*` to `/index.html` to support React Router.
