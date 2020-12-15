require('dotenv').config();
const express = require('express');
const path = require('path');
const { connecDb } = require('./config/db');
const { userRouter, postRouter, commentRouter } = require('./api');

connecDb();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../front-end/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../front-end/build/index.html'));
  });
}

const { PORT } = process.env;

app.listen(PORT);
