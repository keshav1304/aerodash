# Installation Notes

## Date Picker Installation

If you're getting an error about `@react-native-community/datetimepicker` not being found, run:

```bash
cd mobile
npx expo install @react-native-community/datetimepicker
```

**Important:** Use `expo install` instead of `npm install` for Expo projects to ensure version compatibility.

After installation, you may need to:
1. Clear the cache: `npx expo start -c`
2. Rebuild the app if using a development build

## Alternative: If Expo Install Doesn't Work

If `expo install` doesn't work, you can try:

```bash
cd mobile
npm install @react-native-community/datetimepicker
npx expo start -c
```

Or if you're using a development build:

```bash
cd mobile
npm install @react-native-community/datetimepicker
# For iOS
cd ios && pod install && cd ..
# For Android - rebuild the app
```

## Troubleshooting

If you still get module resolution errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` or `yarn install`
3. Clear Expo cache: `npx expo start -c`
4. Restart the Metro bundler

