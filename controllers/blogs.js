const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

async function getUser(request) {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findOne({ _id: decodedToken.id });
  return user;
}

// POST http://localhost:3001/api/blogs/:id/comments HTTP/1.1
blogsRouter.post('/:id/comments', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }

  try {
    const blogId = request.params.id;
    console.log(blogId);
    const comment = request.body.comment;
    console.log('comment', comment);

    let blog = await Blog.findOne({ _id: blogId });
    const blog_Id = blog._id;
    let { comments } = blog;
    if (!comments) {
      comments = [];
    }
    comments.push(comment);
    blog.comments = comments;

    console.log('blog_Id ', blog_Id);
    console.log('blog ', blog);
    await blog.save().catch(function (err) {
      console.log('err', err);
      next(err);
    });

    console.log('blog ', blog);
    return response.send({
      message: `updated blog: ${blog}, commments to ${comments}`
    });
  } catch (error) {
    console.log('error', error);
    return next(error);
  }

  // await Blog.findByIdAndDelete({ _id: blogId }).catch(err => {
  //   console.log('err', err);
  //   return next(err);
  // });
});

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title || !request.body.author) {
    return response.status(400).send({ error: ' Missing input' });
  }

  try {
    const user = await getUser(request);
    const blog = await new Blog({ ...request.body, user });
    const result = await blog.save();
    // https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
    user.blogs.push(blog);
    await user.save();
    return response.status(201).json(result);
  } catch (error) {
    console.log(error);
    return response.status(401).json({ error });
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

// https://stackoverflow.com/questions/2342579/http-status-code-for-update-and-delete
// https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save
blogsRouter.delete('/:id', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }

  try {
    //later throw exception for no user, no blog

    //

    const blogId = request.params.id;
    const user = await getUser(request);
    const blog = await Blog.findOne({ _id: blogId });
    const blog_Id = blog._id;
    const userId = user._id;

    // console.log('blog  ' + blog);
    console.log('user  ' + user);
    // console.log('user blogs ' + user.blogs);
    console.log('blog_Id ' + blog_Id);
    console.log('userId ' + userId);
    const userBlogs = user.blogs;
    console.log('userBlogs ' + userBlogs);
    //user wrote blog
    if (userBlogs.includes(blogId)) {
      await user.blogs.pull({ _id: blogId }); // removed
      // const updatedBlogs = userBlogs.filter(blog => {
      //   console.log(blog);
      //   console.log(blog.id);
      //   console.log(blog._id);
      //   return blog._id !== blog_Id;
      // });
      // user.blogs = updatedBlogs;
      // await user.save();
      console.log('userBlogs ' + userBlogs);
      await Blog.findByIdAndRemove(blog_Id);
      //remove from user
      console.log('will delete your blog');
      response
        .status(200)
        .send({ message: `Deleted blog id ${blog_Id} by user ${user.name}` });

      //delete from blog
    } else {
      console.log('you did not write, cannot delete blog');
      //can't delete
      response
        .status(401)
        .send({ message: 'you did not write, cannot delete blog' });
    }

    // response.status(200).send({ message: user + ' ' + blogId });
    // response.status(200).send({ message: 'deleted ' + blogId });
  } catch (error) {
    console.log('error', error);
    return next(error);
  }

  // await Blog.findByIdAndDelete({ _id: blogId }).catch(err => {
  //   console.log('err', err);
  //   return next(err);
  // });
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
