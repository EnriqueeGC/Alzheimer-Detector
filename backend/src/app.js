const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors()); // Permite peticiones de otros dominios
app.use(express.json()); // Permite leer JSON del body
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('API de Usuarios funcionando 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;