const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

module.exports = (db) => {
  const service = {};

  service.generateToken = (uid) => {
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  };

  service.registerUser = async (username, password) => {
    const user = await db.findUserByUsername(username);
    if (user) {
      return null;
    } else {
      const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
      const newUser = new User({ username, password_hash: passwordHash });

      const user = await db.insertUser(newUser);

      return service.generateToken(user.id);
    }
  };

  service.loginUser = async (username, password) => {
    const user = await db.findUserByUsername(username);
    if (user) {
      const isValid = await bcrypt.compare(String(password), String(user.password_hash));
      if (isValid) {
        return service.generateToken(user.id);
      }
    }
    return null;
  };

  service.verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.uid;
    } catch (err) {
      return null;
    }
  };

  service.verifyUserAndTodo = async (userId, todoId) => {
    try {
      const item = await db.findItemFromUser(todoId, userId);

      if (item) {
        return item;
      }

      return null;
    } catch (error) {
      console.error({ error });
      return null;
    }
  };

  return service;
};
