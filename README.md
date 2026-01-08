# ![alt text](frontend/public/favicon.svg) Review Analyst - Autonomous Review Intelligence Pipeline

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

A powerful, AI-driven agentic workflow designed to transform unstructured user feedback from the Google Play Store into actionable product insights. This application leverages Google's Gemini models for semantic taxonomy induction, high-speed classification, and strategic reporting.

## 🚀 Key Features

- **Progressive Analysis Pipeline**: A three-stage autonomous workflow:
  1.  Ingestion: Fetches real-time reviews from the Play Store.
  2.  Classification: Uses an LLM to discover a taxonomy and classify reviews into distinct topics.
  3.  Synthesis: Generates a strategic trend analysis report and daily volume statistics.
- **Real-time Feedback**: Watch the "Process Log" as the backend agents perform their tasks in real-time.
- **Dynamic Inputs**: Analyze any app by pasting its Play Store URL and selecting a specific "Target Date" for review lookup.
- **Actionable Outputs**:
  - Strategic Report: A Markdown-formatted executive summary, identifying critical issues and feature requests.
  - CSV Exports: Download full review datasets and daily topic volume trends.
- **Modern UI**: Built with React, Vite, and TailwindCSS for a responsive and premium experience.

## 🛠️ Tech Stack

### Backend

- FastAPI: High-performance API framework.
- Google Gemini (2.5 Flash & Pro): Powering the intelligence layer.
- Pandas: Data manipulation and analytics.
- Google Play Scraper: Reliable review fetching.

### Frontend

- React + Vite: Modern frontend library and tooling.
- TailwindCSS: Utility-first CSS framework.
- Lucide React: Premium iconography.

## 📦 Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 16+
- A Google Cloud API Key (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/app-review-analyzer.git
cd app-review-analyzer
```

### 2. Backend Setup

Create a virtual environment and install dependencies:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas google-generativeai google-play-scraper python-dotenv
```

Create a `.env` file in the root directory:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Start the Backend Server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

Start the Development Server:

```bash
npm run dev
```

## 🏃‍♂️ Usage

1.  Open your browser and navigate to `http://localhost:3000`.
2.  Play Store Link: Paste the full URL of any app.
3.  Target Date: Select the specific date for analysis.
4.  Lookup Days: Choose how many days prior to analyze.
5.  Click Start Analysis.

Watch as the agents ingest data, classify reviews, and synthesize a final report!
