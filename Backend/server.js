const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); 
const { metricsMiddleware, metricsHandler } = require('./middlewares/metricsMiddleware');
require('dotenv').config();

const app = express();

// Middlewares généraux
app.use(cors());
app.use(express.json());

// Middleware Prometheus
app.use(metricsMiddleware);

// Endpoint /metrics pour Prometheus
app.get('/metrics', metricsHandler);

// Tes routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Connexion à la base
connectDB();

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
