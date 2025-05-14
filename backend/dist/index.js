"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const error_1 = require("./middleware/error");
const http_1 = __importDefault(require("http"));
const sockets_1 = require("./sockets");
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const creatorRoutes_1 = __importDefault(require("./routes/creatorRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
(0, database_1.connectDB)();
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
// Create HTTP server from Express app
const server = http_1.default.createServer(app);
exports.server = server;
// Initialize Socket.IO
const io = (0, sockets_1.initializeSocketIO)(server);
exports.io = io;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Logging in development mode
if (process.env.NODE_ENV !== 'production') {
    app.use((0, morgan_1.default)('dev'));
}
// Make uploads folder static
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Create uploads directory if it doesn't exist
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Influencer Marketplace API' });
});
// Add a test route directly in the main file
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working' });
});
// Add a test message route directly in the main file  
app.post('/api/direct-message-test', (req, res) => {
    const { receiverId, content } = req.body;
    res.json({
        success: true,
        message: 'Direct message test successful',
        receivedData: { receiverId, content },
        timestamp: new Date().toISOString()
    });
});
// Set up routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/creators', creatorRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/conversations', conversationRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// Log all registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
    }
    else if (r.name === 'router' && r.handle.stack) {
        r.handle.stack.forEach((nestedRoute) => {
            if (nestedRoute.route) {
                const path = r.regexp.toString().includes('/api/messages')
                    ? '/api/messages' + nestedRoute.route.path
                    : r.regexp.toString().includes('/api/conversations')
                        ? '/api/conversations' + nestedRoute.route.path
                        : '';
                if (path.includes('/api/messages') || path.includes('/api/conversations')) {
                    console.log(`${Object.keys(nestedRoute.route.methods).join(',')} ${path}`);
                }
            }
        });
    }
});
// Error handling middleware
app.use(error_1.notFound);
app.use(error_1.errorHandler);
// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.IO initialized and listening for connections');
});
