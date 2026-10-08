const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoria es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [60, 'El nombre no puede superar los 60 caracteres']
    },
    descripcion: {
      type: String,
      required: [true, 'La descripcion de la categoria es obligatoria'],
      trim: true,
      maxlength: [300, 'La descripcion no puede superar los 300 caracteres']
    }
  },
  { timestamps: true }
);

categoriaSchema.index({ nombre: 1 }, { unique: true });

module.exports = mongoose.model('Categoria', categoriaSchema, 'categorias');
