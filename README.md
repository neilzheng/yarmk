# Yet Another Restful api Middleware for Koa

Koa middleware to help build restful microservices. It is based on koa-route and koa-compose.

## Idea
In RESET URLs, most endpoints have these patterns:

* list:   GET /users
* create: POST /users
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

With es6 class:

`Don't save application data in "this", it won't survive across requests`
```js
module.exports = class User {
  list() {
    this.ctx.body = 'user.list';
  }

  create() {
    this.ctx.body = 'user.create';
  }

  fetch(id) {
    this.ctx.body = `user.fetch ${id}`;
  }

  update(id) {
    this.ctx.body = `user.update ${id}`;
  }

  remove(id) {
    this.ctx.body = `user.remove ${id}`;
  }
}
```

Methods are optional, implement the ones needed.

## Middleware

By default, each controller provides two url matches, one for list/create (plural), one singular form for others. Example for users:

```js
const Koa = require('koa')
const RE = require('YARMK')
const User = require('./controllers/user')

const app = new Koa()

/*
 resulting
 /user/:id
 /users
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

/*for heroes
 /hero/:id
 /heroes
*/
const options = {
  controller: User,
  name: ['hero', 'heroes'],
}

app.use(RE(options))

/*if User is an es6 class*/
app.use(RE(User))

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
 for es6 class
 equivilent to above
 */
const miniOptions = User

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
      handlers: [
        {
          GET: 'fetch',
        },
        {
          PATCH: 'update',
        },
        {
          DELETE: 'remove',
        },
      ],
    },
    {
      path: '/users',
      handlers: [
        {
          POST: 'create',
        },
        {
          GET: 'list',
        },
      ],
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
const RE = require('minires')
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
    handlers: [{
      POST: 'login',
    }],
  },
  {
    path: '/auth/logout',
    handlers: [{
      GET: 'logout',
    }],
  }],
})
```

## Suggested usage for microservices:

* Folow 1. and 2., use default config.
* One controller is suggested in each app.
* Keep protocol as HTTP. If HTTPS is needed, use proxy/load balancer.
* Use koa middlewares as needed.
* We don't touch request/response, so if you want if for regular web APP, help yourself. Just no benifits seen here.

## License

  MIT
