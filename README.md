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

## Documentation Guidelines

This project uses [JSDoc](https://jsdoc.app/) for inline documentation of JavaScript functions and components.

### How to Document

Please follow the structure below when documenting your functions:

```js
/**
 * Short summary of the function's purpose.
 *
 * @function
 * @async // if applicable
 * @param {Type} paramName - Description of the parameter.
 * @returns {Type} - Description of the return value.
 */
function exampleFunction(param) {
  // code here
}
```

## Developer Setup Instructions

### 📦 Project Structure

- `app/App.js` — entry point
- `components/` — reusable UI parts, screen components
- `assets/` — static files (images, icons)
- `docs/` — documentation and DevOps config

### 1. Requirements

   * Node.js (LTS)
   * npm or yarn
   * Git
   * Expo CLI: npm install -g expo-cli
   * Android Studio or Xcode (optional, for emulator or physical device testing)
   * A physical device or emulator (Android/iOS)

### 2. Getting Started
```bash
git clone https://github.com/dainntyy/camera-app_mainVersion.git
cd camera-app
npm install
```

### 3. Running in Development
```bash
npx expo start
```
### 4. Run on Your device
   * Scan QR code with Expo Go (Android/iOS)
   * Or press **a** to run Android emulator, **i** for iOS emulator
### 5. Publishing to Expo (manual)
   ```bash
   eas login
   eas update --branch main --message "Initial publish"
   ```
### 6. Basic Comands
   ```bash
   npm run lint # run linter
   npm run doc # generate documentation from JSDoc
   expo start # run Metro bundler
   ```
## 🐞 Bug Reporting & Technical Diagnostics
This application includes a built-in bug reporting mechanism that allows users to submit feedback with technical context, enabling developers to resolve issues more efficiently.

### Features
* Bug Report Form available in the app
* Fields:
   * System Info (device, OS version, app version)
   * Steps to Reproduce
   * Optional Screenshots

* Log file (logs.txt) is automatically attached
* Email-based submission using Expo's MailComposer
*  Ability to clear attached screenshots before sending

## How It Works
1. User taps "Report a Bug" button in the app.
2. They fill in:
   * Description of the issue
   * Steps to reproduce
   * Device/system details
3. User optionally attaches one or more screenshots from their device.
4. The app collects:
   * Current log file contents
   * Screenshot URIs
   * Diagnostic context
5. A pre-filled email is generated and sent to the developer.

## Limitations
Sending email requires the user to have **a configured mail client** (e.g. Gmail, Outlook) on their device.