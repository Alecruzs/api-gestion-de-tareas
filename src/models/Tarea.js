const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El titulo es obligatorio'],
      trim: true,
      minlength: [3, 'El titulo debe tener al menos 3 caracteres'],
      maxlength: [120, 'El titulo no puede superar los 120 caracteres']
    },
    descripcion: {
      type: String,
      required: [true, 'La descripcion es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripcion no puede superar los 1000 caracteres']
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoria es obligatoria']
    },
    completado: {
      type: Boolean,
      default: false
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
      immutable: true
    },
    fechaEliminacion: {
      type: Date,
      default: null
    }
  },
  { versionKey: false }
);

tareaSchema.index({ completado: 1, fechaEliminacion: 1 });
tareaSchema.index({ categoria: 1, fechaEliminacion: 1 });

module.exports = mongoose.model('Tarea', tareaSchema, 'tareas');
