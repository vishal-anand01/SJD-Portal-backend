# SJD-Portal Backend

1. Copy `.env.example` → `.env` and fill values.
2. `cd backend`
3. `npm install` (or yarn)
4. `npm run dev` (uses nodemon)
5. API base: http://localhost:5000/api

Security:
- JWT stored in HTTP-only cookie `token` with 1h expiry.
- Middleware protects endpoints and checks role tampering.
- Audit logs saved to `backend/logs` and `auditlogs` collection.
