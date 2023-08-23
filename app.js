require('dotenv').config();
const express = require('express');
const Redis = require('./lib/redis');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const redis = new Redis();
const helmet = require('helmet');
const path = require('path');
const flash = require('flash');
const Logger = require('./lib/logger');
const expressLayouts = require('express-ejs-layouts');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
var serviceAccount = require("./404/tronixcoin-huber.json");

initializeApp({credential: cert(serviceAccount)});
Logger.init({dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0});
// Config
const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(path.join(__dirname, '/public')));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true)
app.set("layout extractStyles", true)
app.set("layout extractMetas", true)
app.enable('trust proxy');

app.set('view engine', 'ejs');

app.use(expressSession({
    store: new RedisStore({
        client: redis.get_connection()
    }),
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
}));


app.use(flash());

if (process.env.SENTRY_DSN) {
    app.use(Logger.Handlers.errorHandler());
}

module.exports = app;