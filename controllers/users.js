const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
  const body = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  });

  const savedUser = await user.save().catch(err => console.log(err));

  response.json(savedUser);
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  return response.json(users);
});

/*
usersRouter.delete('/:id', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }

  const id = request.params.id;
  await User.findByIdAndDelete({ _id: id }).catch(err => {
    console.log('err', err);
    return next(err);
  });

  //if it gets here delete succeeded
  console.log('deleted id ' + id);
  response.status(200).send({ message: 'deleted ' + id });
});

usersRouter.put('/:id', async (request, response, next) => {
  if (!request.params.id) {
    return response.status(400).send({ message: ' Missing id' });
  }
  if (!request.body.likes) {
    return response.status(400).send({ message: ' Missing likes input' });
  }

  const likes = request.body.likes;
  const id = request.params.id;

  const updatedBlog = await User.findOne({ _id: id }).catch(err => {
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
*/

module.exports = usersRouter;
