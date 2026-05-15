# Shaded

**Shade Vancouver, Together.**

Shaded is a community-driven web app that lets Vancouver residents nominate locations for new trees. Users drop a pin on a map, describe why the spot needs shade, and the community upvotes the most important locations — helping the City of Vancouver prioritize where to plant next.

---

## Live Deployment

| | URL |
|--|-----|
| Frontend | https://2800-202610-dtc-07.vercel.app |
| Backend | https://two800-202610-dtc07.onrender.com |

---

## Team

**DTC-07**

| Name |
|------|
| Carlos Movilla |
| Jericho Rosell |
| Jameel Mohammed |
| Cedrik Melendez |
| Kevin Wu Chen |

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
FRONTEND_URL=https://2800-202610-dtc-07.vercel.app
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
  Used to calculate average tree canopy size for the Impact Estimate page.

- **Nominatim (OpenStreetMap)**
  `https://nominatim.openstreetmap.org`
  Used to convert map coordinates into a readable street address when a user drops a nomination pin.

- **City of Vancouver Urban Forestry Strategy**
  Referenced for temperature reduction and CO2 absorption estimates shown on the Impact Estimate page.

---

*This README was generated with the assistance of [Claude](https://claude.ai) (Anthropic).*
