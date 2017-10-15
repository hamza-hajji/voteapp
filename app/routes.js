var Poll = require('./models/poll');
var User = require('./models/user');
var {ObjectID} = require('mongodb');

module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    res.render('home', {
      title: !req.isAuthenticated() ? 'Home' : 'Dashboard',
      isAuthenticated: req.isAuthenticated(),
      user: req.user
    });
  });

  app.route('/login')
  .get(function(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.render('login', {
      message: req.flash('loginMessage'),
      title: 'Login',
      isLogin: true,
    });
  })
  .post(
    passport.authenticate('local-login', {
      successRedirect : '/',
      failureRedirect : '/login',
      failureFlash : true
  }));

  app.route('/signup')
  .get(function(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.render('signup', {
      message: req.flash('signupMessage'),
      title: 'Signup',
      isSignup: true,
    });
  })
  .post(
      passport.authenticate('local-signup', {
      successRedirect : '/',
      failureRedirect : '/signup',
      failureFlash : true
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.route('/new')
    .get(isLoggedIn, function (req, res) {
      res.render('createPoll', {
        title: 'Create Poll',
        isAuthenticated: req.isAuthenticated(),
        message: req.flash('newPollMessage')
      });
    })
    .post(isLoggedIn, function (req, res) {
      if (req.body.name && req.body.options) {
        var newPoll = new Poll({
          name: req.body.name,
          options: req.body.options,
          owner: (new ObjectID(req.user._id)).toHexString()
        });

        newPoll.save().then(function() {
          res.redirect('/');
        }).catch(function(e) {
          req.flash('newPollMessage', 'Something went wrong.')
          res.redirect('/new');
        });
      } else {
        req.flash('newPollMessage', 'Name and options must be provided.')
        res.redirect('/new');
      }
    });

  app.get('/:username/polls/:id', function(req, res) {
    User.findOne({
      'local.username': req.params.username
    }, function(err, user) {
      if (err || !user) return res.redirect('/');

      Poll.findOne({
        _id: (new ObjectID(req.params.id)).toHexString(),
        owner: (new ObjectID(user._id)).toHexString()
      }, function(err, poll) {
        if (err || !poll) return res.redirect('/')

        res.render('showPoll', {
          poll: poll
        })
      });
    });
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}