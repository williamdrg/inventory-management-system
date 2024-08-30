const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const revokeToken = require('../../utils/revokeToken');
const crypto = require('crypto');
const { sendChangePassword, sendTwoFactorCodeByEmail } = require('../../utils/sendEmail');

const propsInclude = ['id', 'firstName', 'dni', 'lastName', 'email', 'role'];
/**
 * @module userServices
 * @description Este módulo contiene la lógica de negocio para las operaciones relacionadas con los usuarios. Es utilizado por el `userController`.
 */

/**
 * Obtiene todos los usuarios con los atributos especificados.
 */
const fetchAllUsers = async () => {
  return await User.findAll({ attributes:  propsInclude });
};

/**
 * @param user - crea un nuevo usuario en una base de datos. Primero verifica si el correo electrónico 
 * proporcionado para el nuevo usuario ya está en uso. Si el correo electrónico ya está en uso, 
 * lanza un error con el estado 400 y un mensaje indicando que el correo electrónico ya está en uso.
 * @returns devuelve los datos del usuario recién creado después de verificar si
 * el correo electrónico ya está en uso.
 */

const createUserService = async (user) => {
  const exitingEmail = await User.findOne({ where: { email: user.email } });
  if (exitingEmail) throw { status: 400,message: 'Email already in use' };
  
  const newUser = await User.create(user, { attributes: propsInclude });
  const objUser = newUser.toJSON();
  const userData = Object.fromEntries(propsInclude.map(key => [key, objUser[key]]));
  return userData;
};

/**
 * @param email - maneja el inicio de sesión del usuario. Primero verifica si el usuario existe en base 
 * al correo electrónico proporcionado, luego verifica la contraseña. Si la autenticación de dos 
 * factores está habilitada para el usuario, genera un código de 6 dígitos, lo guarda en el objeto del 
 * usuario, y lo envía por correo electrónico.
 * @param password - es la contraseña ingresada por el usuario durante el proceso de inicio de sesión. 
 * Esta contraseña se utiliza para autenticar al usuario junto con su dirección de correo electrónico.
 * @returns devuelve la información del usuario y el token si no esta habilitado 2FA o de lo contrario
 * devuelve un mensaje con una propiedad twoFactorRequired en true para que pueda ser usada por el frontend.
 */

const loginSevices = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw { status: 400, message: 'Invalid email or password' };
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw { status: 400, message: 'Invalid password' };
  
  if (user.twoFactorEnabled) {
    const code = crypto.randomInt(100000, 999999);
  
    user.twoFactorCode = code;
    user.twoFactorExpires = new Date(new Date().getTime() + 5 * 60 * 1000);
    await user.save();

    /*    const obj2FA = { code: code.toString().split('').join(' ') };
    await sendTwoFactorCodeByEmail(email, obj2FA); */

    return { message: 'A 6-digit code has been sent to your email. Please enter it to complete the login.', twoFactorRequired: true, code };
  }
  const objUser = user.toJSON();
  const userData = Object.fromEntries(propsInclude.map(key => [key, objUser[key]]));
  const token = jwt.sign(userData, process.env.JWT_TOKEN_SECRET, { algorithm: 'HS512', expiresIn: '1d' });
  return { ...userData, token };
};

/**
 * @param id - es el identificador único utilizado para obtener un usuario.
 * @returns devuelve el objeto del usuario si se encuentra basado en el `id` proporcionado.
 */

const fetchUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: propsInclude });
  if (!user) throw { status: 404, message: 'user not found' };
  return user;
};

/**
 * La función `deleteUser` elimina un usuario de la base de datos, revoca su token si están eliminando
 * su propia cuenta, y maneja casos específicos de error.
 * @param id - identificador único del usuario que deseas eliminar del sistema.
 * @param token - El token del usuario que se pasa como parametro a otra función para eliminar la autenticación 
 * si el usuario es eliminado. 
 * @param authUserId - representa el ID del usuario autenticado que está intentando eliminar a otro usuario. 
 * Este parámetro se utiliza para verificar si el usuario autenticado tiene los permisos necesarios para eliminar 
 * al usuario especificado y para manejar casos especiales, como no permitir la eliminación de un superusuario.
 * @returns Si el parámetro `id` es igual a 1, se lanza un error de estado 403 con el mensaje 'No se puede
 * eliminar al superusuario'. Si no se encuentra al usuario con el `id` especificado, se lanza un error de
 * estado 404 con el mensaje 'usuario no encontrado'. Si el `id` no es 1 y el `authUserId` es el mismo que el
 * del usuario autenticado, se ejecutan las acciones correspondientes.
 */

