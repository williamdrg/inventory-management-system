const crypto = require('crypto');
const code = crypto.randomInt(100000, 999999).toString().split('').join('&nbsp;');
console.log(code);


// Only max value provided
console.log('Random integers less than 50:');
console.log(crypto.randomInt(50));
console.log(crypto.randomInt(50));
console.log(crypto.randomInt(50));
console.log();

// Min value also provided
console.log('Random integers in range 30-50:');
console.log(crypto.randomInt(30, 50));
console.log(crypto.randomInt(30, 50));
console.log(crypto.randomInt(30, 50));

const propsInclude = ['id', 'firstName', 'dni', 'lastName', 'email', 'role'];

const array = ['key1', 'key2', 'key3'];
const obj = Object.fromEntries(propsInclude.map(key => [key, key]));

console.log(obj);
// Resultado: {key1, key2, key3}
{
  "firstName": "Administrator",
  "lastName": "González",
  "dni": 123456712,
  "email": "admin.gonzalez@email.com",
  "password": "securePass2024"
}

{
  "firstName": "Administrator",
  "lastName": "González",
  "dni": 123456712,
  "email": "williamdrg@gmail.com",
  "password": "securePass2024"
}
