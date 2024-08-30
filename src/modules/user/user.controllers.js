const catchError = require('../../utils/catchError');
const getToken = require('./getToken');
const { fetchAllUsers, createUserService, fetchUserById, deleteUser, updateUserService, loginSevices, bootstrapUser, createTokenPass, resetPassword, changePasswordService, verify2FAService, enable2FAService } = require('./user.service');

/**
 * @module userControllerss
 * @description Este módulo maneja todas las operaciones relacionadas con los usuarios, incluyendo creación, actualización, eliminación y autenticación. 
 * Los controladores delegan la lógica de negocio a los servicios correspondientes.
 */

/**
 * Obtiene todos los usuarios registrados en el sistema.
 * @function
 * @route GET /api/users
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @returns {Array.<User>} 200 - Lista de usuarios
 */
const getAllUsers = catchError(async(req, res) => {
  const users = await fetchAllUsers();
  return res.json(users);
});

/**
 * Crea un nuevo usuario en el sistema.
 * @function
 * @route POST /api/users
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} firstName.body.required - Nombre del usuario
 * @param {string} lastName.body.required - Apellido del usuario
 * @param {string} dni.body.required - Documento de identidad
 * @param {string} email.body.required - Correo electrónico del usuario
 * @param {string} password.body.required - Contraseña del usuario
 * @returns {User.model} 201 - Usuario creado exitosamente
 */
const createUser = catchError(async(req, res) => {
  const { firstName, lastName, dni, email, password } = req.body;
  const user = await createUserService({ firstName, lastName, dni, email, password });
  return res.status(201).json(user);
});

/**
 * Maneja el proceso de inicio de sesión de un usuario.
 * @function
 * @route POST /api/users/login
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} email.body.required - Correo electrónico del usuario
 * @param {string} password.body.required - Contraseña del usuario
 * @returns {object} 200 - Información del usuario y token JWT
 */
const login = catchError(async(req, res) => {
  const { email, password } = req.body;
  const user = await loginSevices(email, password);
  return res.json(user);   
});

/**
 * Obtiene los detalles de un usuario específico por su ID.
 * @function
 * @route GET /api/users/:id
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {number} id.params.required - ID del usuario
 * @returns {User.model} 200 - Usuario encontrado
 */
const getOneUser = catchError(async(req, res) => {
  const { id } = req.params;
  const user = await fetchUserById(id);
  res.status(200).json(user);
});

/**
 * Elimina un usuario del sistema.
 * @function
 * @route DELETE /api/users/:id
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {number} id.params.required - ID del usuario
 * @returns {void} 204 - Usuario eliminado exitosamente
 */
const removeUser = catchError(async(req, res) => {
  const { id } = req.params;

  const { token, authUserId } = getToken(req);
 
  await deleteUser(id, token, authUserId);
  return res.sendStatus (204);
});

/**
 * Actualiza los datos de un usuario existente.
 * @function
 * @route PUT /api/users/:id
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {number} id.params.required - ID del usuario
 * @param {string} firstName.body.required - Nombre del usuario
 * @param {string} lastName.body.required - Apellido del usuario
 * @param {string} dni.body.required - Documento de identidad
 * @param {string} role.body.optional - Rol del usuario
 * @returns {User.model} 200 - Usuario actualizado exitosamente
 */
const updateUser = catchError(async(req, res) => {
  const { id } = req.params;
  const { token, authUserId } = getToken(req);

  const { firstName, lastName, dni, role } = req.body;
  const user = await updateUserService(id, token, authUserId, { firstName, lastName, dni, role });
  return res.json(user);
});

/**
 * Crea un usuario administrador en el sistema.
 * @function
 * @route POST /api/users/bootstrap
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} firstName.body.required - Nombre del administrador
 * @param {string} lastName.body.required - Apellido del administrador
 * @param {string} dni.body.required - Documento de identidad
 * @param {string} email.body.required - Correo electrónico
 * @param {string} password.body.required - Contraseña
 * @returns {User.model} 201 - Administrador creado exitosamente
 */
const bootstrapAmin = catchError(async (req, res) => {
  const { firstName, lastName, dni, email, password } = req.body;
  const user = await bootstrapUser({ firstName, lastName, dni, email, password });
  return res.status(201).json(user);
});

/**
 * Genera un token para el cambio de contraseña y lo envía por correo.
 * @function
 * @route POST /api/users/request-reset-password
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} email.body.required - Correo electrónico del usuario
 * @returns {object} 200 - Mensaje de éxito y token generado
 */
const requestChangePassword = catchError(async (req, res) => {
  const { email } = req.body;
  // descomentar cuando se tenga el fronted
  // await createTokenPass(email);
  // se usa el token momentaneamente para hacer el test y por eso se envía como respuesta
  const token = await createTokenPass(email);
  return res.json({ message: 'Password reset token generated successfully.', token });
}); 

/**
 * Restablece la contraseña del usuario utilizando un token enviado por correo.
 * @function
 * @route POST /api/users/reset-password
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} token.query.required - Token de restablecimiento de contraseña
 * @param {string} password.body.required - Nueva contraseña
 * @returns {object} 200 - Mensaje de éxito
 */
const resetPasswordViaEmailLink = catchError(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  await resetPassword(token, password);
  return res.status(200).json({ message: 'Password updated successfully.' });
});

/**
 * Permite a un usuario cambiar su contraseña mientras está autenticado.
 * @function
 * @route POST /api/users/change-password
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} currentPassword.body.required - Contraseña actual del usuario
 * @param {string} newPassword.body.required - Nueva contraseña
 * @param {string} confirmPassword.body.required - Confirmación de la nueva contraseña
 * @returns {object} 200 - Mensaje de éxito
 */
const changePasswordWhileLoggedIn = catchError(async (req, res) => {
  const { id } = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { token } = getToken(req);

  const result = await changePasswordService(id, currentPassword, newPassword, confirmPassword, token);
  return res.json(result);
});

/**
 * Habilita o deshabilita la autenticación de dos factores (2FA) para un usuario.
 * @function
 * @route POST /api/users/enable-2fa
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} password.body.required - Contraseña del usuario
 * @param {boolean} enable.body.required - Booleano para habilitar o deshabilitar 2FA
 * @returns {object} 200 - Mensaje de éxito
 */
const enable2FA = catchError(async (req, res) => {
  const { password, enable } = req.body;
  const { id } = req.user;
  await enable2FAService(id, password, enable);
  res.json({ message: '2FA enabled. A 6-digit code will be sent to your email for verification during login.' });
});

/**
 * Verifica el código de autenticación de dos factores (2FA) para completar el inicio de sesión.
 * @function
 * @route POST /api/users/verify-2fa
 * @group Usuarios - Operaciones relacionadas con los usuarios
 * @param {string} email.body.required - Correo electrónico del usuario
 * @param {string} code.body.required - Código de 2FA
 * @returns {object} 200 - Información del usuario y token JWT
 */
const verify2FA = catchError(async(req, res) => {
  const { email, code } = req.body; 
  const user = await verify2FAService(email, code);
  return res.json(user);
});


module.exports = {
  getAllUsers,
  createUser,
  getOneUser,
  removeUser,
  updateUser,
  login,
  bootstrapAmin,
  requestChangePassword,
  resetPasswordViaEmailLink,
  changePasswordWhileLoggedIn,
  enable2FA,
  verify2FA
};