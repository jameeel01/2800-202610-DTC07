# Shaded

**Shade Vancouver, Together.**

Shaded is a community-driven web app that lets Vancouver residents nominate locations for new trees. Users drop a pin on a map, describe why the spot needs shade, and the community upvotes the most important locations. Together we can help the City of Vancouver prioritize where to plant shade next.

---

## Team

**DTC-07**

| Name | GitHub |
|------|--------|
| Carlos Movilla | |
| Jericho Rosell | |
| Jameel Mohammed | |
| Cedrik Melendez | |
| Kevin Wu Chen | |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Leaflet |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| Map data | Vancouver Open Data street-trees API |
| Geocoding | Nominatim (OpenStreetMap) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB connection string (Atlas or local)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-org/2800-202610-DTC07.git
cd 2800-202610-DTC07
```

---

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

Start the backend:

```bash
node index.js
```

The server runs at `http://localhost:5001`. Verify it's working:

```
http://localhost:5001/api/health
```

---

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGODB_URI` | `backend/.env` | MongoDB connection string |
| `JWT_SECRET` | `backend/.env` | Secret key for signing JWT tokens |
| `PORT` | `backend/.env` | Port for the Express server (default: 5001) |
| `FRONTEND_URL` | `backend/.env` | Deployed frontend URL (for CORS) |
| `VITE_API_URL` | `frontend/.env` | Deployed backend URL |

---

## Deployment

The app is deployed with **Vercel** (frontend) and **Render** (backend). MongoDB stays on **Atlas**.

### Backend → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo
3. Set the root directory to `backend`
4. Set the build command to `npm install` and start command to `node index.js`
5. Add these environment variables in the Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` — set this to your Vercel URL after deploying the frontend
6. Copy the Render URL (e.g. `https://shaded-api.onrender.com`) as you'll need it for the frontend

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set the root directory to `frontend`
3. Add this environment variable in the Vercel dashboard:
   - `VITE_API_URL` paste the Render backend URL from above
4. Deploy: Vercel auto-deploys on every push to `main`

### After both are deployed
- Go back to Render and set `FRONTEND_URL` to your Vercel URL
- Redeploy the backend so the CORS update takes effect

---

## Data Sources

- **Vancouver Open Data — Street Trees**
  `https://opendata.vancouver.ca/explore/dataset/street-trees`
  Used to calculate average tree canopy size for the Impact Estimate page.

- **Nominatim (OpenStreetMap)**
  `https://nominatim.openstreetmap.org`
  Used to convert map coordinates into a readable street address when a user drops a nomination pin.

- **City of Vancouver Urban Forest Strategy**
  `https://vancouver.ca/files/cov/2025-urban-forest-strategy.pdf`
  Referenced for temperature reduction and CO₂ absorption estimates shown on the Impact Estimate page.

---

*This README was edited with the assistance of [Claude](https://claude.ai) (Anthropic).*
