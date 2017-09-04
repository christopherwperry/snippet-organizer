const express = require('express'),
    mustacheExpress = require('mustache-express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    Snippet = require('./models/snippet'),
    models = require('./models/user')
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    flash = require('express-flash-messages'),
    port = 3000,
    path = require('path'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = models.User;

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

app.get('/', requireLogin, function (req, res) {

})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/register', function (req, res) {
  res.render('register')
})

app.post('/register', function (req, res) {
  req.checkBody('username', 'Username must be alphanumeric').isAlphanumeric();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  console.log(req.getValidationResult());
  req.getValidationResult()
      .then(function(result) {
          if (!result.isEmpty()) {
              return res.render("register", {
                  username: req.body.username,
                  errors: result.mapped()
              });
          }
          const user = new User({
              username: req.body.username,
              password: req.body.password
          })

          const error = user.validateSync();
          if (error) {
              return res.render("register", {
                  errors: normalizeMongooseErrors(error.errors)
              })
          }

          user.save(function(err) {
              if (err) {
                  return res.render("register", {
                      messages: {
                          error: ["That username is already taken."]
                      }
                  })
              }
              return res.redirect('/');
          })
      })
});

function normalizeMongooseErrors(errors) {
    Object.keys(errors).forEach(function(key) {
        errors[key].message = errors[key].msg;
        errors[key].param = errors[key].path;
    });
}

app.get('/logout/', function(req, res) {
    req.logout();
    res.redirect('/');
});

const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}

app.post('/new_snippet', function (req, res) {
  console.log(req.body)
})

app.listen(port, function(){
 console.log("The server is running on port 3000")
});
