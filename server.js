
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var hbs          = require('express-handlebars');
var path         = require('path');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.engine('hbs', hbs({
  extname: 'hbs',
  partialsDir: path.join(__dirname, '/app/views/partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/app/views'));

app.use(express.static('public'));

// initialize passport
app.use(session({ secret: 'voteappsecret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('The magic happens on port ' + port);