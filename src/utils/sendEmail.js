require('dotenv').config();
const transporter = require('./mailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');

const generateEmailTemplate = (data) => {
  const templatePath = path.join(__dirname, '../views/reset.mjml');
  let templateResetPass = fs.readFileSync(templatePath, 'utf8');
  
  templateResetPass = templateResetPass.replace('{name}', data.name);
  templateResetPass = templateResetPass.replace('{link_cta}', data.link_cta);
 
  const { html } = mjml(templateResetPass);
  return html;
};

const sendEmail = (email, data, template) => {
  return transporter.sendMail({
    from: process.env.G_USERS,
    to: email,
    subject: 'Cambio de contraseña',
    html: template
  })
    .then(() => console.log('mensaje enviado'))
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

const sendChangePassword = async (email, data) => {
  const resetLink = `http://localhost:8080/avi/v1/reset-password?token=${data.resetToken}`;
  const template = generateEmailTemplate({ ...data, link_cta: resetLink });
  await sendEmail(email, data, template);
};

module.exports = {
  sendEmail,
  sendChangePassword
};