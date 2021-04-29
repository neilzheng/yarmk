const MakeServer = require('./server');
const request = require('supertest');
const { expect } = require('chai');

const TestController = {
  handle1(method) {
    return { method };
  },

  handle2(method, id) {
    return { method, id };
  },

  handle3(method, action) {
    return { method, action };
  },

  handle4(method, id, action) {
    return { method, id, action };
  },

  list(ctx) {
    ctx.body = this.handle1('list');
  },

  create(ctx) {
    ctx.body = this.handle1('create');
  },

  batchAction(ctx, action) {
    ctx.body = this.handle3('batchAction', action);
  },

  fetch(ctx, id) {
    ctx.body = this.handle2('fetch', id);
  },

  update(ctx, id) {
    ctx.body = this.handle2('update', id);
  },

  remove(ctx, id) {
    ctx.body = this.handle2('remove', id);
  },

  singleAction(ctx, id, action) {
    ctx.body = this.handle4('singleAction', id, action);
  }
};

describe('test restful api contructed by mini options (fully implicit)', () => {
  let agent;
  let server;

  before(() => {
    server = MakeServer({
      controller: TestController,
      path: '/test'
    });
    agent = request.agent(server);
  });

  it('should list', async () => {
    const res = await agent.get('/test');
    expect(res.body.method).to.eq('list');
  });

  it('should create', async () => {
    const res = await agent.post('/test');
    expect(res.body.method).to.eq('create');
  });

  it('should batchAction', async () => {
    const res = await agent.put('/test/test');
    expect(res.body.method).to.eq('batchAction');
    expect(res.body.action).to.eq('test');
  });

  it('should fetch', async () => {
    const res = await agent.get('/test/123');
    expect(res.body.method).to.eq('fetch');
    expect(res.body.id).to.eq('123');
  });

  it('should update', async () => {
    const res = await agent.patch('/test/123');
    expect(res.body.method).to.eq('update');
    expect(res.body.id).to.eq('123');
  });

  it('should remove', async () => {
    const res = await agent.delete('/test/123');
    expect(res.body.method).to.eq('remove');
    expect(res.body.id).to.eq('123');
  });

  it('should singleAction', async () => {
    const res = await agent.put('/test/123/test');
    expect(res.body.method).to.eq('singleAction');
    expect(res.body.id).to.eq('123');
    expect(res.body.action).to.eq('test');
  });

  after(() => {
    server.close();
  });
});
