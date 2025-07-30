const argon2 = require('argon2');

async function hashPassword() {
  try {
    const hashedPassword = await argon2.hash('password');
    console.log(hashedPassword);
  } catch (err) {
    console.error(err);
  }
}

hashPassword(); 