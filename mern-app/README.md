# Research Paper AI Assistant (MERN Stack)

A full-stack application that allows users to upload research papers (PDFs) and interact with them using AI. Built with MongoDB, Express, React (Vite), and a Python AI API.

## Project Structure

```
mern-app/
├── client/         # React frontend (Vite, Axios, CSS)
├── server/         # Express.js backend (Mongoose, Multer)
└── README.md       # Project documentation
```

## Prerequisites

- **Node.js**: v18 or later
- **MongoDB**: Running locally on `mongodb://localhost:27017/research_paper_db`
- **Python AI API**: Running on `http://localhost:8000` (from the provided Jupyter Notebook)

## Getting Started

### 1. Start the Python AI API
Open and run the provided `.ipynb` notebook to start the FastAPI server at `http://localhost:8000`.

### 2. Setup & Run the MERN Stack
From the **root folder** (`mern-app/`), run:
```bash
npm install        # Install root dependencies (concurrently)
npm run dev        # Starts both client and server automatically
```

The app will be available at `http://localhost:3000`.

---

#### Alternative: Manual Run (Individual Terminals)
If you prefer running them separately:
- **Server**: `npm start --prefix server` (Port 5000)
- **Client**: `npm run dev --prefix client` (Port 3000)

## API Endpoints (Express)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Uploads a PDF, indexes it via Python, and creates a session. |
| `POST` | `/api/chat` | Sends a question to the AI and gets an answer. |
| `POST` | `/api/summarize` | Generates a summary of the current paper. |
| `POST` | `/api/keypoints` | Extracts key points from the paper. |
| `GET` | `/api/history/:sessionId` | Retrieves chat history for a specific session. |

## Features

- **End-to-end Integration**: Smooth communication between React, Express, and Python.
- **Session Persistence**: Chat history is saved in MongoDB and persists through page refreshes.
- **Error Handling**: Real-time error reporting in the chat UI.
- **Connectivity Status**: Monitor the status of the Python AI API directly from the dashboard.
