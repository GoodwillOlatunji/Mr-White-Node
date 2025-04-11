const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('[Mr. White] Server initializing...');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './public')));

console.log('[Mr. White] Middleware initialized');

// API Routes
app.post('/api/connect', async (req, res) => {
    console.log('[Mr. White] Connection request received');
    try {
        const { model } = req.body;
        console.log(`[Mr. White] Connecting to Ollama with model: ${model}`);
        
        // Check if Ollama is running
        console.log('[Mr. White] Verifying Ollama status...');
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            console.error('[Mr. White] Ollama service not available');
            throw new Error('Ollama is not running');
        }
        
        console.log('[Mr. White] Connection established');
        res.json({ success: true, model });
    } catch (error) {
        console.error('[Mr. White] Connection error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    console.log('[Mr. White] Chat request received');
    try {
        const { model, messages } = req.body;
        console.log(`[Mr. White] Processing chat with model: ${model}`);
        console.log(`[Mr. White] Message count: ${messages.length}`);
        
        // Log the last user message
        const lastUserMessage = messages[messages.length - 1];
        console.log('[Mr. White] User message:', lastUserMessage.content);
        
        console.log('[Mr. White] Sending request to Ollama API...');
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                stream: false
            })
        });
        
        if (!response.ok) {
            console.error(`[Mr. White] API Error: ${response.status}`);
            throw new Error(`Ollama API Error: ${response.status}`);
        }
        
        console.log('[Mr. White] Response received');
        const data = await response.json();
        
        // Log the AI response
        console.log('[Mr. White] AI Response:', data.message.content);
        
        res.json(data);
    } catch (error) {
        console.error('[Mr. White] Chat error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`[Mr. White] Server running on http://localhost:${PORT}`);
    console.log('[Mr. White] Serving static files from:', path.join(__dirname, './public'));
});

// const DEFAULT_MODEL = 'codellama:latest';
// const DEFAULT_OLLAMA_PATH = 'C:\\Users\\Goodwill\\AppData\\Local\\Programs\\ollama\\ollama.exe'; 


