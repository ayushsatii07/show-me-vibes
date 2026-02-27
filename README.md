# 🎬 Random Movie & TV Show Selector

A full-stack web application that helps users eliminate decision fatigue by randomly selecting a Movie or TV Show based on customizable filters such as rating, industry, and 18+ content.

Built using React (Vite) + Node.js (Express) with integration to **The Movie Database (TMDB)**.

---

## 🚀 Features

### 🔍 Custom Filters

* ⭐ Minimum IMDb rating (6–10)
* 🌍 Industry selection:

  * Bollywood
  * Hollywood
* 🎬 Content type:

  * Movie
  * TV Show
* 🔞 18+ content toggle

### 🎲 Smart Random Selection

* Fetches multiple results from TMDB
* Applies filters
* Randomly selects one result
* Avoids very low vote-count entries

### 📋 Detailed Movie Information

* Title
* IMDb Rating
* Runtime
* Genres
* Director
* Top 5 Actors
* Overview
* Release Year
* Poster Image
* 18+ Badge (if applicable)

---

## 🏗 Architecture Overview

This project follows a **clean service-layer architecture** designed to allow future database integration without refactoring routes.

### Backend Structure

```
backend/
│
├── routes/
├── controllers/
├── services/
│   ├── tmdb.service.js
│   └── movie.service.js
├── middleware/
├── app.js
└── .env
```

### Frontend Structure

```
frontend/
│
├── src/
│   ├── components/
│   │   ├── FilterPanel.jsx
│   │   └── ResultCard.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
```

---

## 🧠 Technical Design

### Backend

* Node.js
* Express.js
* Axios
* dotenv
* Service layer abstraction
* Error handling middleware
* TMDB integration

### Frontend

* React (Vite)
* Functional components
* React Hooks
* Axios
* Dark cinematic theme
* Responsive layout

---

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

Response:

```
{ "status": "ok" }
```

---

### Generate Random Content

```
POST /api/generate
```

Request Body:

```json
{
  "type": "movie",
  "industry": "hollywood",
  "minRating": 7,
  "includeAdult": false
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Example Title",
    "type": "movie",
    "rating": 8.4,
    "runtime": 142,
    "genres": ["Drama", "Thriller"],
    "director": "Director Name",
    "actors": ["Actor 1", "Actor 2"],
    "overview": "Summary...",
    "poster_url": "image_url",
    "release_year": "2022",
    "isAdult": false
  }
}
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/yourusername/random-movie-selector.git
cd random-movie-selector
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=5000
```

Start server:

```
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔮 Future Improvements (Planned)

This MVP is designed to support future enhancements:

* 🗄 Database integration (PostgreSQL / MongoDB)
* 🎥 Actor & Director caching
* 📊 Watch history tracking
* ❤️ Watchlist feature
* 🤖 Recommendation engine
* 🔍 Avoid repeat suggestions
* 🌐 Streaming platform filtering
* 👥 Multi-user support

---

## 🧱 Why No Database (Yet)?

This version intentionally does not use a database to:

* Validate API logic first
* Keep MVP simple
* Ensure clean architecture
* Allow scalable integration later

The `movie.service.js` layer is designed to allow seamless database addition without modifying routes.

---

## 🎯 Project Goals

* Solve decision fatigue
* Practice API integration
* Implement clean backend architecture
* Build scalable full-stack system
* Prepare for recommendation system expansion

---

## 🛡 Content Filtering

* Uses TMDB adult flag for 18+ filtering
* Excludes low vote-count entries
* Applies language and country filters for industry separation

---

## 📌 Tech Stack Summary

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | React (Vite)              |
| Backend     | Node.js + Express         |
| API         | TMDB                      |
| HTTP Client | Axios                     |
| Styling     | CSS / Tailwind (optional) |

---

## 👨‍💻 Author

Your Name
Full Stack Developer
Movie Enthusiast 🎬

---

Just tell me which version you want next.
