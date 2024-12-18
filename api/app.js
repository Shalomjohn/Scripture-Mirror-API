const express = require('express');
const dotenv = require('dotenv');
const morgan = require("morgan")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const accountRoutes = require('./routes/accountRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Database connection
const uri = process.env.DATABASE_URL;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('open', () => {
    console.log('Database Connected');
})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET',
        );
        return res.status(200).json({})
    }
    next();
});


// Routes
app.use('/api/accounts', accountRoutes);


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