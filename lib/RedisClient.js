/**
 * @module RedisClient
 * helper to create redis client
 */

const { config } = require('bluebird');
var redis = require('redis');
var debug = require('debug')('redisclient');

var redis_client_cache = {};

function errorlistener(e) {
    if (!debug.enabled) console.log(e.stack);
    else debug(e);
}

/**
 * create a redis client with given options
 * falling back to defaults otherwise
 *
 * @param {Object}    opts
 * @param {Object}    [opts.redis=redis] - redis client library
 * @param {String}    [opts.name] - name of the service
 * @param {Object}    [opts.options={}] - options for redis.createClient
 * @param {String}    [cache_key] - if provided, cache the redis client with the given cache_key
 *
 * @returns {Object}  RedisClient
 */
function createClient(opts, cache_key) {

    if ((typeof cache_key === 'string') && (redis_client_cache[cache_key] !== undefined)) {
        debug('using %s redis client', cache_key);
        return redis_client_cache[cache_key];
    }

    //use version of redis library passed by caller if provided
    opts.redis = opts.redis || redis;
    console.log( opts.options.port,opts.options.host,opts.options)
    // var client = opts.redis.createClient(
    //     opts.options.port,
    //     opts.options.host,
    // `redis[s]://[[username][:password]@][host][:port][/db-number]
    //     opts.options);
    var client = opts.redis.createClient({
        socket: {
            port: opts.options.port,
            host: opts.options.host
          }
        // url: 'redis://'+opts.options.host+':'+opts.options.port
    });
    //if errors like connection reset should not cause crash,
    client.on('error', errorlistener);

    if (typeof cache_key === 'string' && (redis_client_cache[cache_key] === undefined)) {
        debug('caching redis client %s', cache_key);
        redis_client_cache[cache_key] = client;
    }

    return client;
}

exports.createClient = createClient;
