import express from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'JobNow API' });
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default server;
