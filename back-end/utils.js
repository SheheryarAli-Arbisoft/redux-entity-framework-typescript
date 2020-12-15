const { validationResult } = require('express-validator');

const formatResponse = data => {
  const response = {};
  data.forEach(item => {
    response[item.id] = item;
  });
  return response;
};

const requestHasErrors = req => {
  const errors = validationResult(req);
  return !errors.isEmpty();
};

const badRequest = (res, msg = '') => {
  res.status(400).json({ msg });
};

const notAuthorized = res => {
  res.status(401).json({ msg: 'Invalid credentials' });
};

const serverError = res => {
  res.status(500).json({ msg: 'Server error' });
};

module.exports = {
  formatResponse,
  requestHasErrors,
  notAuthorized,
  badRequest,
  serverError,
};
