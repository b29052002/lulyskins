const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const { password } = JSON.parse(event.body || '{}');

  if (password !== process.env.ADMIN_PASS) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Senha inválida' }),
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
