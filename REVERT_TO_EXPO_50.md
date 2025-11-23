# Reverted to Expo SDK 50

The project has been reverted to Expo SDK 50 with all compatible package versions.

## Changes Made

- **Expo**: `~50.0.0` (from ~54.0.0)
- **React Native**: `0.73.2` (from 0.81.5)
- **React**: `18.2.0` (from 19.1.0)
- All Expo packages reverted to SDK 50 compatible versions
- All React Native packages reverted to versions compatible with RN 0.73.2

## Installation Steps

1. **Navigate to mobile directory**:
   ```bash
   cd "/Users/thoughtworks/Downloads/Startup in a weekend/Codebase/startupappv2/mobile"
   ```

2. **Clean everything**:
   ```bash
   rm -rf node_modules
   rm -rf .expo
   rm package-lock.json
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Fix Expo packages** (ensures exact compatible versions):
   ```bash
   npx expo install --fixn
   ```

5. **Clear cache and start**:
   ```bash
   npx expo start --clear
   ```

## Package Versions (Expo SDK 50)

- expo: ~50.0.0
- react-native: 0.73.2
- react: 18.2.0
- expo-constants: ~15.4.5
- expo-image-picker: ~14.7.1
- expo-linear-gradient: ~12.7.2
- expo-status-bar: ~1.11.1
- react-native-safe-area-context: 4.8.2
- react-native-screens: ~3.29.0
- @react-native-community/datetimepicker: ^7.6.2
- @react-native-async-storage/async-storage: 1.21.0

The app should now work with Expo SDK 50 and Expo Go.

