const express = require('express');
const app = express();

const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const SqlQuery = require('./utils/sqlQuery');
sqlQuery = new SqlQuery();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('\x1B[34m:status \x1B[39m::remote-addr :method :url :res[content-length] \x1B[36m:response-time ms \x1B[39m:date[iso]'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname + '/public/images'));

//路由
app.use('/', function (req, res, next) {
    if (req.url == '/') return res.redirect(301, 'https://boevr.cn/index');
    next();
});
app.use('/index', require('./routes/index'));
app.use('/myopia', require('./routes/myopia'));
app.use('/device', require('./routes/device'));
app.use('/children', require('./routes/children'));
app.use('/user', require('./routes/user'));
app.use('/test', require('./routes/test'));
app.use('/ctrl', require('./routes/ctrl'));
app.use('/logsTrain', require('./routes/logsTrain'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;