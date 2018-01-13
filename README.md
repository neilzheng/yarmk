# Yet Another Restful api Middleware for Koa

Koa middleware to help build restful microservices. It is based on koa-route and koa-compose.

## Idea
In RESET URLs, most endpoints have these patterns:

* list:   GET /user
* create: POST /user
* fetch:  GET /user/:id
* update: PATCH /user/:id
* remove: DELETE /user/:id

So, we make this our default rule for designing REST API.

## Controller

Every Endpoint is a JS module, example for users:

```js
module.exports = {
  list(ctx) {
    ctx.body = 'user.list';
  },
  create(ctx) {
    ctx.body = 'user.create';
  },
  fetch(ctx, id) {
    ctx.body = `user.fetch ${id}`;
  },
  update(ctx, id) {
    ctx.body = `user.update ${id}`;
  },
  remove(ctx, id) {
    ctx.body = `user.remove ${id}`;
  },
};
```

Methods are optional, implement the ones needed.

## Middleware

By default, each controller provides two url matches, one for list/create (plural), one singular form for others. Example for users:

```js
const Koa = require('koa')
const RE = require('yarmk')
const User = require('./controllers/user')

const app = new Koa()

/*
 resulting
 /user/:id
 /user
*/
const options = {
  /*handlers*/
  controller: User,
  name: 'user',
}

/*if username is prefered*/
const options = {
  controller: User,
  name: 'user',
  index: ':username(\\w+)',
}

app.use(RE(options))

app.listen(3000)
```

## Parameters:
```js
/*
 default
*/
const miniOptions = {
  controller: User,
  name: 'user',
}

/*
 full
*/
const fullOptions = {
  /*The Controller, REQUIRED*/
  controller: User,
  /*Endpoint Path for building URL, optional*/
  /*Required if controller is not es6 class and urls not set*/
  /*Ignored if urls set''*/
  name: 'user',
  /*Index for Fetching Single Object, optional*/
  /*Default is ':id(\\d+)'*/
  /*Ignored if urls set*/
  index: ':id(\\d+)',
  /*Routes, optional, default as folowing code*/
  urls: [{
      /*required in urls, NOTE: urls itself is optionsl*/
      /*Override default when exists.*/
      /*Default to be build by name+index*/
      path: '/user/:id(\\d+)',
      /*reqired in urls*/
      handlers: {
        GET: 'fetch',
        PATCH: 'update',
        DELETE: 'remove'
      },
    },
    {
      path: '/user',
      handlers: {
        POST: 'create',
        GET: 'list'
      },
    },
  ],
}
```

## Customize. 

Example for auth(login/logout):

```js
/*controller*/
module.exports = {
  login (ctx) {
    //get posted username & password
    //do login job
  }

  logout (ctx) {
    //do logout job
    //delete user session
  }
}

/*app*/
const Koa = require('koa')
const RE = require('yarmk')
const Auth = require('./controllers/auth')

const app = new Koa()

/*
 resulting 
 /auth/login
 /auth/logout
*/
app.use(RE{
  controller: Auth,
  urls: [{
    path: '/auth/login',
    handlers: {
      POST: 'login',
    },
  },
  {
    path: '/auth/logout',
    handlers: {
      GET: 'logout',
    },
  }],
})
```

## License

  MIT
