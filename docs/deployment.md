# Production Deployment Guide

## Hardware Requirements Tips
- Architecture: x86_64 or ARM64
- CPU: 2+ cores
- RAM: 4 GB minimum
- Disk: 10 GB free

## Software Requirements

- Node.js v18+
- Git
- Expo CLI
- Access to Google Play Console / Apple Developer account

## Network Setup

- Ensure outbound HTTPS access for publishing builds.
- Allow Expo CLI to upload builds.

## Server Configuration

This project does not require a backend server.

## Deployment Instructions
1. Push to **main** branch
2. CI/CD workflows tuns eas update to deploy OTA update
3. App available at: https://expo.dev/accounts/dainntyy/projects/camera-app

## Publishing to Stores

1. **Set credentials:**
   ```bash
   eas credentials
   ```

2. **Build Android/iOS:**
   ```bash
   eas build -p android --profile production
   eas build -p ios --profile production
   ```

3. **Submit to stores:**
   ```bash
   eas submit -p android
   eas submit -p ios
   ```

4. **Verify:**
   - Check console logs
   - Install from Play Store/TestFlight
