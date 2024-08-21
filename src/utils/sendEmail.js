require('dotenv').config();
const transporter = require('./mailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');

const generateEmailTemplate = (templateName, data) => {
  const templatePath = path.join(__dirname, `../views/${templateName}.mjml`);
  let template = fs.readFileSync(templatePath, 'utf8');
  
  Object.keys(data).forEach(key => {
    template = template.replace(`{${key}}`, data[key]);
  });
  const { html } = mjml(template);
  return html;
};

const sendEmail = async (email, subject, template) => {
  try {
    await transporter.sendMail({
      from: process.env.G_USERS,
      to: email,
      subject,
      html: template
    });
    return console.log('mensaje enviado');
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const sendChangePassword = async (email, data) => {
  const resetLink = `http://localhost:8080/avi/v1/reset-password?token=${data.resetToken}`;
  const template = generateEmailTemplate('reset', { ...data, link_cta: resetLink });
  const subject = 'Cambio de contraseña';
  await sendEmail(email, subject, template);
};

const sendTwoFactorCodeByEmail = async (email, data) => {
  const template = generateEmailTemplate('2FA', data);
  const subject = 'Your 2FA Code';
  await sendEmail(email, subject, template);
};

module.exports = {
  sendEmail,
  sendChangePassword,
  sendTwoFactorCodeByEmail
};