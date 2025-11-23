# QR Code Feature Setup

## Installation

To use the QR code generation feature, you need to install the required dependencies:

```bash
cd mobile
npm install react-native-qrcode-svg react-native-svg text-encoding
```

Or if using Expo:

```bash
cd mobile
npx expo install react-native-qrcode-svg react-native-svg
npm install text-encoding
```

**Note:** The `text-encoding` package is required as a polyfill for TextEncoder/TextDecoder which is needed by the QR code library in React Native environments.

## How It Works

### For Package Senders (Drop-Off):
1. When a match is accepted, a "Ready to Drop Off - Generate QR Code" button appears
2. The button is only available before the drop-off deadline (3 hours before flight departure)
3. Clicking the button generates a QR code that can be scanned at the airport drop-off location
4. The QR code contains match information including match ID, type, and route details

### For Travelers (Pick-Up):
1. When a match is accepted, a "Ready to Pick Up - Generate QR Code" button appears
2. The button is only available after the drop-off deadline has passed
3. Clicking the button generates a QR code that can be scanned at the airport pick-up location
4. The QR code contains match information for verification

## QR Code Data Format

The QR code contains JSON data with the following structure:
```json
{
  "matchId": "string",
  "type": "dropoff" | "pickup",
  "timestamp": "ISO date string",
  "origin": "airport code",
  "destination": "airport code"
}
```

## Airport Scanning System

The on-ground package drop-off/pick-up system at the airport should:
1. Scan the QR code
2. Parse the JSON data
3. Verify the match ID and type
4. Check the timestamp to ensure it's valid
5. Process the drop-off or pick-up accordingly

## Troubleshooting

If you get errors about missing modules:
1. Clear the cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. For iOS: `cd ios && pod install && cd ..`
4. Restart the Metro bundler

