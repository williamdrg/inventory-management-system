const User = require('../models/User');
const request = require('supertest');
const app = require('../app');

const BASE_URL = '/api/v1/users';
const admin = {
  firstName: 'Administrator',
  lastName: 'González',
  dni: 123456712,
  email: 'admin.gonzalez@example.com',
  password: 'securePass2024'
};

const guest = {
  firstName: 'Maria',
  lastName: 'Jimenez',
  dni: 12345678,
  email: 'maria@gmail.com',
  password: '1234'
};

let userId;
let token;
let tokenReset;

test('POST /setup -> Creates admin user, responds with status 201 and correct firstName', async () => {
  const res = await request(app)
    .post(`${BASE_URL}/setup`)
    .send(admin);
  
  expect(res.status).toBe(201);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(admin.firstName);
});

test('POST /login -> Logs in as admin, responds with status 200 and returns a token', async () => {
  const res = await request(app)
    .post(`${BASE_URL}/login`)
    .send({ email: admin.email, password: admin.password });
  
  token = res.body.token;

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
});

test('POST BASE_URL -> Creates guest user, responds with status 201 and correct firstName', async () => {
  const res = await request(app)
    .post(BASE_URL)
    .set('Authorization',`Bearer ${token}`)
    .send(guest);
    
  userId = res.body.id;
  if (res.status !== 201) console.error('Error en la creación del usuario:', res.body);

  expect(res.status).toBe(201);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(guest.firstName);
});

test('GET BASE_URL -> Retrieves all users, responds with status 200 and an array of length 2', async () => {
  const res = await request(app)
    .get(BASE_URL)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body).toHaveLength(2);
  
}); 

test('GET BASE_URL/:id -> Retrieves guest user by ID, responds with status 200 and correct firstName', async () => {
  const res = await request(app)
    .get(`${BASE_URL}/${userId}`)
    .set('Authorization',`Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(guest.firstName);

});

test('PUT -> BASE_URL/:id, Updates guest user, responds with status 200 and updated firstName', async () => {
  
  const userUpdate =  {
    firstName: 'marcos',
    lastName: 'pineda',
    dni: 12345627,
    role: 'admin'
  };
  
  const res = await request(app)
    .put(`${BASE_URL}/${userId}`)
    .set('Authorization',`Bearer ${token}`)
    .send(userUpdate);

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(userUpdate.firstName);

});

test('POST /request_password -> Requests password reset, responds with status 200 and returns a token', async() => {
  const res = await request(app)
    .post(`${BASE_URL}/request_password`)
    .send({ email: guest.email });

  tokenReset = res.body.token;
  
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.message).toBe('Password reset token generated successfully.');
});

test('POST /update_password -> Resets password using token, responds with status 200 and success message', async() => {
  const res = await request(app)
    .post(`${BASE_URL}/update_password?token=${tokenReset}`)
    .send({ newPassword: '1234567' });
  
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.message).toBe('Password updated successfully.');
});

test('DELETE -> BASE_URL/;id, Deletes guest user, responds with status 204', async() => {
  const res = await request(app)
    .delete(`${BASE_URL}/${userId}`)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.statusCode).toBe(204);
});

test('DELETE -> Prevents superuser deletion, responds with status 403 and error message', async() => {
  const res = await request(app)
    .delete(`${BASE_URL}/1`)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.status).toBe(403);
  expect(res.body.message).toBe('Superuser cannot be deleted.');

  await User.destroy({ where: { id: 1 } });

});