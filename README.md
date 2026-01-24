# OceanPulse AI 🌊

**OceanPulse AI** is an interactive 3D dashboard for tracking global ocean currents in real-time. It combines advanced data visualization using D3.js with the generative power of Google's Gemini API to provide scientific insights into marine environments.

![OceanPulse Demo](./screenshot.png)

## 🚀 Features

- **Interactive 3D Globe**: Built with D3.js, featuring manual rotation, zoom, and auto-focus capabilities.
- **Dynamic Flow Simulation**: Visualizes current velocity and direction with animated particle flows and vector arrows.
- **AI-Powered Analysis**: Integrates **Google Gemini 2.5/3** to generate real-time reports on climate impact, marine ecosystems, and navigation advice based on simulation data.
- **Real-time Telemetry**: Simulates changing variables like water temperature, salinity, and flow speed (Knots).
- **Responsive Design**: Fully optimized for desktop and mobile devices using Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Visualization**: D3.js, TopoJSON
- **Charts**: Recharts
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Styling**: Tailwind CSS

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/OceanPulse-AI.git
   cd OceanPulse-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Google Gemini API Key:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📝 License

MIT

---
*Powered by Google Gemini API*