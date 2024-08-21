const catchError = require('../../utils/catchError');
const getToken = require('./getToken');
const { fetchAllUsers, createUser, fetchUserById, deleteUser, updateUser, loginSevices, bootstrapUser, createTokenPass, resetPassword, changePasswordService, verify2FAService, enable2FAService } = require('./user.service');

const getAll = catchError(async(req, res) => {
  const users = await fetchAllUsers();
  return res.json(users);
});

const create = catchError(async(req, res) => {
  const { firstName, lastName, dni, email, password } = req.body;
  const user = await createUser({ firstName, lastName, dni, email, password });
  return res.status(201).json(user);
});

const login = catchError(async(req, res) => {
  const { email, password } = req.body;
  const user = await loginSevices(email, password);
  return res.json(user);   
});

const getOne = catchError(async(req, res) => {
  const { id } = req.params;
  const user = await fetchUserById(id);
  res.status(200).json(user);
});

const remove = catchError(async(req, res) => {
  const { id } = req.params;

  const { token, authUserId } = getToken(req);
 
  await deleteUser(id, token, authUserId);
  return res.sendStatus (204);
});

const update = catchError(async(req, res) => {
  const { id } = req.params;
  const { token, authUserId } = getToken(req);

  const { firstName, lastName, dni, role } = req.body;
  const user = await updateUser(id, token, authUserId, { firstName, lastName, dni, role });
  return res.json(user);
});

const bootstrapAmin = catchError(async (req, res) => {
  const { firstName, lastName, dni, email, password } = req.body;
  const user = await bootstrapUser({ firstName, lastName, dni, email, password });
  return res.status(201).json(user);
});

const requestChangePassword = catchError(async (req, res) => {
  const { email } = req.body;
  // descomentar cuando se tenga el fronted
  // await createTokenPass(email);
  // se usa el token momentaneamente para hacer el test y por eso se envía como respuesta
  const token = await createTokenPass(email);
  return res.json({ message: 'Password reset token generated successfully.', token });
}); 

const resetPasswordViaEmailLink = catchError(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  await resetPassword(token, password);
  return res.status(200).json({ message: 'Password updated successfully.' });
});

const changePasswordWhileLoggedIn = catchError(async (req, res) => {
  const { id } = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { token } = getToken(req);

  const result = await changePasswordService(id, currentPassword, newPassword, confirmPassword, token);
  return res.json(result);
});

const enable2FA = catchError(async (req, res) => {
  const { password, enable } = req.body;
  const { id } = req.user;
  await enable2FAService(id, password, enable);
  res.json({ message: '2FA enabled. A 6-digit code will be sent to your email for verification during login.' });
});

const verify2FA = catchError(async(req, res) => {
  const { email, code } = req.body; 
  const user = await verify2FAService(email, code);
  return res.json(user);
});


module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  bootstrapAmin,
  requestChangePassword,
  resetPasswordViaEmailLink,
  changePasswordWhileLoggedIn,
  enable2FA,
  verify2FA
};