# Shaded

**Shade Vancouver, Together.**

Shaded is a community-driven web app that lets Vancouver residents nominate locations for new trees. Drop a pin on the map, describe why the spot needs shade, and the community upvotes the most important locations — helping the City of Vancouver prioritize where to plant next.

---

## Live Deployment

| | URL |
|--|-----|
| Frontend | https://2800-202610-dtc-07.vercel.app |
| Backend | https://two800-202610-dtc07.onrender.com |

---

## Test Credentials

Use these to log in and explore the app without creating an account:

| Field | Value |
|-------|-------|
| Email | `test@shaded.app` |
| Password | `Test1234!` |

---

## Team

**DTC-07**

| Member | Name |
|--------|------|
| 1 | Carlos Movilla |
| 2 | Jericho Rosell |
| 3 | Jameel Mohammed |
| 4 | Cedrik Melendez |
| 5 | Kevin Wu Chen |

---

## Features

- **Interactive map** — browse all community nominations on a Leaflet map of Vancouver
- **Drop a pin** — nominate any street location for a new tree
- **Impact estimate** — each nomination shows a calculated temperature reduction, tree count, and shade area based on the City of Vancouver street-tree dataset
- **Upvoting** — logged-in users can upvote nominations; the count drives the impact estimate
- **Heatmap overlay** — toggle a live density layer to see where nominations are clustering
- **AI suggestions** — Gemini generates a nomination description based on your chosen location
- **Photo upload** — attach a photo of the location to your nomination via Cloudinary
- **Nomination detail page** — full view of any nomination with description, photo, and impact stats
- **My Profile** — view and manage your own nominations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS, Leaflet / react-leaflet |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, bcryptjs |
| AI | Google Gemini API |
| Photo storage | Cloudinary |
| Map data | City of Vancouver Open Data (street-trees) |
| Geocoding | Nominatim (OpenStreetMap) |
| Heatmap | Leaflet.heat |
| Frontend deployment | Vercel |
| Backend deployment | Render |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB connection string (Atlas or local)
- A Gemini API key (Google AI Studio — free tier works)
- A Cloudinary account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/jameeel01/2800-202610-DTC07.git
cd 2800-202610-DTC07
```

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
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
node index.js
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside `/frontend`:

```
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Data Sources

- **Vancouver Open Data — Street Trees**
  `https://opendata.vancouver.ca/explore/dataset/public-trees`
  Used to calculate canopy size, shade area, and temperature reduction estimates shown on each nomination.

- **Nominatim (OpenStreetMap)**
  `https://nominatim.openstreetmap.org`
  Converts map coordinates into a readable street address when a user drops a nomination pin.

- **City of Vancouver Urban Forestry Strategy**
  Referenced for temperature reduction and environmental impact methodology used in the Impact Estimate calculations.

---

*This README was generated with the assistance of [Claude](https://claude.ai) (Anthropic).*
