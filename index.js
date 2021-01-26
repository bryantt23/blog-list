const logger = require('./utils/logger');
const config = require('./utils/config');
const mongoose = require('mongoose');

const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');

const Blog = require('./models/blog');

// const mongoUrl = 'mongodb://localhost/bloglist';
mongoose.connect(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogsRouter);

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