const deleteUser = async (id, token, authUserId) => {
  if (parseInt(id) === 1) throw { status: 403, message: 'Superuser cannot be deleted.' };
  const result =  await User.destroy({ where: { id } });
  if(!result) throw { status: 404, message: 'user not found' };

  if (parseInt(id) !== 1 && parseInt(authUserId) === parseInt(id)) {
    await revokeToken(token);
    return { message: 'User deleted. Please log in again to continue.' };
  }
  return;
};

/**
 * @param id - representa el identificador único del usuario cuya información se está actualizando.
 * @param token - se utiliza para verificar la identidad del usuario y cerrar la sesión del mismo cuando  haya cambiado de rol.
 * @param authUserId - representa el ID del usuario que está realizando la solicitud para actualizar la información del usuario
 * y asegurar que el usuario tenga los permisos necesarios para modificar los datos del usuario.
 * @param user - representa la información actualizada del usuario.
 * Contiene los nuevos datos que deseas actualizar para el usuario, como su nombre, correo electrónico, rol, etc.
 * @returns Si la condición `roleChanged` no se cumple y `authUserId` no es igual a `id`, la función devolverá
 * los datos actualizados del usuario basados en el array `propsInclude`.
 */

const updateUserService = async (id, token, authUserId, user) => {

  const existingUser = await User.findByPk(id);
  if (!existingUser) throw { status: 404, message: 'User not found' };
  if (existingUser.id === 1) throw { status: 403, message: 'This user cannot be modified.' };
  
  const roleChanged = user.role && user.role !== existingUser.role;

  const upUser = await User.update(
    user,
    { where: { id }, returning: true }
  );
  if(upUser[0] === 0) throw { status: 404, message: 'User not found' };

  if (roleChanged && authUserId === id) {
    await revokeToken(token);
    return { message: 'User role updated. Please log in again to continue.' };
  }

  const objUser = upUser[1][0].toJSON();
  const userData = Object.fromEntries(propsInclude.map(key => [key, objUser[key]]));

  return userData;
};

/**
 * Crea un nuevo usuario administrador en un sistema después de verificar la
 * existencia de usuarios y duplicados de correo electrónico.
 * @param user - está diseñada para crear un nuevo usuario administrador en el sistema. 
 * Primero verifica si hay usuarios existentes en el sistema y si el correo electrónico
 * proporcionado ya está en uso. Si todo está en orden, crea un nuevo usuario administrador, elimina la
 * información sensible del objeto del usuario,
 * @returns devuelve un nuevo objeto de usuario administrador con ciertas
 * propiedades eliminadas. La función primero verifica si hay usuarios existentes en la base de datos
 * y si el correo electrónico proporcionado ya está en uso.
 */

const bootstrapUser = async (user) => {
  const existingUsers = await User.count();
  if (existingUsers > 0) throw { status: 403, message: 'Bootstrap already completed. Cannot create another admin through this route.' };
  
  const existingEmai = await User.findOne({ where: { email: user.email } });
  if (existingEmai) throw { status: 400, message: 'Email already in use' };

  const newUser = await User.create({ ...user, role: 'admin' });
  const userAdmin = newUser.toJSON();

  const propsDelete = ['password', 'resetTokenUsed', 'failedAttempts', 'lockUntil', 'twoFactorCode', 'twoFactorEnabled', 'twoFactorExpires', 'createdAt', 'updatedAt'];
  for (const prop of propsDelete) {
    delete userAdmin[prop];
  }
  
  return userAdmin;
};

/**
 * Verifica si un usuario existe, genera un token de restablecimiento y lo
 * envía al usuario para cambiar su contraseña.
 * @param email - toma un correo electrónico como parámetro. Esta función se
 * utiliza para generar un token de restablecimiento para un usuario basado en su dirección de correo
 * electrónico. Primero verifica si un usuario con el correo electrónico proporcionado existe en la base
 * de datos. Si se encuentra al usuario, genera un token de restablecimiento utilizando el token.
 */
const createTokenPass = async (email) => {
  const isUser = await User.findOne({ where: { email } });
  if (!isUser) throw { status: 404, message: 'User not found' };

  const resetToken = jwt.sign({ id: isUser.id }, process.env.JWT_RESET_PASSWORD, 
    { algorithm: 'HS512', expiresIn: '30m' }
  );

  // descomentar esta linea cuando ya se esté reallizando el frontend
  // if (resetToken) await sendChangePassword(email, { name: `${isUser.firstName} ${isUser.lastName}`, resetToken });
  // eliminar este if y el retun cuando se tenga el fronted
  if (resetToken) return resetToken;
  return;
}; 

