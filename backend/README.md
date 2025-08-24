# SolChain Project - Backend & Frontend Setup

This guide provides step-by-step instructions to set up both the backend API server and the frontend React Native/Web app (`frontend/my-app`) for the SolChain platform.

---

## Backend Setup (`backend/`)

### Prerequisites

- Node.js v16 or higher
- npm

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and update values as needed.
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **API Endpoints:**
   - The backend exposes RESTful APIs under `/api/` (see `backend/routes/` for details).
   - The main entry point is `server.js`.

---

## Frontend Setup (`frontend/my-app/`)

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for React Native development)

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend/my-app
   npm install
   # or
   yarn install
   ```

2. **Configure API Base URL:**
   - Inside `frontend/my-app/assets/`, there is a `config.js` file:
     ```js
     const config = {
       API_BASE_URL: "http://192.168.0.193:5000/api",
       timeout: 5000,
       retries: 3
     };
     export default config;
     ```
   - Update `API_BASE_URL` to match your backend server address if needed.
   - This file is used throughout the frontend to make API calls to the backend defined in `backend/server.js`.

3. **Start the frontend app:**
   - For mobile (Expo Go app on iOS/Android):
     ```bash
     npx expo start
     ```
   - For web:
     ```bash
     npx expo start --web
     ```

---

## Connecting Frontend and Backend

- The frontend uses the `API_BASE_URL` from `frontend/my-app/assets/config.js` to communicate with the backend API endpoints served by `backend/server.js`.
- Ensure both servers are running and that the `API_BASE_URL` in `config.js` matches the backend server's address and port.

---

## Folder Structure

```
backend/
  routes/         # API route definitions
  server.js       # Main backend entry point

frontend/my-app/
  assets/
    config.js     # API base URL and frontend config
  screens/        # App screens/pages
```

---


## Creae a .env file at backend/
```
PORT=YOUR_PORT 
NODE_ENV=development
DATABASE_URL=YOUR_DB_URL
JWT_SECRET=YOUR_SECRET_KEY
```

## License