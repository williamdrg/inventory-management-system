const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const revokeToken = require('../../utils/revokeToken');
const { sendChangePassword } = require('../../utils/sendEmail');

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
  const newUser = await User.create({ ...user, password: hashedPassword });
  const { password, ...userWithoutPassword } = newUser.toJSON();
  return userWithoutPassword;
};

const loginSevices = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user) throw { status: 400, message: 'Invalid email or password' };
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw { status: 400, message: 'Invalid password' };
  
  const { id, firstName, lastName, dni, role } = user;
  const userData = { id, firstName, lastName, dni, email, role };
  const token = jwt.sign(userData, process.env.JWT_TOKEN_SECRET, { algorithm: 'HS512', expiresIn: '1d' });
  return { ...userData, token };
};

const fetchUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: 'password' } });
  if (!user) throw { status: 404, message: 'user not found' };
  return user;
};

const deleteUser = async (id, token, authUserId) => {
  if (parseInt(id) === 1) throw { status: 403, message: 'Superuser cannot be deleted.' };
  const result =  await User.destroy({ where: { id } });
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
  
  const existingEmai = await User.findOne({ where: { email: user.email } });
  if (existingEmai) throw { status: 400, message: 'Email already in use' };

  const hashedPassword = await bcrypt.hash(user.password, 10);
  const userAdmin = await User.create({ ...user, password: hashedPassword, role: 'admin' });
  const { password, ...admin } = userAdmin.toJSON();
  return admin;
};

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

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD, { algorithms: ['HS512'] });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashedPassword }, { where: { id: decoded.id } });
};

module.exports = {
  fetchAllUsers,
  createUser,
  fetchUserById,
  deleteUser,
  updateUser,
  loginSevices,
  bootstrapUser,
  createTokenPass,
  resetPassword
};