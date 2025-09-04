const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const apiRoutes = require('./routes/api.cjs');
const musicRoutes = require('./routes/music.cjs');
const publishingRoutes = require('./routes/publishing.cjs');
const aiRoutes = require('./routes/ai.cjs');
const authRoutes = require('./routes/auth.cjs');
const groqRoutes = require('./routes/groq.cjs');
const adminRoutes = require('./routes/admin.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/publishing', publishingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groq', groqRoutes);
app.use('/api/admin', adminRoutes);

// Globalny handler błędów (na końcu)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Nie znaleziono zasobu.' });
});

// Uruchamiaj serwer tylko jeśli plik jest uruchamiany bezpośrednio
if (require.main === module) {
  app.listen(3001, () => {
    console.log('Serwer działa i nasłuchuje na porcie 3001');
    console.log('Połączone trasy: /api, /api/music, /api/publishing, /api/ai');
  });
}

module.exports = app;