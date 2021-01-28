const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

const getTokenFrom = req => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.author) {
    return response.status(400).send({ message: ' Missing input' });
  }

  try {
    const token = getTokenFrom(request);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findOne({ _id: decodedToken.id });
    const blog = new Blog({ ...request.body, user });
    const result = await blog.save();
    // https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
    user.blogs.push(blog);
    await user.save();
    return response.status(201).json(result);
  } catch (error) {
    console.log(error);
    return response.status(401).json({ message: error });
  }
});

blogsRouter.get('/', async (request, response) => {
  await Blog.find({})
    .populate('user', 'username name id')
    .exec((err, blogs) => {
      let blogMap = {};

      blogs.forEach(blog => {
        blogMap[blog._id] = blog;
      });

      return response.send(blogMap);
    });
});

blogsRouter.delete('/:id', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }

  const id = request.params.id;
  await Blog.findByIdAndDelete({ _id: id }).catch(err => {
    console.log('err', err);
    return next(err);
  });

  //if it gets here delete succeeded
  console.log('deleted id ' + id);
  response.status(200).send({ message: 'deleted ' + id });
});

blogsRouter.put('/:id', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }
  if (!request.body.likes) {
    return response.status(400).send({ message: ' Missing likes input' });
  }

  const likes = request.body.likes;
  const id = request.params.id;

  const updatedBlog = await Blog.findOne({ _id: id }).catch(err => {
    console.log('err', err);
    next(err);
  });
  updatedBlog.likes = likes;
  updatedBlog.save().catch(function (err) {
    console.log('err', err);
    next(err);
  });
  return response.send({
    message: `updated blog: ${updatedBlog}, likes to ${likes}`
  });
});
module.exports = blogsRouter;
