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

mongoose.connect('mongodb://localhost:27017/snippet', {useMongoClient: true});
mongoose.Promise = require('bluebird');

app.use(express.static(__dirname + '/public'));
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.authenticate(username, password, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "Invalid username or password entered."
                })
            }
        })
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

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

const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}

const getSnippets = function (req, res, next) {
  const username = req.user.username;
  Snippet.find({author: username}).then(function (snippets) {
    req.snippets = snippets;
    next();
  })
}

app.get('/', requireLogin, getSnippets, function (req, res) {
  const user = req.user;
  const author = req.user.username;
  const snippets = req.snippets;
  res.render('index', {user: user, snippets: snippets})
})

app.get('/login', function (req, res) {
  res.render('login', {
    messages: res.locals.getMessages()
  })
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/',
    failureFlash: true
  }))

app.get('/register', function (req, res) {
  res.render('register')
})

app.post('/register', function (req, res) {
  req.checkBody('username', 'Username must contain only letters and numbers').isAlphanumeric();
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

app.get('/new_snippet', function (req, res) {
    user = req.user
    console.log(user);
    res.render('new_snippet', {user: user})
})

app.post('/new_snippet', function (req, res) {
    user = req.user
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    req.checkBody('language', 'Language is required').notEmpty();
    console.log(req.getValidationResult());
    req.getValidationResult()
        .then(function(result) {
            if (!result.isEmpty()) {
                console.log(errors);
                return res.render('new_snippet', {
                    user: user,
                    errors: result.mapped()
                });
            }
            const snippet = new Snippet({
                author: user.username,
                password: req.body.password,
                title: req.body.title,
                body: req.body.body,
                notes: req.body.notes,
                language: req.body.language,
                tags: req.body.tags
            })

            const error = snippet.validateSync();
            if (error) {
                return res.render('new_snippet', {
                    user: user,
                    errors: normalizeMongooseErrors(error.errors)
                })
            }

            snippet.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.render('new_snippet', {
                        messages: {
                            error: ["An error has occurred."]
                        }
                    })
                }
                return res.redirect('/');
            })
        })
    });

app.get('/:title', function (req, res) {
    user = req.user;
    username = req.user.username;
    snippet = req.params.title;
    Snippet.find({author: username, title: snippet}).then(function(snippet){
      res.render('snippet', {user: user, snippet: snippet})
  })
})

app.get('/:title/edit', function (req, res) {
    user = req.user;
    username = req.user.username;
    snippet = req.params.title;
    Snippet.findOne({author: username, title: snippet}).then(function(snippet){
      res.render('edit_snippet', {user: user, snippet})
  })
})

app.post('/:title/edit', function (req, res) {
    username = req.user.username;
    snippet = req.params.title;
    Snippet.findOne({author: username, title: snippet}).then(function (snippet){
      snippet.author = username;
      snippet.title = req.body.title;
      snippet.body = req.body.body;
      snippet.notes = req.body.notes;
      snippet.language = req.body.language;
      snippet.tags = req.body.tags;
      const error = snippet.validateSync();
      if (!error){
        snippet.save();
        res.redirect(`/${snippet.title}`)
      } else {
        console.log(error);
        res.render('edit_snippet', {user: user, snippet: snippet, errors: error.errors})
      }
  })
})

app.get('/:language', function (req, res) {
    language = req.params.language;

})

app.post('/:title/delete', function (req, res) {
    console.log(req.user);
    username = req.user.username;
    snippet = req.params.title;
    Snippet.remove({author: username, title: snippet}).then(function (snippet){
      res.redirect('/');
  })
})

app.listen(port, function(){
 console.log("The server is running on port 3000")
});
