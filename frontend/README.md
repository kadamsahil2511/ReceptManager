# 🧾 Smart Receipt & Warranty Tracker

A mobile-first receipt management app with AI-powered OCR, warranty tracking, and an intelligent chat assistant.

## ✨ Features

- **📸 AI Receipt Scanning** - Upload or photograph receipts, Gemini Vision extracts all data automatically
- **⚡ Warranty Tracking** - Get alerts before warranties expire
- **🔄 Recurring Bill Detection** - Automatically identifies subscriptions and recurring payments
- **💬 AI Chat Assistant** - Ask questions about your spending, find receipts, get support info
- **🎨 Cred-style Dark UI** - Beautiful glassmorphism design, fully mobile responsive

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS (Glassmorphism styling)
- Framer Motion (Animations)
- Lucide React (Icons)
- Axios + React Hot Toast

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Google Gemini 1.5 Flash (Vision + Chat)
- Multer (File uploads)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud account with Gemini API access

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### 2. Configure Environment

**Frontend** (`.env` in root):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/receipts
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
SERPER_API_KEY=optional_for_google_search
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

## 📱 API Endpoints

### Receipts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/process-receipt` | Upload & analyze receipt image |
| GET | `/api/receipts` | Get all receipts (paginated) |
| GET | `/api/receipts/:id` | Get single receipt |
| PUT | `/api/receipts/:id` | Update receipt |
| DELETE | `/api/receipts/:id` | Delete receipt |
| GET | `/api/receipts/dashboard` | Get dashboard stats |
| GET | `/api/receipts/expiring-warranties` | Get warranties expiring soon |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to AI assistant |
| POST | `/api/chat/quick-action` | Trigger predefined actions |

## 🎨 UI Components

- **Dashboard** - Stats overview with spending trends
- **UploadReceipt** - Drag & drop or camera capture
- **ReceiptList** - Filterable, sortable receipt cards
- **ReceiptDetail** - Full receipt view modal
- **ChatAssistant** - Floating AI chat with quick actions

## 🚢 Deployment

### Backend (Render)
1. Create Web Service on Render
2. Connect your GitHub repo
3. Set environment variables in Render dashboard
4. Deploy from `server/` directory

### Frontend (Vercel/Netlify)
1. Update `VITE_API_URL` to your Render backend URL
2. Deploy from root directory
3. Build command: `npm run build`
4. Output directory: `dist`

## 📁 Project Structure

```
├── src/
│   ├── api/           # API client
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── App.jsx        # Main app
│   └── index.css      # Tailwind + custom styles
├── server/
│   ├── config/        # DB & Gemini config
│   ├── controllers/   # Route handlers
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routes
│   ├── services/      # Gemini AI service
│   └── index.js       # Server entry
└── package.json
```

## 🔑 Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Enable Gemini 1.5 Flash model

### MongoDB Atlas
1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create database user
3. Get connection string

### Serper API (Optional)
1. Sign up at [Serper.dev](https://serper.dev/)
2. Get API key for Google Search functionality

## 📝 License

MIT
