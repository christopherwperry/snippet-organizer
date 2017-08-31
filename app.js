const express = require('express'),
    mustacheExpress = require('mustache-express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    Snippet = require('./models/snippet'),
    User = require('./models/user')
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    flash = require('express-flash-messages'),
    port = 3000,
    path = require('path'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

const app = express();

mongoose.connect('mongodb://localhost:27017/newdb', {useMongoClient: true});
mongoose.Promise = require('bluebird');

app.use(express.static(__dirname + '/public'));
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  secret: 'snippet snippet snippet',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', function (req, res) {
  res.render('new_snippet')
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/register', function (req, res) {
  res.render('register')
})

app.post('/new_snippet', function (req, res) {
  console.log(req.body)
})

app.listen(port, function(){
 console.log("The server is running on port 3000")
});
