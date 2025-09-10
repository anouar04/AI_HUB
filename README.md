# AI Business Hub - Full-Stack Application

This is a full-stack AI-powered platform for small businesses to manage appointments, clients, and communications.

## Project Structure

-   `/` - Root directory containing frontend files and workspace configuration.
-   `/backend` - Node.js, Express, and MongoDB backend server.

## Prerequisites

-   Node.js (v18 or later)
-   npm
-   MongoDB instance (local or cloud like MongoDB Atlas)
-   Google Gemini API Key

## Setup & Running the Application

Follow these steps to get the application running locally.

### 1. Backend Setup

First, set up the backend server.

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
npm install

# Create a .env file from the example
cp .env.example .env
```

Next, open the newly created `backend/.env` file and add your credentials:

```env
# Your MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority

# Your Google Gemini API Key
API_KEY=your_google_gemini_api_key
```

### 2. Frontend & Full-Stack Setup

Now, navigate back to the root directory to install dependencies and start the application.

```bash
# Go back to the root project directory
cd ..

# Install root dependencies (for running both servers concurrently)
npm install
```

### 3. Start the Application

Run the following command from the **root directory**:

```bash
npm start
```

This command will:
-   Start the backend server on `http://localhost:5001`.
-   Start the frontend development server on `http://localhost:8000`.

Open your browser and navigate to `http://localhost:8000` to use the application.
