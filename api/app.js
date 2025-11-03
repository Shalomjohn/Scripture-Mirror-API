const express = require('express');
const dotenv = require('dotenv');
const morgan = require("morgan")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const accountRoutes = require('./routes/accountRoutes');
const dailyScriptureRoutes = require('./routes/dailyScriptureRoutes');
const characterMatchRoutes = require('./routes/characterMatchRoutes');
const dailyBibleQuizRoutes = require('./routes/dailyBibleQuizRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reflectionRoutes = require('./routes/reflectionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { seedCharacters } = require('./helpers/set_characters');
const { seedQuizData } = require('./controllers/characterQuizController');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Behind proxies (Vercel/NGINX), trust X-Forwarded-For for accurate req.ip
app.set('trust proxy', true);

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS
const allowedOrigins = [
    'https://scripture-mirror-admin.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001' 
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
    credentials: true
}));


// Database connection
const uri = process.env.DATABASE_URL;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('open', () => {
    console.log('Database Connected');
    seedCharacters();
    seedQuizData();
})

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/daily-scripture', dailyScriptureRoutes);
app.use('/api/character-match', characterMatchRoutes);
app.use('/api/daily-quiz', dailyBibleQuizRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);


// Fallback
app.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Welcome to the Scripture Mirror API. Work in progress...'
    })
})

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})


module.exports = app;
