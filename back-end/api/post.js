const express = require('express');
const { check } = require('express-validator');
const Post = require('../models/Post');
const { isAuthenticated } = require('../handlers');
const {
  formatResponse,
  requestHasErrors,
  badRequest,
  serverError,
} = require('../utils');

const postRouter = express.Router();

// This routes is used to get all posts with pagination
postRouter.get('/', async (req, res) => {
  const currentPage = parseInt(req.query.currentPage, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 10;
  const totalRecords =
    parseInt(req.query.totalRecords, 10) || (await Post.countDocuments());

  try {
    let posts = await Post.find()
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .sort({ timestamp: -1 });

    const hasMoreRecords = posts.length >= pageSize;

    posts = formatResponse(posts);

    const pagination = {
      currentPage,
      pageSize,
      totalRecords,
      hasMoreRecords,
    };

    res.json({ posts, pagination });
  } catch (err) {
    return serverError(res);
  }
});

const createPost = async (user, content) => {
  const post = new Post({ user, content });
  await post.save();
  return post;
};

// This route is used to create a new post
postRouter.post(
  '/create',
  [isAuthenticated, check('content').not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { content } = req.body;

    try {
      const post = await createPost(req.user.id, content);
      res.json(post);
    } catch (err) {
      return serverError(res);
    }
  }
);

const getLikedStatus = async (postId, userId) => {
  const post = await Post.findById(postId);
  const index = post.likes.indexOf(userId);
  return { post, index, liked: index !== -1 };
};

const likePost = async (postId, userId) => {
  const { post, liked } = await getLikedStatus(postId, userId);
  if (!liked) {
    post.likes.push(userId);
  }
  await post.save();
  return post;
};

const unlikePost = async (postId, userId) => {
  const { post, index, liked } = await getLikedStatus(postId, userId);
  if (liked) {
    post.likes.splice(index, 1);
  }
  await post.save();
  return post;
};

// This route is used to like a psot
postRouter.put('/like/:post_id', isAuthenticated, async (req, res) => {
  try {
    const post = await likePost(req.params.post_id, req.user.id);
    res.json(post);
  } catch (err) {
    return serverError(res);
  }
});

// This route is used to unlike a post
postRouter.put('/unlike/:post_id', isAuthenticated, async (req, res) => {
  try {
    const post = await unlikePost(req.params.post_id, req.user.id);
    res.json(post);
  } catch (err) {
    return serverError(res);
  }
});

module.exports = { postRouter };
