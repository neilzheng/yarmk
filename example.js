const Koa = require('koa');
const RE = require('./index');

const app = new Koa();

const User = {
  list(ctx) {
    ctx.body = 'user.list';
  },

  create(ctx) {
    ctx.body = 'user.create';
  },

  fetch(ctx, username) {
    ctx.body = `user.fetch ${username}`;
  },

  update(ctx, username) {
    ctx.body = `user.update ${username}`;
  },

  remove(ctx, username) {
    ctx.body = `user.remove ${username}`;
  }
};

app.use(RE({
  controller: User,
  path: '/user',
  index: ':username([\\w\\-\\_]+)'
}));

app.listen(3000);
