# Deployment

This repo has three deployable apps:

- `backend`: Express API
- `frontend`: customer React app
- `admin`: Vite admin panel

## Recommended Hosting

- Backend: Render, Railway, or any Node web service
- Frontend: Vercel, Netlify, or any static hosting
- Admin: Vercel, Netlify, or any static hosting
- Database: MongoDB Atlas

## Backend

Set the backend service root directory to `backend`.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```bash
PORT=4000
BACKEND_URL=https://your-backend-url
FRONTEND_URL=https://your-frontend-url
MONGODB_URI=your-mongodb-atlas-uri
SECRET_STRIPE_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
E_MAIL=your-sender-email
E_PASS=your-email-app-password
Merchant_id=your-braintree-merchant-id
Public_key=your-braintree-public-key
Private_key=your-braintree-private-key
GEMINI_API_KEY=your-gemini-api-key
```

Use the backend URL plus `/webhook` as the Stripe webhook endpoint:

```text
https://your-backend-url/webhook
```

## Frontend

Set the frontend service root directory to `frontend`.

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
build
```

Environment variable:

```bash
REACT_APP_API_URL=https://your-backend-url
```

## Admin

Set the admin service root directory to `admin`.

Build command:

```bash
npm install && npm run build
```

Publish directory:

```text
dist
```

Environment variable:

```bash
VITE_API_URL=https://your-backend-url
```

## Local Verification

```bash
cd backend && npm start
cd frontend && npm run build
cd admin && npm run build
```
