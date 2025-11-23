# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo Go app on your phone (for testing)

## Step 1: Install Dependencies

From the root directory:
```bash
npm run install-all
```

Or manually:
```bash
cd backend && npm install
cd ../mobile && npm install
```

## Step 2: Set Up Backend

1. Navigate to backend:
```bash
cd backend
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and set:
   - `DATABASE_URL="file:./dev.db"` (default is fine)
   - `JWT_SECRET="your-random-secret-key-here"`
   - (Optional) Twilio credentials for SMS

4. Initialize database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

## Step 3: Set Up Mobile App

1. Find your computer's IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
   - Look for your local network IP (e.g., 192.168.1.100)

2. Navigate to mobile:
```bash
cd mobile
```

3. Update `src/config.ts`:
   - Change `API_BASE_URL` to `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

4. Start Expo:
```bash
npm start
```

5. Open on your phone:
   - Install Expo Go from App Store/Google Play
   - Scan the QR code shown in terminal
   - Make sure phone and computer are on same WiFi network

## Troubleshooting

### Can't connect to backend
- Make sure backend is running on port 3000
- Check firewall settings
- Verify IP address in `mobile/src/config.ts`
- Ensure phone and computer are on same network

### Database errors
- Run `npx prisma migrate reset` to reset database
- Then run `npx prisma migrate dev` again

### SMS not working
- SMS is optional - app works without it
- To enable: add Twilio credentials to `.env`
- Without Twilio, matches still work but no SMS notifications

