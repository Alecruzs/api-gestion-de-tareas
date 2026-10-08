const express = require('express');
const {
  crearTarea,
  obtenerTareas,
  obtenerTareasIncompletas,
  obtenerTareasCompletas,
  obtenerTareaPorId,
  actualizarTarea,
  completarTarea,
  eliminarTarea,
  obtenerTareasPorCategoria
} = require('../controllers/TareaController');

const router = express.Router();

router.post('/', crearTarea);
router.get('/', obtenerTareas);
router.get('/incompletas', obtenerTareasIncompletas);
router.get('/completas', obtenerTareasCompletas);
router.get('/categoria/:categoriaId', obtenerTareasPorCategoria);
router.get('/:id', obtenerTareaPorId);
router.put('/:id', actualizarTarea);
router.patch('/:id/completar', completarTarea);
router.delete('/:id', eliminarTarea);

module.exports = router;
