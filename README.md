# 📱 Smart Receipt & Warranty Tracker

A mobile-first receipt management app with AI-powered OCR and chat assistance. Built with a "Cred" dark glassmorphism aesthetic.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **📸 Smart Receipt Scanning** - Upload receipts and let Gemini AI extract all details automatically
- **🔔 Warranty Tracking** - Get alerts before warranties expire
- **💬 AI Chat Assistant** - Ask questions about your purchases and receipts
- **🌙 Dark Glassmorphism UI** - Beautiful "Cred" inspired design
- **📊 Dashboard** - Overview of all receipts, spending, and expiring warranties

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB |
| AI/OCR | Google Gemini 1.5 Flash |
| Deployment | Render |

## 📁 Project Structure

```
Receipt-Manager/
├── backend/                 # Express.js API server
│   ├── config/             # DB & Gemini configuration
│   ├── controllers/        # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Gemini AI service
│   └── index.js            # Server entry point
│
└── frontend/               # React + Vite app
    ├── src/
    │   ├── api/            # Axios API client
    │   ├── components/     # React components
    │   ├── hooks/          # Custom hooks
    │   └── App.jsx
    └── public/
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas or local)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Receipt-Manager
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   ```
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the App

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/receipts/process-receipt` | Upload & process receipt image |
| `GET` | `/api/receipts` | Get all receipts |
| `GET` | `/api/receipts/:id` | Get single receipt |
| `DELETE` | `/api/receipts/:id` | Delete a receipt |
| `POST` | `/api/chat` | Chat with AI assistant |

## 🎨 UI Design

The app features a dark glassmorphism aesthetic inspired by Cred:

- **Background**: `#050505` (near black)
- **Glass Cards**: `backdrop-blur-xl bg-white/5 border border-white/10`
- **Accent Colors**: Purple/Blue gradients
- **Font**: Manrope / Inter

## 🚢 Deployment

### Backend (Render)

The `render.yaml` is pre-configured. Connect your GitHub repo to Render and it will auto-deploy.

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to your Render backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

## 📄 License

MIT License - feel free to use this project for learning or building your own receipt tracker!

---

**Built with ❤️ using MERN + Gemini AI**
# ReceptManager
