# AeroDash

A mobile app that connects travelers with extra luggage space to people who need to send packages. Built with React Native (Expo), Next.js, and Prisma.

## Features

- **Dual User Types**: 
  - Travelers can list available luggage space
  - Senders can list packages they need to send
- **Smart Matching**: Automatically pairs travelers and senders based on origin, destination, and weight capacity
- **SMS Notifications**: Sends text messages when matches are found
- **Clean UI**: Modern, intuitive interface built with React Native
- **Authentication**: Basic login/signup system

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **SMS**: Twilio (optional, can work without it)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For SMS: Twilio account (optional)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: SQLite database path (default: `file:./dev.db`)
- `JWT_SECRET`: Secret key for JWT tokens
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID (optional)
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token (optional)
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number (optional)

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `src/config.ts`:
   - For local development, use your computer's IP address (e.g., `http://192.168.1.100:3000`)
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Make sure your phone and computer are on the same network

4. Start the Expo development server:
```bash
npm start
```

5. Open the app:
   - Install Expo Go on your phone from App Store or Google Play
   - Scan the QR code shown in the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
startupappv2/
├── backend/
│   ├── pages/api/          # API routes
│   ├── lib/                # Utilities (auth, prisma, SMS)
│   ├── prisma/             # Database schema
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── context/        # React context
│   │   └── config.ts       # Configuration
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Travelers
- `POST /api/travelers/create` - Create traveler listing

### Senders
- `POST /api/senders/create` - Create sender listing

### Matches
- `GET /api/matches` - Get user's matches
- `PATCH /api/matches/[id]/update` - Update match status

### Search
- `GET /api/search/listings` - Search listings

## Usage

1. **Register/Login**: Create an account or login
2. **As a Traveler**: 
   - Go to "I'm Traveling" tab
   - Enter your origin, destination, available weight, and travel date
   - Submit to create a listing
3. **As a Sender**:
   - Go to "Send Package" tab
   - Enter origin, destination, package weight, and optional description
   - Submit to create a listing
4. **View Matches**:
   - Go to "Matches" tab to see all your matches
   - Accept or reject pending matches
   - Mark completed matches

## Notes

- SMS notifications require Twilio setup. Without it, the app will still work but won't send SMS.
- The matching algorithm automatically pairs users when new listings are created.
- Make sure your mobile device and backend server are on the same network for local development.

## License

MIT

