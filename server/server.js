import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Define __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure Socket.IO with CORS and security
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5000',
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO connection handling with authentication
io.use((socket, next) => {
    // Add authentication logic here if needed
    next();
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id); // Add this log
    console.log('New client connected');

    socket.on('message', async (data) => {
        try {
            console.log('Message received:', data.message);
            await runOllama(data.message, socket);
        } catch (error) {
            console.error('Error processing message:', error);
            socket.emit('bot_response', { 
                response: 'Sorry, I encountered an error processing your request.',
                isComplete: true
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

async function runOllama(input, socket) {
    return new Promise((resolve, reject) => {
        // Use the full path to ollama
        const ollamaPath = 'C:\\Users\\Goodwill\\AppData\\Local\\Programs\\ollama\\ollama.exe';
        let model = 'codellama:latest';
        const args = ['run', model, input];
        console.log('Executing command:', ollamaPath, args.join(' '));
        
        // Create the process
        const childProcess = spawn(ollamaPath, args, {
            env: process.env,
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        let isComplete = false;
        let lastResponseTime = Date.now();

        // Handle stdout
        childProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            output += chunk;
            lastResponseTime = Date.now();
            console.log('Received chunk:', chunk);
            // Send each chunk to the client
            socket.emit('bot_response', { 
                response: chunk,
                isComplete: false
            });
        });

        // Handle stderr
        childProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            // Only log non-spinner characters
            if (!chunk.match(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/)) {
                errorOutput += chunk;
                console.error('=>', chunk);
            }
        });

        // Check for completion periodically
        const checkCompletion = setInterval(() => {
            const now = Date.now();
            // If we haven't received data for 2 seconds, consider it complete
            if (now - lastResponseTime > 2000 && output.length > 0) {
                isComplete = true;
                clearInterval(checkCompletion);
                childProcess.kill();
                // Send completion signal
                socket.emit('bot_response', { 
                    response: '',
                    isComplete: true
                });
                resolve(output.trim());
            }
        }, 1000);

        // Handle process completion
        childProcess.on('close', (code) => {
            clearInterval(checkCompletion);
            isComplete = true;
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
            } else {
                // Send completion signal
                socket.emit('bot_response', { 
                    response: '',
                    isComplete: true
                });
                resolve(output.trim());
            }
        });

        // Handle process errors
        childProcess.on('error', (err) => {
            clearInterval(checkCompletion);
            console.error('Process error:', err);
            reject(err);
        });

        // Add timeout to prevent hanging
        setTimeout(() => {
            if (!isComplete) {
                clearInterval(checkCompletion);
                childProcess.kill();
                console.log('Response not complete');
                reject(new Error('Responce =>'));
            }
            else {
                console.log('Response complete');
            }
        }, 100); // 60 second timeout
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
