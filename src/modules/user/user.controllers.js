const catchError = require('../../utils/catchError');
const { fetchAllUsers, createUser, fetchUserById, deleteUser, updateUser, loginSevices, bootstrapUser } = require('./user.service');

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
  const { token, authUserId } = getToken();
  await deleteUser(id, token, authUserId);
  return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
  const { id } = req.params;
  const { token, authUserId } = getToken();

  const { firstName, lastName, dni, role } = req.body;
  const user = await updateUser(id, token, authUserId, { firstName, lastName, dni, role });
  return res.json(user);
});

const bootstrapAmin = catchError(async (req, res) => {
  const { firstName, lastName, dni, email, password } = req.body;
  const user = await bootstrapUser({ firstName, lastName, dni, email, password });
  return res.status(201).json(user);
});

const getToken = catchError( async (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader.split(' ')[1];
  const authUserId = req.user.id;
  return { token, authUserId };
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  bootstrapAmin
};