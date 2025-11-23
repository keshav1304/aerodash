# Node.js Version Update

## Issue
Expo SDK 54 requires Node.js >= 20.19.4, but you're currently running Node.js v20.15.1.

## Solution Applied
Node.js 20.19.5 has been installed via Homebrew, but it's "keg-only" and needs to be added to your PATH.

## Add Node.js 20.19.5 to PATH

Since you're using Fish shell, add this to your `~/.config/fish/config.fish` file:

```fish
set -gx PATH /opt/homebrew/opt/node@20/bin $PATH
```

Or run this command to add it for the current session:
```bash
set -gx PATH /opt/homebrew/opt/node@20/bin $PATH
```

## Verify Installation

After updating PATH, verify:
```bash
node --version  # Should show v20.19.5
which node      # Should show /opt/homebrew/opt/node@20/bin/node
```

## Alternative: Use the Full Path

You can also use the full path directly:
```bash
/opt/homebrew/opt/node@20/bin/node --version
```

## After Updating PATH

1. **Navigate to mobile directory**:
   ```bash
   cd "/Users/thoughtworks/Downloads/Startup in a weekend/Codebase/startupappv2/mobile"
   ```

2. **Clean and reinstall**:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Fix Expo packages**:
   ```bash
   npx expo install --fix
   ```

## Note
The warnings you saw are about Node.js version compatibility. Once you update your PATH to use Node.js 20.19.5, these warnings should disappear.
