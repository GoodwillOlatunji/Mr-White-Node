# Mr. White

A web-based interface for interacting with Ollama models. This application provides a user-friendly way to chat with various Ollama models through a web browser.

## Prerequisites

- Node.js (v14 or higher)
- Ollama installed and running on your system
- npm or yarn package manager

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Make sure Ollama is running on your system
2. Start the server:
   ```bash
   npm start
   ```
3. For development with auto-reload:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Features

- Connect to different Ollama models
- Real-time chat interface
- Message history
- Clean and responsive UI
- Error handling and status indicators

## Project Structure

```
mr-white/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── server/
│   ├── index.js
│   ├── package.json
│   └── README.md
```

## API Endpoints

- `POST /api/connect` - Connect to Ollama with a specific model
- `POST /api/chat` - Send messages to the Ollama model

## Contributing

Feel free to submit issues and enhancement requests! 