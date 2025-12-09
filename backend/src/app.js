const express = require('express');
const cors = require('cors');
const path = require('path');

// Configuração do dotenv com log para debug
const envPath = path.join(__dirname, '../../.env');
console.log('Carregando .env de:', envPath);
require('dotenv').config({ path: envPath });
console.log('Variáveis de ambiente carregadas:', {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    NODE_ENV: process.env.NODE_ENV
});

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
};

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
    console.error('Erro na aplicação:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
};

const profileRoutes = require('./routes/profileRoutes');
const gymRoutes = require('./routes/gymRoutes');
const partnersRoutes = require('./routes/partnersRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const groupRoutes = require('./routes/groupRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const checkinRoutes = require('./routes/checkinRoutes');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/user', profileRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/checkin', checkinRoutes);
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('API está rodando');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});