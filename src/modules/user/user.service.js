const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const revokeToken = require('../../utils/revokeToken');

const fetchAllUsers = async () => {
  return await User.findAll({ attributes: { exclude: 'password' } });
};

const createUser = async (user) => {
  const exitingEmail = await User.findOne({ where: { email: user.email } });
  if (exitingEmail) {
    throw {
      status: 400,
      message: 'Email or username already in use'  
    };
  }
  const hashedPassword = await bcrypt.hash(user.password, 10);
  return await User.create({ ...user, password: hashedPassword });
};

const loginSevices = async (email, password) => {
  const user = await User.findOne({ where: { email }});
  if (!user) throw { status: 400, message: 'Invalid email or password' };

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw { status: 400, message: 'Invalid password' };
  
  const { id, firstName, lastName, dni, role } = user;
  const userData = { id, firstName, lastName, dni, email, role };
  const token = jwt.sign(userData, process.env.TOKEN_SECRET, { algorithm: 'HS512', expiresIn: '1d' });
  return { ...userData, token };
};

const fetchUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: 'password' } });
  if (!user) throw { status: 404, message: 'user not found' };
  return user;
};

const deleteUser = async (id, token, authUserId) => {
  if (parseInt(id) === 1) throw { status: 403, message: 'Superuser cannot be deleted.' };
  const result =  await User.destroy({ where: {id} });
  if(!result) throw { status: 404, message: 'user not found' };

  if (parseInt(id) !== 1 && parseInt(authUserId) === parseInt(id)) {
    await revokeToken(token);
    return { message: 'User role updated. Please log in again to continue.' };
  }
  return;
};

const updateUser = async (id, token, authUserId, user) => {

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

  return upUser[1][0];
};

const bootstrapUser = async (user) => {
  const existingUsers = await User.count();
  if (existingUsers > 0) throw { status: 403, message: 'Bootstrap already completed. Cannot create another admin through this route.' };
  
  const existingEmai = await User.findOne({ where: { email: user.email}});
  if (existingEmai) throw { status: 400, message: 'Email already in use'};

  const hashedPassword = await bcrypt.hash(user.password, 10);
  return await User.create({ ...user, password: hashedPassword, role: 'admin' }); 
  
};

module.exports = {
  fetchAllUsers,
  createUser,
  fetchUserById,
  deleteUser,
  updateUser,
  loginSevices,
  bootstrapUser
};