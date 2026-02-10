const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body || '{}');

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Credenciais inválidas' }),
    };
  }

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ token }),
  };
};
