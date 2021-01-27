const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

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

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.author) {
    return response.status(400).send({ message: ' Missing input' });
  }

  try {
    const blog = new Blog(request.body);
    const result = await blog.save();
    return response.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
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
