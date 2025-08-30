// Plik: backend/server.cjs

// --- Krok 1: Importy ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Krok 2: Import tras (routes) ---
const apiRoutes = require('./routes/api.cjs');
const musicRoutes = require('./routes/music.cjs');
const publishingRoutes = require('./routes/publishing.cjs');
const aiRoutes = require('./routes/ai.cjs'); // NOWY IMPORT

// --- Krok 3: Inicjalizacja Aplikacji i Middleware ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Krok 4: Definicja portu ---
const PORT = process.env.PORT || 3001;

// --- Krok 5: Podłączenie tras do głównej aplikacji ---
// Wszystkie trasy z api.cjs będą dostępne pod /api/...
app.use('/api', apiRoutes); 
// Wszystkie trasy z music.cjs będą dostępne pod /api/music/...
app.use('/api/music', musicRoutes);
// Wszystkie trasy z publishing.cjs będą dostępne pod /api/publishing/...
app.use('/api/publishing', publishingRoutes);
// Wszystkie trasy z ai.cjs będą dostępne pod /api/ai/...
app.use('/api/ai', aiRoutes); // NOWA LINIA: Podłączamy trasy AI

// --- Krok 6: Uruchomienie serwera ---
app.listen(PORT, () => {
  console.log(`Serwer działa i nasłuchuje na porcie ${PORT}`);
  console.log('Połączone trasy: /api, /api/music, /api/publishing, /api/ai');
});

