# 🚀 Meta Lead PoC (Proof of Concept)

A real-time proof-of-concept system for capturing **Meta (Facebook & Instagram) Lead Ads** and streaming them instantly to a cross-platform mobile application using **Webhooks**, **Meta Graph API**, and **WebSockets**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Public Tunnel Setup (for Meta Webhook)](#2-public-tunnel-setup-for-meta-webhook)
  - [3. Meta Developer App Configuration](#3-meta-developer-app-configuration)
  - [4. Mobile App Setup](#4-mobile-app-setup)
- [Testing the Integration](#-testing-the-integration)
  - [Using Meta Lead Ads Testing Tool](#using-meta-lead-ads-testing-tool)
  - [Using cURL / Postman Mock Requests](#using-curl--postman-mock-requests)
- [API & WebSocket Reference](#-api--websocket-reference)
- [Environment Variables](#-environment-variables)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)


---

## 📖 Overview

When running Lead Generation campaigns on Meta (Facebook & Instagram), advertisers typically have to manually download CSV files from Meta Ads Manager or rely on delayed third-party polling.

This project demonstrates an **end-to-end, real-time pipeline**:
1. A prospect submits an instant form on Facebook or Instagram.
2. Meta triggers an immediate **Webhook event** to your backend server.
3. The server extracts the `leadgen_id` and queries the **Meta Graph API** (`v26.0`) to fetch customer details (Name, Email, Phone Number).
4. The server broadcasts the parsed lead over a **WebSocket** channel.
5. Connected **React Native / Expo** mobile devices receive and render the new lead in real-time with zero manual refresh.

---

## 📐 Architecture & Data Flow

```text
┌───────────────────────┐
│  User Submits Lead    │
│ (Facebook/Instagram)  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐       HTTPS POST /webhook        ┌─────────────────────────┐
│     Meta Platform     │ ───────────────────────────────> │      Node.js Server     │
│   (Lead Ads System)   │ <─────────────────────────────── │     (Express + ws)      │
└───────────────────────┘    GET Graph API v26.0/lead_id   └───────────┬─────────────┘
                                                                       │
                                                            WebSocket  │  Broadcast
                                                            (ws://...) │  Event
                                                                       ▼
                                                           ┌─────────────────────────┐
                                                           │   Expo Mobile Client    │
                                                           │ (iOS / Android / Web)   │
                                                           │   Real-Time UI Update   │
                                                           └─────────────────────────┘
```

---

## ✨ Features

- **⚡ Real-Time Lead Ingestion**: Instant notification handling via Meta Page Webhooks.
- **🔐 Secure Webhook Verification**: Implements the official Meta Webhook challenge-response handshake (`hub.challenge`).
- **🔍 Automated Graph API Resolution**: Automatically resolves incoming `leadgen_id` values to human-readable form fields (`FULL_NAME`, `EMAIL`, `PHONE_NUMBER`).
- **📡 WebSocket Live Streaming**: Broadcasts newly arrived leads to all active mobile clients simultaneously, as well as sending existing lead history on connection.
- **📱 Cross-Platform Mobile Client**: Built with **Expo SDK 57** and **React Native**, supporting iOS, Android, and Web with responsive layout and theme switching.
- **🧪 Testing-Ready**: Seamlessly works with the official **Meta Lead Ads Testing Tool** without spending ad budget.

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: [React Native](https://reactnative.dev/) (v0.86) with [Expo](https://expo.dev/) (SDK 57)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Animations**: `react-native-reanimated`, `@expo/ui`, `expo-symbols`, `react-native-safe-area-context`
- **Real-Time Client**: Native WebSocket API

### Backend (Webhook & Streaming Server)
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **HTTP Server**: [Express.js](https://expressjs.com/) (v5)
- **WebSocket Server**: [ws](https://github.com/websockets/ws)
- **Utilities**: `dotenv`, `cors`, `fetch` (native Node.js)

---

## 📂 Project Structure

```text
meta-lead-poc/
├── assets/                 # App assets (app icon, adaptive icons, splash screens)
├── scripts/                # Utility scripts (project reset, etc.)
├── src/
│   ├── app/                # Expo Router screen routes
│   │   ├── _layout.tsx     # Root navigation layout & theme provider
│   │   ├── index.tsx       # Live Leads screen (connects to WebSocket & renders leads)
│   │   └── explore.tsx     # Explore / documentation screen
│   ├── components/         # Modular UI components (tabs, themed text/view, animated icons)
│   ├── constants/          # Colors, theme variables, and layout metrics
│   ├── hooks/              # Custom hooks (theme management, color scheme)
│   └── server/             # Node.js backend server
│       ├── .env.example    # Template for server environment variables
│       ├── .env            # Private server environment variables (ignored by git)
│       ├── package.json    # Backend dependencies (express, ws, cors, dotenv)
│       └── server.js       # Webhook verification, Graph API query & WebSocket logic
├── app.json                # Expo configuration file
├── package.json            # Frontend dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## 📋 Prerequisites

Before getting started, ensure you have:

1. **Node.js** (v18.x or v20.x recommended) and **npm** installed.
2. A **Meta for Developers Account**: [developers.facebook.com](https://developers.facebook.com/)
3. A **Facebook Page** with an associated **Lead Ad form**.
4. An **HTTPS Tunnel Tool** to expose your local port `3000` to the internet (e.g. [ngrok](https://ngrok.com/), [Cloudflare Tunnel](https://developers.cloudflare.com/pages/how-to/tunnel/), or [localtunnel](https://localtunnel.me/)).
5. **Expo Go** app installed on your physical mobile device (available on App Store / Google Play) OR an active iOS Simulator / Android Emulator.

---

## 🚀 Quick Start Guide

### 1. Backend Setup

1. Open a terminal and navigate to the server folder:
   ```bash
   cd src/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On macOS/Linux:
   cp .env.example .env
   ```

4. Open `src/server/.env` and fill in the values:
   ```env
   # Meta Page Access Token with 'leads_retrieval' and 'pages_show_list' permissions
   META_PAGE_ACCESS_TOKEN=EAAG...your_token_here

   # Any arbitrary secure string chosen by you to verify webhook authenticity
   ACCESS_TOKEN=your_secure_verify_token_string
   ```

5. Start the backend server:
   ```bash
   npm start
   # Server will start on http://localhost:3000 (HTTP and WebSocket)
   ```

---

### 2. Public Tunnel Setup (for Meta Webhook)

Meta requires webhooks to be delivered to a secure public URL (**HTTPS**). While running the server locally, open another terminal and expose port `3000`:

```bash
# Using ngrok:
ngrok http 3000

# OR using localtunnel:
npx localtunnel --port 3000
```

Copy the forwarding HTTPS URL provided by your tunnel (e.g. `https://your-domain.ngrok-free.app`).

---

### 3. Meta Developer App Configuration

1. Go to the [Meta Developer Portal](https://developers.facebook.com/apps/) and create or select your App.
2. Under **Add Products to Your App**, add **Webhooks**.
3. Select **Page** from the dropdown menu and click **Subscribe to this object**.
4. Configure the Webhook:
   - **Callback URL**: `https://your-domain.ngrok-free.app/webhook`
   - **Verify Token**: The exact value set in your `src/server/.env` under `ACCESS_TOKEN`.
5. Click **Verify and Save**. Your server console should output: `WEBHOOK_VERIFIED`.
6. Under Page Webhooks, locate the `leadgen` field and click **Subscribe**.
7. Ensure your App has permissions:
   - `leads_retrieval`
   - `pages_manage_ads`
   - `pages_read_engagement`
   - `pages_show_list`

---

### 4. Mobile App Setup

1. Open a new terminal at the project root directory:
   ```bash
   cd meta-lead-poc
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Configure the WebSocket server address:
   - Open `src/app/index.tsx`.
   - Update the WebSocket connection URL around line 15 with your local machine's LAN IP address or your public tunnel address:
     ```typescript
     // For physical devices on the same Wi-Fi:
     const ws = new WebSocket('ws://<YOUR_LOCAL_IP>:3000');

     // For Android Emulator (default host loopback):
     // const ws = new WebSocket('ws://10.0.2.2:3000');

     // For iOS Simulator:
     // const ws = new WebSocket('ws://localhost:3000');

     // Or using a public secure tunnel:
     // const ws = new WebSocket('wss://your-domain.ngrok-free.app');
     ```

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Run the app:
   - **On Android**: Press `a` (or scan the QR code with the Expo Go app).
   - **On iOS**: Press `i` (or scan the QR code with the Camera app).
   - **On Web**: Press `w`.

---

## 🧪 Testing the Integration

### Using Meta Lead Ads Testing Tool

Meta provides a dedicated tool to test Lead Ad forms without paying for ads:

1. Navigate to the [Meta Lead Ads Testing Tool](https://developers.facebook.com/tools/lead-ads-testing/).
2. Select your **Facebook Page** and your **Lead Form**.
3. (Optional) Click **Preview Form** to customize the test inputs.
4. Click **Create Lead**.
5. Observe the execution flow:
   - Your backend terminal logs `POST /webhook received`, retrieves the lead from Graph API, and outputs `Lead object: { name, email, phone }`.
   - Your mobile app screen updates immediately to display the newly captured lead.
6. To test again, click **Delete Lead** in the Meta tool and then create a new one.

---

### Using cURL / Postman Mock Requests

You can test the entire pipeline locally without waiting for Meta:

#### 1. Test Webhook Verification Handshake
```bash
curl -X GET "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=your_secure_verify_token_string&hub.challenge=test_challenge_code"
```
**Expected response:** `test_challenge_code` with status `200 OK`.

#### 2. Test Fetching All Stored Leads via REST
```bash
curl http://localhost:3000/leads
```

---

## 📡 API & WebSocket Reference

### HTTP Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/webhook` | Verification endpoint required by Meta during Webhook configuration | `hub.mode`, `hub.verify_token`, `hub.challenge` |
| `POST` | `/webhook` | Event receiver triggered by Meta when a lead form is submitted | JSON payload containing `entry[0].changes[0].value.leadgen_id` |
| `GET` | `/leads` | Returns the current in-memory array of captured leads | None |

### WebSocket Protocol

- **Connection URL**: `ws://<host>:3000` (or `wss://...` if over HTTPS)
- **On Connect**: The server immediately sends the current array of leads as a JSON string:
  ```json
  [
    {
      "name": "John Doe",
      "email": "johndoe@gmail.com",
      "phone": "1234567890"
    }
  ]
  ```
- **On New Lead Event**: When a new lead is processed, the updated lead list is broadcasted to all connected clients:
  ```json
  [
    {
      "name": "Jane Smith",
      "email": "janesmith@example.com",
      "phone": "+1234567890"
    }
  ]
  ```

---

## 🔑 Environment Variables

The server requires the following configuration in `src/server/.env`:

| Variable | Required | Description | Where to find it |
|---|---|---|---|
| `META_PAGE_ACCESS_TOKEN` | **Yes** | Long-lived Facebook Page Access Token with `leads_retrieval` permission | Meta Graph API Explorer or Meta Business Manager |
| `ACCESS_TOKEN` | **Yes** | Custom verification token string shared between your server and Meta Webhook setup | Arbitrary string chosen by you |

---

## ❓ Troubleshooting & FAQs

### 1. Webhook verification returns `403 Forbidden`
- **Cause**: The `hub.verify_token` sent in the request does not match the `ACCESS_TOKEN` in `src/server/.env`.
- **Fix**: Check `src/server/.env`, restart the backend server, and ensure the Verify Token in the Meta App Dashboard matches identically.

### 2. Meta returns error `(#100) Tried accessing nonexisting field (leadgen_id)` or `(#200) Provide valid app token or user token`
- **Cause**: `META_PAGE_ACCESS_TOKEN` is missing, expired, or lacks the `leads_retrieval` permission.
- **Fix**: Generate a fresh Page Access Token with `leads_retrieval` and `pages_read_engagement` scopes using the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).

### 3. Mobile app says `WebSocket error` or does not connect
- **Cause**: The mobile device cannot reach `localhost:3000`.
- **Fix**:
  - If using a **physical device**, ensure your phone and computer are on the same Wi-Fi network and use your computer's local IP address (e.g. `ws://192.168.1.15:3000`).
  - If using an **Android Emulator**, use `ws://10.0.2.2:3000`.
  - Alternatively, use the public tunnel URL (`wss://<your-subdomain>.ngrok-free.app`).

### 4. Custom field names are missing in lead details
- **Cause**: Different Meta lead forms use different field keys (e.g., `full_name` vs `FULL_NAME` vs `first_name`).
- **Fix**: In `src/server/server.js`, inspect the logged `leadDetails.field_data` and adjust the matching logic in the `lead` object mapping if your form uses custom questions.

---
