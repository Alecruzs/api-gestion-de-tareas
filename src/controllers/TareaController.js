const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Tarea = require('../models/Tarea');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

const consultaTareas = (filtro = {}) =>
  Tarea.find({ ...filtro, fechaEliminacion: null })
    .populate('categoria', 'nombre descripcion')
    .sort({ fechaCreacion: -1 });

const validarCategoria = async (categoriaId) => {
  if (!validarId(categoriaId)) {
    return false;
  }

  return Boolean(await Categoria.exists({ _id: categoriaId }));
};

const crearTarea = async (req, res) => {
  try {
    const datos = { ...req.body, completado: false };

    if (!(await validarCategoria(datos.categoria))) {
      return res.status(400).json({ mensaje: 'La categoria indicada no existe' });
    }

    const tarea = await Tarea.create(datos);
    await tarea.populate('categoria', 'nombre descripcion');
    return res.status(201).json(tarea);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al crear la tarea',
      error: error.message
    });
  }
};

const obtenerTareas = async (req, res) => {
  try {
    const tareas = await consultaTareas();
    return res.status(200).json(tareas);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las tareas', error: error.message });
  }
};

const obtenerTareasIncompletas = async (req, res) => {
  try {
    const tareas = await consultaTareas({ completado: false });
    return res.status(200).json(tareas);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las tareas incompletas', error: error.message });
  }
};

const obtenerTareasCompletas = async (req, res) => {
  try {
    const tareas = await consultaTareas({ completado: true });
    return res.status(200).json(tareas);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener las tareas completas', error: error.message });
  }
};

const obtenerTareaPorId = async (req, res) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El ID de la tarea no es valido' });
    }

    const tarea = await consultaTareas({ _id: req.params.id }).then((resultado) => resultado[0]);

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    return res.status(200).json(tarea);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener la tarea', error: error.message });
  }
};

const actualizarTarea = async (req, res) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El ID de la tarea no es valido' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'categoria') && !(await validarCategoria(req.body.categoria))) {
      return res.status(400).json({ mensaje: 'La categoria indicada no existe' });
    }

    const tarea = await Tarea.findOneAndUpdate(
      { _id: req.params.id, fechaEliminacion: null },
      req.body,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre descripcion');

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    return res.status(200).json(tarea);
  } catch (error) {
    return res.status(400).json({ mensaje: 'Error al actualizar la tarea', error: error.message });
  }
};

const completarTarea = async (req, res) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El ID de la tarea no es valido' });
    }

    const tarea = await Tarea.findOneAndUpdate(
      { _id: req.params.id, fechaEliminacion: null },
      { completado: true },
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre descripcion');

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    return res.status(200).json(tarea);
  } catch (error) {
    return res.status(400).json({ mensaje: 'Error al completar la tarea', error: error.message });
  }
};

const eliminarTarea = async (req, res) => {
  try {
    if (!validarId(req.params.id)) {
      return res.status(400).json({ mensaje: 'El ID de la tarea no es valido' });
    }

    const tarea = await Tarea.findOneAndDelete({ _id: req.params.id })
      .populate('categoria', 'nombre descripcion');

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    return res.status(200).json({ mensaje: 'Tarea eliminada correctamente', tarea });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar la tarea', error: error.message });
  }
};

const obtenerTareasPorCategoria = async (req, res) => {
  try {
    if (!validarId(req.params.categoriaId)) {
      return res.status(400).json({ mensaje: 'El ID de la categoria no es valido' });
    }

    if (!(await validarCategoria(req.params.categoriaId))) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    const tareas = await consultaTareas({ categoria: req.params.categoriaId });
    return res.status(200).json(tareas);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener tareas por categoria', error: error.message });
  }
};

module.exports = {
  crearTarea,
  obtenerTareas,
  obtenerTareasIncompletas,
  obtenerTareasCompletas,
  obtenerTareaPorId,
  actualizarTarea,
  completarTarea,
  eliminarTarea,
  obtenerTareasPorCategoria
};
