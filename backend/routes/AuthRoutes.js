
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '2h';

const DUMMY_EMAIL = '1';
const DUMMY_PASSWORD = 'abc';
const hashedPassword = bcrypt.hashSync(DUMMY_PASSWORD, 10);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  if (email !== DUMMY_EMAIL)
    return res.status(401).json({ error: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, hashedPassword);
  if (!isMatch)
    return res.status(401).json({ error: 'Invalid email or password' });


  const token = jwt.sign({ email: DUMMY_EMAIL, id: 123, name: "John Doe" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ token, user: { email: DUMMY_EMAIL, id: 123, name: "John Doe" } });
});

module.exports = router;
