module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    res.render('home', {
      title: !req.isAuthenticated() ? 'Home' : 'Dashboard',
      isAuthenticated: req.isAuthenticated()
    }); 
  });

  app.route('/login')
  .get(function(req, res) {
    res.render('login', {
      message: req.flash('loginMessage'),
      title: 'Login',
      isLogin: true,
    });
  })
  .post(passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
  }));

  app.route('/signup')
  .get(function(req, res) {
    res.render('signup', {
      message: req.flash('signupMessage'),
      title: 'Signup',
      isSignup: true,
    });
  })
  .post(passport.authenticate('local-signup', {
    successRedirect : '/',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}