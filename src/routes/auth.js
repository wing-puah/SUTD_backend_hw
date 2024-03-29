const express = require('express');
const { queueNewUserEmail } = require('../services/email/producer');

module.exports = (service) => {
  const router = express.Router();

  router.post('/register', async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const token = await service.registerUser(username, password);
      if (token) {
        queueNewUserEmail(username);
        res.send({ token: token });
      } else {
        res.status(400).send(`Username ${username} already exists`);
      }
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const token = await service.loginUser(username, password);
      if (token) {
        res.send({ token: token });
      } else {
        res.status(400).send('Invalid login credentials');
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
};
