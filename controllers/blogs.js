const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  return response.json(blogs);
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

module.exports = blogsRouter;
