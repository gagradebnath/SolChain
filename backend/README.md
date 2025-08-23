# solBend (Backend)

## Overview
solBend is the backend service for the SolChain project. It handles API requests, business logic, and database interactions.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and update values as needed.

3. **Run the server:**
   ```bash
   npm start 
   OR
   nodemon server.js
   ```

## Folder Structure

- `/src` - Source code
- `/src/routes` - API route handlers
- `/src/controllers` - Business logic
- `/src/models` - Database models

## API Endpoints

| Method | Endpoint         | Description           |
|--------|-----------------|-----------------------|
| GET    | /api/example    | Example endpoint      |

## Testing

```bash
npm test
```

## License
MIT