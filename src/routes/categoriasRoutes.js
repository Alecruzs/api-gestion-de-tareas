const express = require('express');
const {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria
} = require('../controllers/CategoriaController');

const router = express.Router();

router.post('/', crearCategoria);
router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoriaPorId);
router.put('/:id', actualizarCategoria);

module.exports = router;
