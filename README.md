# Autonomous Review Intelligence Pipeline

A powerful, AI-driven agentic workflow designed to transform unstructured user feedback from the Google Play Store into actionable product insights. This application leverages Google's Gemini models for semantic taxonomy induction, high-speed classification, and strategic reporting.

## 🚀 Key Features

- **Progressive Analysis Pipeline**: A three-stage autonomous workflow:
  1.  **Ingestion**: Fetches real-time reviews from the Play Store.
  2.  **Classification**: Uses an LLM to discover a taxonomy and classify reviews into distinct topics.
  3.  **Synthesis**: Generates a strategic trend analysis report and daily volume statistics.
- **Real-time Feedback**: watch the "Process Log" as the backend agents perform their tasks.
- **Dynamic Inputs**: Analyze _any_ app by pasting its Play Store URL and selecting a specific "Target Date" for review lookup.
- **Actionable Outputs**:
  - **Strategic Report**: A Markdown-formatted executive summary, identifying critical issues and feature requests.
  - **CSV Exports**: Download full review datasets and daily topic volume trends.
- **Modern UI**: Built with React, Vite, and TailwindCSS for a responsive and clean experience.

## 🛠️ Tech Stack

### Backend

- **FastAPI**: High-performance API framework.
- **Google Gemini (2.5 Flash & Pro)**: Powering the intelligence layer (Taxonomy & Reporting).
- **Pandas**: Efficient data manipulation and stats calculation.
- **Google Play Scraper**: Reliable review fetching.

### Frontend

- **React + Vite**: Fast, modern frontend tooling.
- **TailwindCSS**: Utility-first styling.
- **Lucide React**: Beautiful icons.

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

1.  Open your browser and go to `http://localhost:3000`.
2.  **Play Store Link**: Paste the full URL of the app you want to analyze (e.g., `https://play.google.com/store/apps/details?id=com.whatsapp`).
3.  **Target Date**: Select the date you want to focus your analysis on.
4.  **Lookup Days**: Choose how many days _prior_ to the target date to fetch reviews from.
5.  Click **Start Analysis**.

Watch as the agents ingest data, classify reviews, and synthesize a final report!

## 📄 License

MIT License.
