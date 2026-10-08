const Categoria = require('../models/Categoria');

const crearCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    return res.status(201).json(categoria);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'La categoria ya existe' });
    }

    return res.status(400).json({
      mensaje: 'Error al crear la categoria',
      error: error.message
    });
  }
};

const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    return res.status(200).json(categorias);
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al obtener las categorias',
      error: error.message
    });
  }
};

const obtenerCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(400).json({ mensaje: 'El ID de la categoria no es valido' });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'La categoria ya existe' });
    }

    return res.status(400).json({
      mensaje: 'Error al actualizar la categoria',
      error: error.message
    });
  }
};

module.exports = {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria
};
