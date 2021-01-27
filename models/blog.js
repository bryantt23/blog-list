const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: String,
  author: String,
  url: String,
  likes: { type: Number, default: 0 },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// https://stackoverflow.com/a/56296370
blogSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model('Blog', blogSchema);
