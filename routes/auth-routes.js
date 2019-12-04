const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    res.redirect('/profile');
});
//fb login
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

	router.get('/facebook/redirect', 
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));


	// router.get('/logout', function(req, res){
	// 	req.logout();
	// 	res.redirect('/');
	// })

	//local login


/*router.get('/locallogin', function(req, res){
		res.render('locallogin.ejs', { message: req.flash('loginMessage') });
	});
	router.post('/locallogin', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/auth/locallogin',
		failureFlash: true
	}));

	router.get('/signup', function(req, res){
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});


	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/auth/signup',
		failureFlash: true
	}));*/
//oauthlocalstrategy
const users = [];

	router.get('/locallogin', (req, res) => {
  res.render('locallogin.ejs')
})

router.post('/locallogin', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/auth/locallogin',
  failureFlash: true
}))

router.get('/signup', (req, res) => {
  res.render('signup.ejs')
})

router.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      //id: Date.now().toString(),
      name: req.body.name,
      //email: req.body.email,
      password: hashedPassword
    })
    	/*var newUser = new User();
                        newUser.local.username = profile.id;
                        newUser.local.password = accessToken;

                      	newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });*/
                        

    res.redirect('/auth/locallogin')
  } catch {
    res.redirect('/auth/signup')
  }
});


/*router.get('/google/redirect',
  passport.authenticate('google'), // complete the authenticate using the google strategy
  (err, req, res, next) => { // custom error handler to catch any errors, such as TokenError
    if (err.name === 'TokenError') {
     res.redirect('/google'); // redirect them back to the login page
    } else {
     // Handle other errors here
    }
  },
  (req, res) => { // On success, redirect back to '/'
    res.redirect('/');
  }
);*/
module.exports = router;