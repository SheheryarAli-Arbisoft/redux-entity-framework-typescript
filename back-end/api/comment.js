const express = require('express');
const { check } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { isAuthenticated } = require('../handlers');
const {
  formatResponse,
  requestHasErrors,
  badRequest,
  serverError,
} = require('../utils');

const commentRouter = express.Router();

const createComment = async (user, content) => {
  const newComment = new Comment({ user, content });
  await newComment.save();
  return newComment;
};

const addCommentToPost = async (postId, commentId) => {
  const post = await Post.findById(postId);
  post.comments.push(commentId);
  await post.save();
};

const addReplyToComment = async (commentId, replyId) => {
  const comment = await Comment.findById(commentId);
  comment.replies.push(replyId);
  await comment.save();
};

// This route is used to create a new comment
commentRouter.post(
  '/create/:post_id',
  [isAuthenticated, check('content').not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { content } = req.body;

    try {
      const newComment = await createComment(req.user.id, content);
      await addCommentToPost(req.params.post_id, newComment.id);
      res.json(newComment);
    } catch (error) {
      return serverError(res);
    }
  }
);

// This route is used to reply to a comment
commentRouter.post(
  '/reply/:comment_id',
  [isAuthenticated, check('content').not().isEmpty()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { content } = req.body;

    try {
      const newReply = await createComment(req.user.id, content);
      await addReplyToComment(req.params.comment_id, newReply.id);
      res.json(newReply);
    } catch (error) {
      return serverError(res);
    }
  }
);

// This route is used to get the specified comments
commentRouter.post(
  '/',
  [isAuthenticated, check('commentIds').isArray()],
  async (req, res) => {
    if (requestHasErrors(req)) {
      return badRequest(res, 'Please provide all required fields');
    }

    const { commentIds } = req.body;

    try {
      let comments = await Comment.find({ _id: { $in: commentIds } });
      comments = formatResponse(comments);
      res.json(comments);
    } catch (err) {
      return serverError(res);
    }
  }
);

module.exports = { commentRouter };