/**
 * Verifica el token de restablecimiento de contraseña, comprueba si ha sido utilizado anteriormente, hashea
 * una nueva contraseña y actualiza la contraseña del usuario y el estado del token de restablecimiento
 * en la base de datos.
 * @param token - es un token único que se genera y se envía al correo electrónico
 * del usuario cuando solicita restablecer su contraseña. Este token se utiliza para verificar la
 * identidad del usuario y autorizar el proceso de restablecimiento de la contraseña.
 * @param newPassword - es la nueva contraseña que el usuario quiere establecer para su cuenta. 
 * Esta contraseña será hasheada utilizando bcrypt antes de actualizar la contraseña del usuario en la base de datos.
 */

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD, { algorithms: ['HS512'] });

  const user = await User.findOne({ where: { id: decoded.id } });
  if (user.resetTokenUsed) throw { status: 400, message: 'Token has already been used' };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashedPassword, resetTokenUsed: true }, { where: { id: decoded.id } });
};

/**
 * Maneja el cambio de contraseña de un usuario de manera segura, incluyendo verificaciones para la contraseña 
 * actual y la nueva, intentos fallidos, y bloqueo de la cuenta si es necesario.
 * @param id - representa el identificador único del usuario cuya contraseña está siendo cambiada. 
 * @param currentPassword - representa la contraseña actual del usuario que está 
 * tratando de cambiar.
 * @param newPassword - representa la nueva contraseña que el usuario desea establecer.
 * @param confirmPassword - se compara con `newPassword` para asegurar que el usuario haya ingresado 
 * la nueva contraseña correctamente. Si `confirmPassword` no coincide con `newPassword`, se mostrará un error.
 * @param token - se utiliza para revocar el token de autenticación del usuario después de 
 * un cierto número de intentos fallidos de cambio de contraseña o cuando la contraseña se ha cambiado exitosamente.
 * @returns object
 */
const changePasswordService = async (id, currentPassword, newPassword, confirmPassword, token ) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw { status: 403, message: 'Account is locked. Try again later.' };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= 6) {

      await revokeToken(token);
      user.failedAttempts = 0; 
      user.lockUntil = new Date(new Date().getTime() + 30 * 60 * 1000);
    } else if (user.failedAttempts >= 3) {  
      user.lockUntil = new Date(new Date().getTime() + 10 * 60 * 1000);
    }

    await user.save();
    throw { status: 400, message: 'Current password is incorrect' };
  }

  user.failedAttempts = 0;
  user.lockUntil = null;

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw { status: 400, message: 'New password cannot be the same as the current password.' };
  }

  if (newPassword !== confirmPassword) {
    throw { status: 400, message: 'New passwords do not match' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashedPassword }, { where: { id } });

  await revokeToken(token);

  return { message: 'Password updated successfully. Please log in again.' };
};

const enable2FAService = async (userId, password, enable) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw { status: 400, message: 'Invalid password' };

  user.twoFactorEnabled = enable;
  await user.save();
  return;
};

/**
 * Verifica y valida el código de autenticación de dos factores de un
 * usuario y devuelve un token JWT si tiene éxito.
 * @param email - se utiliza para identificar al usuario para quien se está
 * verificando el código de autenticación de dos factores (2FA).
 * @param code -  se utiliza para verificar un código de autenticación de dos factores para un usuario. 
 * La función toma un correo electrónico y un código como parámetros. El parámetro `code` es el código 
 * de autenticación de dos factores ingresado por el usuario para la verificación.
 * @returns devuelve un objeto que incluye la información del usuario y un token JWT. 
 * La información del usuario se obtiene de la base de datos y se actualiza si el código
 * 2FA es válido y no ha expirado. El token JWT se genera utilizando los datos del usuario y un token
 * secreto, y expira en 1 hora.
 */

const verify2FAService = async (email, code) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.twoFactorEnabled) throw { status: 400, message: '2FA is not enabled or user not found' };

  if (parseInt(user.twoFactorCode) !== parseInt(code) || user.twoFactorExpires < new Date()) {
    throw { status: 400, message: 'Invalid or expired 2FA code' };
  }

  user.twoFactorCode = null;
  user.twoFactorExpires = null;
  await user.save();

  const objUser = user.toJSON();
  const userData = Object.fromEntries(propsInclude.map(key => [key, objUser[key]]));
  const token = jwt.sign(userData, process.env.JWT_TOKEN_SECRET, { algorithm: 'HS512', expiresIn: '1h' });
  return { ...userData, token };
};

module.exports = {
  fetchAllUsers,
  createUserService,
  fetchUserById,
  deleteUser,
  updateUserService,
  loginSevices,
  bootstrapUser,
  createTokenPass,
  resetPassword,
  changePasswordService,
  enable2FAService,
  verify2FAService
};