const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
  },
  comments: {
    type: Array,
  },
});

module.exports = mongoose.model('post', PostSchema);
