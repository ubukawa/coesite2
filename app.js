require('dotenv').config()

//for Server fnction
const session = require('express-session')
const flash = require('connect-flash')
const msal = require('@azure/msal-node')
var createError = require('http-errors')
const express = require('express')
const path = require('path')
var cookieParser = require('cookie-parser')
const morgan = require('morgan')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const spdy = require('spdy') //for https

//for File processing
const config = require('config')
const fs = require('fs')
const cors = require('cors')


// config constants
const morganFormat = config.get('morganFormat')
const logDirPath = config.get('logDirPath')
const port = config.get('port')
const privkeyPath = config.get('privkeyPath')
const fullchainPath = config.get('fullchainPath')

const htdocsPath = config.get('htdocsPath')
const defaultZ = config.get('defaultZ')
const mbtilesDir = config.get('mbtilesDir')



// logger configuration
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: `${logDirPath}/coesite-%DATE%.log`,
            datePattern: 'YYYY-MM-DD'
        })
    ]
})

logger.stream = {
    write: (message) => { logger.info(message.trim()) }
}
// logger until here

var authRouter = require('./routes/auth') //before app
const app = express()

//(before indexRouter) from here
// In-memory storage of logged-in users
// For demo purposes only, production apps should store
// this in a reliable storage
app.locals.users = {};

// MSAL config
const msalConfig = {
    auth: {
        clientId: process.env.OAUTH_APP_ID,
        authority: process.env.OAUTH_AUTHORITY,
        clientSecret: process.env.OAUTH_APP_SECRET
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
};

// Create msal application object
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);
//(before indexRouter) until here


var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var mapRouter = require('./routes/map') //test 0104
var VTRouter = require('./routes/VT') //test 0308
var VTORouter = require('./routes/VT-open') //test 0322

// Session middleware
// NOTE: Uses default in-memory session store, which is not
// suitable for production
app.use(session({
    secret: process.env.OAUTH_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy'
}))
// note: session will be replaceid with mysql

// Flash middleware
app.use(flash())

// Set up local vars for template layout
app.use(function (req, res, next) {
    // Read any flashed errors and save
    // in the response locals
    res.locals.error = req.flash('error_msg')

    // Check for simple error string and
    // convert to layout's expected format
    var errs = req.flash('error')
    for (var i in errs) {
        res.locals.error.push({ message: 'An error occurred', debug: errs[i] })
    }

    // Check for an authenticated user and load
    // into response locals
    if (req.session.userId) {
        res.locals.user = app.locals.users[req.session.userId]
    }

    next()
})


// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(morgan(morganFormat, {
    stream: logger.stream
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

//app.use(express.static(path.join(__dirname, htdocsPath)))
app.use('/unvt', express.static(path.join(__dirname, htdocsPath)))
app.use('/unvt/', indexRouter)
app.use('/unvt/auth', authRouter) //after app.use('/', indexRouter)
app.use('/unvt/users', usersRouter)
app.use('/unvt/map', mapRouter)
app.use('/unvt/VT', VTRouter)
app.use('/unvt/VT-open', VTORouter)

// error handler
app.use((req, res) => {
    res.sendStatus(404)
})

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

//for https
spdy.createServer({
    key: fs.readFileSync(privkeyPath),
   cert: fs.readFileSync(fullchainPath)
}, app).listen(port)

//for http
//app.listen(port, () => {
//    console.log(`Running at Port ${port} ...`)
//app.listen(3000, () => {
//console.log("running at port 3000 ...")
//})