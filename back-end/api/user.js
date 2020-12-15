const express = require('express');
const { check } = require('express-validator');
const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthenticated } = require('../handlers');
const {
  formatResponse,
  requestHasErrors,
  notAuthorized,
  badRequest,
  serverError,
} = require('../utils');

const userRouter = express.Router();

// This route is used to get the current logged in user
userRouter.get('/current', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    return serverError(res);
  }
});

// This route is used to get the specified users
userRouter.post(
  '/',
  [isAuthenticated, check('userIds').not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { userIds } = req.body;

    try {
      let users = await User.find({ _id: { $in: userIds } }).select(
        '-password'
      );
      users = formatResponse(users);
      res.json(users);
    } catch (err) {
      return serverError(res);
    }
  }
);

const hashPassword = async password => {
  const salt = await bcyrpt.genSalt();
  const hashedPassword = await bcyrpt.hash(password, salt);
  return hashedPassword;
};

const createUser = async (name, email, password) => {
  const hashedPassword = await hashPassword(password);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  return user;
};

const generateToken = user =>
  jwt.sign(
    {
      user: {
        id: user.id,
      },
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 86400,
    }
  );

// This route is used to register a new user
userRouter.post(
  '/register',
  [check(['name', 'email', 'password']).not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return badRequest(res, 'User with this email already exists');
      }

      user = await createUser(name, email, password);
      const token = generateToken(user);
      res.json({ token });
    } catch (err) {
      return serverError(res);
    }
  }
);

const comparePasswords = async (password, hashedPassword) => {
  const isMatch = await bcyrpt.compare(password, hashedPassword);
  return isMatch;
};

// This route is used to login an already registered user
userRouter.post(
  '/login',
  [check(['email', 'password']).not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return badRequest(res, 'User does not exist');
      }

      const isCorrectPassword = await comparePasswords(password, user.password);
      if (!isCorrectPassword) {
        return notAuthorized(res);
      }

      const token = generateToken(user);
      res.json({ token });
    } catch (err) {
      return serverError(res);
    }
  }
);

module.exports = { userRouter };
