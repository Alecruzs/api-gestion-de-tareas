require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const categoriasRoutes = require('./routes/categoriasRoutes');
const tareasRoutes = require('./routes/tareasRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestion_tareas';

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/categorias', categoriasRoutes);
app.use('/api/tareas', tareasRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El JSON enviado no es valido' });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ mensaje: 'El ID proporcionado no es valido' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      mensaje: 'Los datos enviados no son validos',
      errores: Object.values(error.errors).map((validationError) => validationError.message)
    });
  }

  return res.status(500).json({ mensaje: 'Error interno del servidor' });
});

const iniciarServidor = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    await Promise.all([mongoose.model('Categoria').init(), mongoose.model('Tarea').init()]);

    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
