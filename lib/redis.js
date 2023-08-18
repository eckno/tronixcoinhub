"use strict";
const IoRedis = require('ioredis');
class Redis {
  constructor(env_url=''){
    this.connection = new IoRedis(env_url?env_url:process.env.REDIS_URL);
  }
  async get(key) {
    return this.connection.get(key);
  }
  async del(key) {
    return this.connection.del(key);
  }
  async hgetall(key) {
    return this.connection.hgetall(key);
  }
  async hget(key, value) {
    return this.connection.hget(key, value);
  }
  async hmget(key, values) {
    return this.connection.hmget(key, values)
  }
  async hset(key, value, data) {
    return this.connection.hset(key, value, data);
  }
  async rpush(key, data) {
    return this.connection.rpush(key, data);
  }
  async lpop(key) {
    return this.connection.lpop(key);
  }
  async hdel(key, value) {
    return this.connection.hdel(key, value);
  }
  async set(key, value, timestring='EX', ttl=0) {
    return this.connection.set(key, value, 'EX', ttl)
  }
  get_connection() {
    return this.connection;
  }
  disconnect() {
    return this.connection.disconnect();
  }
}

module.exports = Redis;
