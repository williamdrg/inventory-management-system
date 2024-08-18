const catchError = require('../../utils/catchError');
const getToken = require('./getToken');
const { fetchAllUsers, createUser, fetchUserById, deleteUser, updateUser, loginSevices, bootstrapUser, createTokenPass, resetPassword } = require('./user.service');

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
  res.json(user);   
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
  await createTokenPass(email);
  res.json({ message: 'Password reset token generated successfully.' });
}); 

const updatePassword = catchError(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;
  await resetPassword(token, newPassword);
  res.status(200).json({ message: 'Password updated successfully.' });
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
  updatePassword
};