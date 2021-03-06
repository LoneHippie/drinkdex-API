const express = require('express');

//middleware packages
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet'); //temporarily disabled, stops static serve of build folder
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');

//error handling modules
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

//router imports
const drinkRouter = require('./routes/drinkRoutes');
const userRouter = require('./routes/userRoutes');
const imageRouter = require('./routes/imageRoutes');

//start express app
const app = express();

//////////MIDDLEWARES

//GLOBAL MIDDLEWARES

//Security HTTP headers
// app.use(helmet());

app.enable('trust proxy');

//enable cors for same origin
app.use(cors());

//server response for pre-flight phase requests (cookies, delete, put, etc)
app.options('*', cors());

//get cookies
app.use(cookieParser());

//STATIC FILE SERVING

//lets static files be accessed through images/ of uploads/ in frontend
app.use('/images', express.static('images'));

//allows static serve of build folder
// app.use(express.static(path.join(__dirname, 'build')));


//dev/prod options toggle
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); //3rd party npm package for logging route, status code, ms for callback and size in bytes
};

//limit reqs from unique IPs
const limiter = rateLimit({ //limits req per IP to 100 per hour
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests recieved from this IP, please try again in 1 hour'
});
//apply limiter to all routes that start with /api
app.use('/api', limiter);

//will log cookies in dev mode
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(req.cookies.jwt);
    }
    next();
});

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //important: this line lets everything be returned properly as JSON

//data sanitization against NoSQL data injection
app.use(mongoSanitize());

//data santization against XSS (cross site scripting attacks)
app.use(xss());

//prevent param pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQuality', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

//////////ROUTERS

//router mounting parent route/url
app.use('/api/v1/drinks', drinkRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/images', imageRouter);

//serve static client
// app.use('*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

//middleware for handling all undefined routes. Returns proper JSON formatted error to user
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

//enable custom global error messages and handlers
app.use(globalErrorHandler);

//////////EXPORT

module.exports = app;