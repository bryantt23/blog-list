const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    minlength: 3,
    required: true
  },
  passwordHash: String,
  blogs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
