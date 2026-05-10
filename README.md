# EchoRoom

EchoRoom is a real-time chat application with advanced branching and memory features. It enables users to have fluid conversations, create isolated discussion branches from any message, drop time capsules that reveal at a future date, and dynamically generates memory chips to capture the context of long-running conversations.

## Features

- **Real-Time Messaging**: Built on Socket.io for instantaneous message delivery.
- **Discussion Branches**: Keep main chats uncluttered by spinning off replies into their own dedicated thread/branch.
- **Time Capsules**: Send messages that are securely locked until a specified future date and time.
- **Dynamic Presence & Aura**: See who is online with customizable, glowing status auras (Relaxed, Focused, Busy, Deep Work).
- **AI Memory Chips**: Automatically generated context summaries for rooms using Google's Generative AI.
- **Custom Avatars**: Upload profile pictures via Cloudinary, falling back gracefully to initials.

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS (v4) for styling
- Socket.io-client for real-time connection
- React Router DOM for navigation
- Axios for API requests
- Lucide React for modern iconography

### Backend
- Node.js + Express
- MongoDB + Mongoose for data persistence
- Socket.io for WebSockets
- Cloudinary + Multer for image processing and storage
- Google Generative AI for memory chip generation
- JSON Web Tokens (JWT) for secure authentication
- Bcrypt for password hashing

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following keys:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Running Locally

1. **Install dependencies**
   - Open a terminal in the `backend` folder and run `npm install`
   - Open a terminal in the `frontend` folder and run `npm install`

2. **Start the Development Servers**
   - In the `backend` folder, run `npm run dev`
   - In the `frontend` folder, run `npm run dev`

3. **Open Application**
   - Navigate to `http://localhost:5173` in your browser.

## Project Structure
- `backend/src/controllers`: Request handlers for auth, chat, branch, and memory operations.
- `backend/src/model`: Mongoose schemas (User, Chat, Room, Branch, Memory).
- `backend/src/routes`: API endpoints.
- `backend/src/app.js`: Core Express server and Socket.io event handling.
- `frontend/src/components`: React components organized by feature (chat, context, layout, navigation).
- `frontend/src/context`: React Context providers for Auth, Branch, and Active Members state management.
- `frontend/src/pages`: Main application views (Login, Register, CreateRoom).
