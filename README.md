# Predictnest – Intelligent Room Finding Platform

A full-stack web application that helps individuals search for and secure suitable living spaces based on personal requirements such as location, budget, lifestyle preferences, and amenities.

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React.js (Vite), Tailwind CSS, React Router |
| Backend    | Node.js, Express.js                         |
| Database   | MongoDB, Mongoose ODM                       |
| Auth       | JWT, bcrypt                                 |

## Features

- **Smart Recommendations** — Scoring algorithm matches rooms to user preferences
- **Advanced Search & Filters** — By location, budget, amenities, room type, furnishing
- **User Dashboard** — Save rooms, book visits, track bookings, update profile
- **Admin Panel** — Manage rooms, users, landlords, bookings
- **Review System** — Users can rate and review rooms
- **Visit Scheduling** — Book room visits with date selection
- **Verified Landlords** — Admin-verified landlord badges
- **Responsive Design** — Modern Airbnb-style UI with Tailwind CSS
- **Security** — JWT auth, password hashing, input validation, rate limiting, CORS

## Project Structure

```
predictnest/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & validation middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seed.js          # Sample data seeder
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context provider
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   ├── App.jsx      # Root component & routing
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | /api/register      | Register user     |
| POST   | /api/login         | Login user        |

### Rooms
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/rooms                  | Get all rooms (paginated) |
| GET    | /api/rooms/:id              | Get room by ID          |
| POST   | /api/rooms                  | Create room (admin)     |
| PUT    | /api/rooms/:id              | Update room (admin)     |
| DELETE | /api/rooms/:id              | Delete room (admin)     |
| GET    | /api/rooms/search           | Search with filters     |
| GET    | /api/rooms/recommendations  | Smart recommendations   |
| POST   | /api/rooms/:id/reviews      | Add review              |

### Users
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/users/profile    | Get user profile   |
| PUT    | /api/users/update     | Update profile     |
| POST   | /api/users/save-room  | Toggle save room   |

### Bookings
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | /api/book-room    | Book a room visit   |
| GET    | /api/bookings     | Get user bookings   |
| DELETE | /api/bookings/:id | Cancel booking      |

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
cd predictnest
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Edit `.env` with your MongoDB URI and JWT secret:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/predictnest
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

### 4. Test Accounts (after seeding)

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@predictnest.com    | admin123    |
| User  | rahul@example.com        | password123 |
| User  | priya@example.com        | password123 |

## Smart Recommendation Scoring

The recommendation engine scores rooms based on:
- **+2** for location match
- **+2** for budget match (room price ≤ user budget)
- **+1** for each matching amenity

Results are sorted by score (descending), then by average rating.

## Deployment

| Component | Platform Options        |
|-----------|-------------------------|
| Frontend  | Vercel, Netlify         |
| Backend   | Render, Railway, AWS    |
| Database  | MongoDB Atlas           |

## License

MIT
