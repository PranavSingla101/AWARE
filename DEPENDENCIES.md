# Project Dependencies

This document lists all dependencies required to run the AWARE Waterborne Disease Predictor project.

## Quick Install

### Windows
```bash
install.bat
```

### Linux/Mac
```bash
chmod +x install.sh
./install.sh
```

### Manual Install
```bash
npm install
```

## Production Dependencies

These dependencies are required for the application to run:

| Package | Version | Purpose |
|---------|---------|---------|
| `@clerk/clerk-react` | ^5.55.0 | Authentication and user management with Google OAuth |
| `react` | ^19.2.0 | React UI library |
| `react-dom` | ^19.2.0 | React DOM renderer |
| `react-router-dom` | ^7.9.6 | Client-side routing and navigation |

## Development Dependencies

These dependencies are only needed during development:

| Package | Version | Purpose |
|---------|---------|---------|
| `@eslint/js` | ^9.39.1 | ESLint JavaScript configuration |
| `@types/react` | ^19.2.2 | TypeScript definitions for React |
| `@types/react-dom` | ^19.2.2 | TypeScript definitions for React DOM |
| `@vitejs/plugin-react` | ^5.1.0 | Vite plugin for React support |
| `eslint` | ^9.39.1 | JavaScript linter |
| `eslint-plugin-react-hooks` | ^7.0.1 | ESLint rules for React hooks |
| `eslint-plugin-react-refresh` | ^0.4.24 | ESLint rules for React Fast Refresh |
| `globals` | ^16.5.0 | Global variables for ESLint |
| `vite` | ^7.2.2 | Build tool and development server |

## System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Operating System**: Windows, macOS, or Linux

## Installation Verification

After installation, verify that all dependencies are installed correctly:

```bash
npm list --depth=0
```

You should see all packages listed without any errors.

## Troubleshooting

### Installation fails
- Ensure you have Node.js v18+ installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Version conflicts
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` to regenerate with latest compatible versions

### Permission errors (Linux/Mac)
- Use `sudo npm install` (not recommended)
- Better: Fix npm permissions or use a node version manager (nvm)

## Additional Setup

After installing dependencies, you also need:

1. **Environment Variables**: Create a `.env` file with:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_key_here
   ```

2. **Clerk Account**: Set up authentication at [clerk.com](https://clerk.com)

## Package Lock File

The `package-lock.json` file ensures consistent dependency versions across installations. It's automatically generated and should be committed to version control.

