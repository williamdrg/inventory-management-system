const catchError = require('../../utils/catchError');

/**
 * @module providerController
 * @description Este módulo maneja todas las operaciones relacionadas con los proveedores, incluyendo la creación, actualización, eliminación y consulta.
 */

/**
 * Obtiene todos los proveedores registrados en el sistema.
 * @function
 * @route GET /api/providers
 * @group Proveedores - Operaciones relacionadas con los proveedores
 * @returns {Array.<Provider>} 200 - Lista de proveedores
 * @returns {Error}  default - Error inesperado
 */
const getAllProviders = catchError(async(req, res) => {
  const providers = await fetchAllProviders();
  return res.json(providers);
});

module.exports = getAllProviders;