const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  content: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  replies: {
    type: Array,
  },
});

module.exports = mongoose.model('comment', CommentSchema);
