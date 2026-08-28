# 🥗 PlatePledge: AI-Powered Food Surplus Redistribution

[![Angular 20](https://img.shields.io/badge/Angular-20-DD0031.svg?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google GenAI SDK](https://img.shields.io/badge/Google_GenAI-Gemini-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PlatePledge** is an AI-augmented platform dedicated to eliminating urban food waste by connecting restaurants, grocers, and event organizers with local shelters, food banks, and community centers in real time.

---

## 🌟 Key Features

- 🤖 **AI Food Inspection & Categorization:** Powered by Google's Gemini SDK (`@google/genai`) for automated perishability estimation, dietary tagging (Halal, Vegan, Gluten-Free), and handling instructions.
- 📍 **Intelligent Geolocation Matching:** Calculates proximity and delivery feasibility between food donors and receiving shelters to minimize transit latency.
- 📦 **Real-Time Surplus Listing Management:** Instant publishing of available food batches with expiry timers, quantity tracking, and automated claim flows.
- 🔐 **Role-Based Workflows:** Distinct profiles and permissions for Donors (Restaurants, Caterers) and Beneficiaries (Shelters, Community Kitchens).

---

## 🏗️ Architecture & Tech Stack

```text
PlatePledge Web Client (Angular 20 + TailwindCSS)
  │
  ├── Geolocation Service ───────► Distance & Radius Filtering
  ├── Food Listing Service ──────► IndexedDB / LocalStorage State Store
  ├── Gemini AI Service ─────────► Google GenAI SDK (Multimodal Parsing)
  └── Auth & Profile Service ────► Role-Based User Management
```

- **Frontend Framework:** Angular 20 (Signals, Standalone Components)
- **Styling:** Tailwind CSS + Modern Responsive Layouts
- **AI Engine:** Google GenAI SDK (`@google/genai`)
- **Language:** TypeScript 5.8
- **Tooling:** Vite, npm

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tony-Stark2025/PlatePledge.git
   cd PlatePledge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:4200` (or the port specified in terminal).

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
