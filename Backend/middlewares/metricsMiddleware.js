// middlewares/metricsMiddleware.js
const promClient = require('prom-client');

// Créer un registre pour toutes les métriques
const register = new promClient.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
promClient.collectDefaultMetrics({ register });

// Compteur : Nombre total de requêtes HTTP
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histogramme : Durée des requêtes HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Gauge : Nombre de requêtes en cours
const activeRequests = new promClient.Gauge({
  name: 'http_requests_active',
  help: 'Nombre de requêtes HTTP en cours',
  registers: [register]
});

// Middleware pour collecter les métriques
const metricsMiddleware = (req, res, next) => {
  if (req.path === '/metrics') return next();

  activeRequests.inc();
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
    activeRequests.dec();
  });

  next();
};

// Handler pour l'endpoint /metrics
const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
};

module.exports = { metricsMiddleware, metricsHandler, register };
