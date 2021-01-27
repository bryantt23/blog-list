const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

// https://express-validator.github.io/docs/custom-validators-sanitizers.html
// https://stackoverflow.com/questions/27482806/check-if-id-exists-in-a-collection-with-mongoose
usersRouter.post(
  '/',
  body('password').exists(),
  body('password').isLength({ min: 3 }),
  body('username').custom(async value => {
    const count = await User.count({ username: value });
    if (count) {
      return Promise.reject('Username already exists');
    }
  }),

  // https://www.freecodecamp.org/news/how-to-make-input-validation-simple-and-clean-in-your-express-js-app-ea9b5ff5a8a7/
  // https://express-validator.github.io/docs/
  // https://express-validator.github.io/docs/validation-chain-api.html
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const body = request.body;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash
    });

    const savedUser = await user.save().catch(err => {
      console.log(err);
      return response.status(422).json({ errors: err });
    });

    response.json(savedUser);
  }
);

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
