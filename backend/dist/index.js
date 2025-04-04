"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = require("./config/database");
const error_1 = require("./middleware/error");
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const creatorRoutes_1 = __importDefault(require("./routes/creatorRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
(0, database_1.connectDB)();
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
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
// Set up routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/creators', creatorRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
// Error handling middleware
app.use(error_1.notFound);
app.use(error_1.errorHandler);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
