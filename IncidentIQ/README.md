# Project

**AI-powered Incident Root Cause Analysis Platform**

## Features

* RCA Generation
* Timeline Analysis
* Error Log Analysis
* Git Diff Analysis
* AI Chat Assistant
* Manager Approval Workflow
* PDF Export
* Email Reports
* Multi-AI Provider Architecture (Gemini, Groq, Claude, DeepSeek)

## Installation Steps

### 1. Clone the repository
```bash
git clone <repository-url>
cd Project
```

### 2. Environment Variables
Copy the example environment file and fill in your API keys. **Never commit your `.env` file.**
```bash
cp .env.example backend/.env
```

### 3. Install Dependencies
Install all packages for both the frontend and backend workspaces:
```bash
npm run install-all
```

### 4. Run the Application
Start both the frontend and backend development servers concurrently:
```bash
npm run dev
```

### 5. Build for Production
To build the frontend for production:
```bash
npm run build
```
