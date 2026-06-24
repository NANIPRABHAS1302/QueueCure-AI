# QueueCure-AI Final Deployment Checklist

This guide provides a comprehensive checklist and system verification plan for deploying **QueueCure-AI** to staging and production environments (Docker, Render, Heroku, AWS EC2, and MongoDB Atlas).

---

## 1. Environment Variable Registries

Verify that the target production environment contains the following keys:

- [ ] `PORT`: Express server listening port (typically `5000` or dynamically provided as `$PORT`).
- [ ] `NODE_ENV`: Set to `"production"`.
- [ ] `MONGODB_URI`: Secure connection string to MongoDB Atlas or production database cluster.
- [ ] `JWT_SECRET`: A high-entropy secret key used to sign session cookies.
- [ ] `VITE_API_URL`: Root URL of the deployed Express backend (configured in frontend env).
  * **Tip**: QueueCure-AI resolves VITE_API_URL robustly, automatically appending the `/api` prefix if omitted.

---

## 2. Pre-Deployment Integrity Checks

Before pushing code, verify the following checks:

- [ ] **Case-Sensitivity Sync**: All model imports must match filesystem capitalization (e.g., `user.js` in lowercase).
  - *Status*: Verified. All imports of `models/user.js` have been corrected to lowercase `u`.
- [ ] **Dependencies**: Node packages (`nodemailer` and `twilio`) are listed in `backend/package.json`.
- [ ] **Environment Suffixes**: Base URL endpoints in frontend pages resolve correctly without double-slashes or missing prefixes.

---

## 3. Deployment Steps

### Method A: Docker Compose (Recommended)
QueueCure-AI includes a production docker-compose configuration.

1. Build and run containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```
2. Verify Express container logs:
   ```bash
   docker compose logs backend
   ```
   *(Ensure seeder runs successfully and generates CSV dataset files in the shared volume).*

### Method B: Render / Heroku / DigitalOcean (PAAS)

#### Backend Setup:
1. Connect repository branch to Render Web Service or Heroku App.
2. Configure **Build Command**: `npm install`.
3. Configure **Start Command**: `npm start`.
4. Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).

#### Frontend Setup:
1. Connect repository branch to Render Static Site or Netlify.
2. Configure **Build Command**: `npm run build`.
3. Configure **Publish Directory**: `dist`.
4. Add environment variable (`VITE_API_URL=https://your-backend.render.com`).

---

## 4. End-to-End Post-Deployment Testing

Execute these checks once live:

- [ ] **Public Kiosk Access**: Open `/queue` on a mobile device and laptop. Ensure no auth prompts block access.
- [ ] **Auth Sign Up**: Register a test doctor and receptionist account. Verify no JWT sign-in blocks.
- [ ] **Real-Time Websocket Echo**:
  - Open `/queue` in one window and receptionist check-in dashboard in another.
  - Register a walk-in patient. Verify they immediately appear in the lobby waiting list.
- [ ] **Emergency Priority Overrides**: Fast-track a patient. Verify they instantly shift to the first position.
- [ ] **Practitioner Call**: Call next patient. Check that the lobby kiosk announces and flashes the target token.
- [ ] **Analytics Engine Aggregation**: Navigate to the analytics view. Verify that SVG charts render live database aggregates.
