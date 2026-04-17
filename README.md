# 🌍 PHDMusafir

*A premium journey atlas and travel storytelling platform.*

![PHDMusafir](https://img.shields.io/badge/Status-Active-success)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwindcss)

## 📖 Overview

**PHDMusafir** is a cinematic, full-stack web application designed for travel storytelling and journal management. It features a spectacular interactive India Atlas that dynamically plots user journeys, a hierarchical Journal system for curated articles, and a seamless story discovery experience.

## ✨ Features

- **Interactive Journey Atlas:** A dynamic, responsive map of India using `react-simple-maps` that visualizes unique locations from user stories and journals with elegant markers and tooltips.
- **Hierarchical Journal System:** A curated 3-level navigation experience for travel guides and narratives, exclusively managed via an Admin Dashboard.
- **Immersive User Interface:** A premium, cinematic aesthetic built with Tailwind CSS V4 and Framer Motion for smooth page transitions, backdrop-blur effects, and micro-interactions.
- **Story Sharing:** Users can upload their own travel notes and experiences, complete with image uploads processed directly via Cloudinary.
- **User Profiles & Authentication:** Secure JWT-based authentication, user profiles with customizable bios, and personalized "My Stories" feeds.

## 🛠️ Technology Stack

**Frontend:**
- React 19 (Vite)
- Tailwind CSS 
- Framer Motion (Animations)
- React Simple Maps & TopoJSON (Interactive Cartography)
- Axios & React Router DOM

**Backend:**
- Node.js & Express.js
- MongoDB (Mongoose ORM)
- Cloudinary & Multer (Image storage)
- JWT & bcryptjs (Authentication & Security)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- MongoDB Atlas Account (or local MongoDB)
- [Cloudinary](https://cloudinary.com/) Account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShipWithKartik/PHDMusafir.git
   cd PHDMusafir
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```
   *(Optional)* If you have frontend-specific env vars (like your API base URL), create a `.env` inside `client`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Running the App Locally:**
   You will need to run the client and server concurrently. Open two terminals:

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```

## 🏗️ Project Structure

```text
PHDMusafir/
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, Footers, Modals)
│   │   ├── pages/      # Route pages (Home, Discover, Journal, Profile)
│   │   └── App.jsx
│   └── package.json
├── server/           # Node/Express backend
│   ├── controllers/  # Route logic handlers (Auth, Story, Journal)
│   ├── middlewares/  # Authentication & Admin gating logic
│   ├── models/       # Mongoose schemas (User, Story, Journal)
│   ├── routes/       # API endpoints
│   ├── scripts/      # Utility scripts (e.g., seedAdmin.js)
│   ├── server.js     # Entry point
│   └── package.json
└── README.md
```

## 🔐 Admin Access

To manage the Journal system (creating and editing curated journal posts), you must use an Admin account. An initial admin account can be seeded into your database using the provided script:

```bash
cd server
node scripts/seedAdmin.js
```
*Default Seeded Credentials:*
- **Username:** `journal_admin`
- **Password:** `JournalAdmin@2025`

## 🎨 Design Philosophy

The application prioritizes a **seamless, cinematic discovery experience**. This is achieved through:
- **Typography:** Careful serif & sans-serif font pairing across headings and body text.
- **Color Palette:** A cohesive off-white / dark dual-tone palette ensuring high contrast and minimal strain.
- **Feedback & Motion:** Using Framer Motion for tactile hovers, subtle scaling animations, and elegant page-loading transitions.
- **Transparency:** Extensive use of `backdrop-blur` for overlays and navigation elements against rich background photography.

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/ShipWithKartik/PHDMusafir/issues).

---

*Crafted by [ShipWithKartik](https://github.com/ShipWithKartik)*
