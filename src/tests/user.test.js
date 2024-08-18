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


test('Response status code is 201', async () => {
  const res = await request(app)
    .post(`${BASE_URL}/setup`)
    .send(admin);
  
  expect(res.status).toBe(201);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(admin.firstName);
});

test('POST -> /BASE_UL/users/login, should return', async () => {
  const res = await request(app)
    .post(`${BASE_URL}/login`)
    .send({ email: admin.email, password: admin.password });
  
  token = res.body.token;

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
});

test('POST -> /BASE_UL, should return statusCode 201, and res.body.firtName === guest.firstName"', async () => {
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

test('GET -> "/BASE_UL", BASE_URL should return statusCode 200, and res.body.length === 2', async () => {
  const res = await request(app)
    .get(BASE_URL)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body).toHaveLength(2);
  
}); 

test('GET -> BASE_URL/:id, should return statusCode 200, and res.body == admin.firstName', async () => {
  const res = await request(app)
    .get(`${BASE_URL}/${userId}`)
    .set('Authorization',`Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toBeDefined();
  expect(res.body.firstName).toBe(guest.firstName);

});

test('PUT -> BASE_URL/:id, should return statusCode 200, and res.body.firstName == userUpdate.firtName', async () => {
  
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

test('DELETE -> BASE_URL/;id, should return statusCode 204', async() => {
  const res = await request(app)
    .delete(`${BASE_URL}/${userId}`)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.statusCode).toBe(204);
});

test('DELETE -> BASE_URL/;id, should return statusCode 204', async() => {
  const res = await request(app)
    .delete(`${BASE_URL}/1`)
    .set('Authorization',`Bearer ${token}`);
  
  expect(res.status).toBe(403);
  expect(res.body.message).toBe('Superuser cannot be deleted.');

  await User.destroy({ where: {id: 1}});

});