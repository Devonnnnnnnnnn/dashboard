// Run with: node api.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'gotham_dashboard';

let db;
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true }).then(client => {
    db = client.db(DB_NAME);
    app.listen(3000, () => console.log('API running on port 3000'));
});

app.use(session({
    secret: 'gothamSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
    store: MongoStore.create({ mongoUrl: MONGO_URL, dbName: DB_NAME })
}));

// Signup
app.post('/api/signup', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    const exists = await db.collection('users').findOne({ username });
    if (exists) return res.status(409).json({ error: 'Username taken' });
    await db.collection('users').insertOne({ username });
    req.session.username = username;
    res.json({ username });
});

// Login
app.post('/api/login', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    const exists = await db.collection('users').findOne({ username });
    if (!exists) return res.status(404).json({ error: 'User not found' });
    req.session.username = username;
    res.json({ username });
});

// WhoAmI
app.get('/api/session', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});
