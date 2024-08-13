import session from 'express-session';
import RedisStore from 'connect-redis';
import redis from 'redis';
import chalk from 'chalk';

// redis configuration
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
    const message = 'Succees connected to Redis';
    const redisMsg = chalk.bgYellow.bold.green(message);
    console.log(redisMsg);
});

redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});

await redisClient.connect();

// session configuration
const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.REDIS_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 5, // Session in 5 minutes
    },
});

const redisConf = {
    redisClient,
    sessionMiddleware,
}

export default redisConf;