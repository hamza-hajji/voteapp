var Poll = require('./models/poll');
var User = require('./models/user');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

module.exports = function(app, apiRoutes, passport) {
  app.get('/', function(req, res) {
    res.render('home', {
      title: !req.isAuthenticated() ? 'Home' : 'Dashboard',
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      message: req.flash('deletePollMessage')
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
          res.redirect(`/myPolls`);
        }).catch(function(e) {
          req.flash('newPollMessage', 'Something went wrong.')
          res.redirect('/new');
        });
      } else {
        req.flash('newPollMessage', 'Name and options must be provided.')
        res.redirect('/new');
      }
    });

  app.get('/polls', function (req, res) {
    res.render('showAllPolls', {
      isAuthenticated: req.isAuthenticated(),
      title: 'All Polls'
    });
  });

  app.get('/myPolls', isLoggedIn, function (req, res) {
    res.render('showMyPolls', {
      title: 'My Polls',
      isAuthenticated: req.isAuthenticated()
    });
  });

  app.get('/polls/:id', function(req, res) {
    res.render('showPoll', {
      title: 'Show Poll',
      isAuthenticated: req.isAuthenticated()
    });
  });

  apiRoutes.get('/polls/:id', function(req, res) {
    if (req.params.id) {
      Poll.findById(req.params.id, function(err, poll) {
        if (err) return res.json({});
        if (!poll) return res.status(404).json({});

        User.findById(poll.owner, function (err, user) {
          if (err || !user) return res.json({});
          res.json({
            poll: {
              id: poll.id,
              user: user.local.username,
              name: poll.name,
              options: poll.options.map(function(option) { return _.pick(option, ['name' , 'votes']) })
            } // to avoid showing ids in responses
          });
        });
      });
    } else {

    }
  });

  apiRoutes.get('/polls', function(req, res) {
    Poll.find({})
      .exec()
      .then(function(polls) {
        if (!polls) return res.json({});

        Promise.all(polls.map(function (poll) {
          return User.findById(poll.owner)
                  .exec()
                  .then(function (user) {
                    return {
                      id: poll.id,
                      user: user.local.username,
                      name: poll.name,
                      options: poll.options.map(function(option) { return _.pick(option, ['name' , 'votes']) })
                    }
                  });
        })).then(function (polls) {
          res.json({polls});
        })
      });
  });

  apiRoutes.get('/mypolls', isLoggedIn, function(req, res) {
    Poll.find({})
      .exec()
      .then(function(polls) {
        if (!polls) return res.json({});

        Promise.all(polls.map(function (poll) {
          return User.findById(poll.owner)
                  .exec()
                  .then(function (user) {
                    return {
                      id: poll.id,
                      user: user.local.username,
                      name: poll.name,
                      options: poll.options.map(function(option) { return _.pick(option, ['name' , 'votes']) })
                    }
                  });
        })).then(function (polls) {
          res.json({
            polls: polls.filter(function (poll) {
              return poll.user === req.user.local.username;
            })
          });
        })
      });
  });

  apiRoutes.post('/polls/:id/vote/:option', function (req, res) {
    if (req.params.id && req.params.option) {
      Poll
        .findOneAndUpdate({
          _id: (new ObjectID(req.params.id)).toHexString(),
          "options.name": req.params.option
        }, {
          $inc: {
            'options.$.votes': 1
          }
        })
        .exec()
        .then(function (poll) {
          res.json({
            message: 'successfully voted',
            poll: poll
          })
        });
    } else {
      res.json({});
    }
  });

  apiRoutes.delete('/polls/:name', isLoggedIn, function (req, res) {
    Poll
      .findOneAndRemove({
        name: req.params.name,
        owner: (new ObjectID(req.user._id)).toHexString()
      })
      .exec()
      .then(function (poll) {
        if (!poll) {
          req.flash('deletePollMessage', 'Poll doesn\'t exist');
          req.redirect('/');
        }

        res.json({message: 'Poll deleted!'});
      });
  });

};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}