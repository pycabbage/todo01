# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo application with Firebase integration, built with TypeScript and using file-based routing via expo-router.

## Architecture

### Core Structure
- **File-based routing**: App routes are defined in the `/app` directory using expo-router
- **Tab navigation**: Main navigation structure is in `/app/(tabs)/`
- **Firebase services**: Integrated with multiple Firebase services (Auth, Analytics, Crashlytics, Remote Config, etc.)
- **Typed routes**: TypeScript support for routes is enabled via `experiments.typedRoutes`
- **Path aliasing**: `@/*` resolves to project root for cleaner imports

### Key Technologies
- **Framework**: React Native 0.79.5 + Expo SDK 53
- **Navigation**: expo-router v5 with file-based routing
- **Build system**: EAS Build with development, preview, and production profiles
- **State management**: React hooks and context
- **Styling**: Theme-aware components with light/dark mode support
- **Backend**: Firebase (Auth, Analytics, Crashlytics, Performance, Remote Config, App Distribution)

## Development Commands

### Core Commands
```bash
# Install dependencies (using pnpm)
pnpm install

# Start development server
pnpm start

# Run on specific platforms
pnpm android    # Start Android development
pnpm ios        # Start iOS development

# Linting and formatting (Biome)
pnpm lint                                     # Check for issues
biome check --write --no-errors-on-unmatched # Apply all fixes
biome format --write --no-errors-on-unmatched # Format only

# TypeScript type checking
pnpm tsc --noEmit

# Build APK locally for development
pnpm build:apk:development
```

### Project Utilities
```bash
# Reset project to blank state (moves current code to /app-example)
pnpm reset-project
```

## Build Configuration

### EAS Build Profiles
- **development**: Development client with internal distribution, APK for Android
- **preview**: Internal distribution for testing
- **production**: Production build with auto-increment versioning

### Platform Configuration
- **Android**: Package name `com.tododev.todo01`, compileSdkVersion 35
- **iOS**: Deployment target 15.1
- **Supported platforms**: iOS and Android only

## Code Style and Conventions

### Biome Configuration
- **Indentation**: Spaces
- **Quotes**: Double quotes
- **Trailing commas**: ES5 style
- **Semicolons**: As needed (ASI)
- **Import organization**: Automatic via Biome

### TypeScript
- **Strict mode**: Enabled
- **Path aliases**: Use `@/` for imports from project root
- **File extensions**: `.ts` for logic, `.tsx` for components

## Firebase Integration

The app includes comprehensive Firebase setup with:
- Firebase App + Auth
- Analytics and Crashlytics for monitoring
- Performance monitoring
- Remote Config for feature flags
- App Distribution for testing
- Configuration via `google-services.json`

## Git Hooks

Husky with lint-staged runs on pre-commit:
1. Biome format check and lint
2. Apply safe fixes
3. Apply unsafe fixes (if applicable)
4. Final format

## Testing

Currently no test framework is configured. Consider setting up Jest with React Native Testing Library when needed.

## Important Files

- `app.config.ts`: Expo configuration with plugins and build settings
- `eas.json`: EAS Build profiles and settings  
- `biome.json`: Linting and formatting rules
- `tsconfig.json`: TypeScript configuration
- `pnpm-workspace.yaml`: PNPM workspace config with Firebase patches

## Development Notes

- The project uses hoisted node_modules via pnpm
- Firebase app module is patched (see patches directory)
- SQLite is configured with FTS and SQLCipher support
- LINE authentication is integrated via @xmartlabs/react-native-line
- Apple authentication is available for iOS