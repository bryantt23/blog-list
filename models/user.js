const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  passwordHash: String
});

module.exports = mongoose.model('User', userSchema);
