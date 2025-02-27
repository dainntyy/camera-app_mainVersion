# Camera App
## Overview
This is a cross-platform mobile application for taking and managing photos, built using **Expo, React Native, and expo-camera**. The app allows users to take pictures, apply overlays for alignment, and save images to their gallery. It includes accessibility features to ensure usability for all users.
## Features
- Capture photos using the device camera
- Toggle between front and back camera
- Overlay reference images for alignment
- Save photos to the device gallery
- Accessibility improvements based on WCAG guidelines
## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js (>=16.x)
- Expo CLI (npm install -g expo-cli)
- Android Emulator / iOS Simulator (or a physical device)
### Steps
1. Clone the reprository:
   ```bash
   git clone https://github.com/dainntyy/camera-app_mainVersion.git
   cd camera-app_mainVersion
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Scan the QR code with the Expo Go app or run on an emulator:
   ```bash
   npm run android # for Android
   npm run ios # for IOS (Mac only)
   ```
## Usage
- Tap the capture button to take a photo.
- Toggle between front and back cameras.
- Use the overlay feature to align your shot.
- Access saved images in the device gallery.