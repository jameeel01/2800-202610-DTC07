# Shaded

**Shade Vancouver, Together.**

Shaded is a community-driven web app that lets Vancouver residents nominate locations for new trees. Drop a pin on the map, describe why the spot needs shade, and the community upvotes the most important locations — helping the City of Vancouver prioritize where to plant next.

---

## Live Deployment

| | URL |
|--|-----|
| Frontend | https://2800-202610-dtc-07.vercel.app |
| Backend | https://two800-202610-dtc07.onrender.com |

> **Note:** The backend runs on Render's free tier and may take 30–60 seconds to wake up after a period of inactivity. If nominations or login appear slow on first load, wait a moment and try again.

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

## File Structure

```
2800-202610-DTC07/
├── backend/
│   ├── models/
│   │   ├── Nomination.js        # Mongoose schema for nominations
│   │   └── User.js              # Mongoose schema for users
│   ├── utils/
│   │   ├── shadeCalc.js         # Vancouver tree dataset aggregation
│   │   └── utils.js             # JWT, DB connection, helpers
│   ├── index.js                 # Express server, all API routes
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── ShadedPin.png        # Custom map pin icon
│   │   └── ShadedPinHighlighted.png
│   ├── src/
│   │   ├── assets/              # Images and SVGs
│   │   ├── components/
│   │   │   ├── AISuggester.jsx      # Gemini AI suggestion markers
│   │   │   ├── BottomSheet.jsx      # Mobile nomination form
│   │   │   ├── HeatMapLayer.jsx     # Leaflet.heat density layer
│   │   │   ├── Map.jsx              # Main interactive map
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── NominationPopup.jsx  # Pin click popup card
│   │   │   ├── NominationsPanel.jsx # Bottom slide-up nominations list
│   │   │   ├── OnboardingTour.jsx   # First-time user tour
│   │   │   ├── StarRating.jsx       # Star rating display
│   │   │   └── StatCard.jsx         # Impact stat card
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx         # Combined login / sign up
│   │   │   ├── Home.jsx             # Logged-in home screen
│   │   │   ├── ImpactEstimatePage.jsx # Full impact breakdown
│   │   │   ├── MapPage.jsx          # Map page wrapper
│   │   │   ├── NominationDetailPage.jsx # Single nomination view
│   │   │   ├── NominationPage.jsx   # All nominations list
│   │   │   ├── Profile.jsx          # User profile and nominations
│   │   │   └── landingPage.jsx      # Public landing page
│   │   ├── utils/
│   │   │   ├── auth.js              # Auth helper functions
│   │   │   └── shadeCalc.js         # Impact calculation functions
│   │   ├── App.jsx                  # Routes
│   │   └── App.css                  # Global styles
│   └── package.json
└── readme.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB connection string (Atlas or local)
- A Gemini API key ([Google AI Studio](https://aistudio.google.com) — free tier works)
- A Cloudinary account ([cloudinary.com](https://cloudinary.com) — free tier works)

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

### Troubleshooting

- **Nominations not loading:** The Render backend may be sleeping. Wait 30–60 seconds and refresh.
- **Map not showing:** Check that your browser allows location access, or zoom in manually to Vancouver.
- **AI suggestions not appearing:** Confirm `GEMINI_API_KEY` is set in `backend/.env`.
- **Photo upload failing:** Confirm all three Cloudinary env vars are set correctly in `backend/.env`.
- **CORS errors in development:** Ensure `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`.

---

## Data Sources

- **Vancouver Open Data — Street Trees**
  `https://opendata.vancouver.ca/explore/dataset/public-trees`
  Used to calculate canopy size, shade area, and temperature reduction estimates shown on each nomination.

- **Nominatim (OpenStreetMap)**
  `https://nominatim.openstreetmap.org`
  Converts map coordinates into a readable street address when a user drops a nomination pin.

- **City of Vancouver Urban Forestry Strategy**
  Referenced for temperature reduction and CO2 absorption methodology used in impact estimate calculations.

---

## AI Usage

| Tool | How we used it |
|------|----------------|
| **Google Gemini API** | Integrated into the backend (`/api/ai/suggest`). When a user clicks "AI Suggest" on the map, the frontend sends a request to our backend, which calls the Gemini API to generate a contextual nomination description based on the selected location and surrounding area. |
| **Claude (Anthropic)** | Used during development to assist with debugging, code generation, and writing this README. Claude did not generate any user-facing content at runtime. |

---

## Credits and Licenses

- [Leaflet](https://leafletjs.com/) — BSD 2-Clause License
- [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) — BSD 2-Clause License
- [React](https://react.dev/) — MIT License
- [Tailwind CSS](https://tailwindcss.com/) — MIT License
- [Lucide React](https://lucide.dev/) — ISC License
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — ISC License
- Map tiles provided by [OpenStreetMap](https://www.openstreetmap.org/) contributors — ODbL License
- Tree dataset provided by the [City of Vancouver Open Data Portal](https://opendata.vancouver.ca/)

---

## Contact

| Member | GitHub |
|--------|--------|
| Carlos Movilla | [@CarlosMov](https://github.com/CarlosMov) |
| Jericho Rosell | [@jerichorosell](https://github.com/jerichorosell) |
| Jameel Mohammed | [@jameeel01](https://github.com/jameeel01) |
| Cedrik Melendez | [@CedrikMelendez](https://github.com/CedrikMelendez) |
| Kevin Wu Chen | [@KevinWuChen](https://github.com/KevinWuChen) |

---

*This README was generated with the assistance of [Claude](https://claude.ai) (Anthropic).*
