const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// add in EJS middlware
app.set('view engine', 'ejs');

// use middwares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// URL database
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// user database
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

// 1. register - route working
// 2. create new object in the users object - post request
// "login" - checks the users object for a matching email
// if matches -> great -> create cookie, redirect home
// if not, redirect to register page

// generate random string
const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(7);
  return randomString;
};

//////////   GET ROUTES   //////////
// GET for /register
app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };

  if (users[req.cookies.user_id]) {
    templateVars.email = users[req.cookies.user_id].email;
  } else {
    templateVars.email = undefined;
    res.render('register', templateVars);
  }
});

// redirect user to long URL if it exists
app.get('/u/:id',(req, res) => {
  // check if long URL exists
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).redirect('https://http.cat/404');
  }
});

// route to create a new short URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// handle route parameters
app.get('/urls/:id', (req, res) => {
  // data to pass to the ejs file
  let templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

// route to render "/urls" page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };

  if (users[req.cookies.user_id]) {
    templateVars.email = users[req.cookies.user_id].email;
    res.render('urls_index', templateVars);
  } else {
    templateVars.email = undefined;
    res.render('urls_index', templateVars);
  }
});

// home page route
app.get('/', (req, res) => {
  res.redirect('/urls');
});

///////////////// POST routes ///////////////

// POST route for /register
app.post('/register', (req, res) => {
  // create new user object (userId, email, password)
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };
  // add newUser to users database
  users[newUser.id] = newUser;

  // console.log('users database: ', users); // works!
  // console.log("new user's id: ", newUser.id); //works!

  // set cookie for new user
  res.cookie('user_id', newUser.id);

  res.redirect('/urls');
});

// post method to /login
app.post('/login', (req, res) => {
  // get the email from login form
  const email = users[req.body.email];
  // iterate through users database to see if email matches
  for (let user in users) {
    if (users[user].email === req.body.email) {
      // if email matches, set cookie for user
      res.cookie('user_id', users[user].id);
      console.log('users database: ', users);
      res.redirect('/urls');
    }
  }
  // if email doesn't match, redirect to register page
  console.log('users database: NO MATCH', users);

  res.redirect('/register');
});

// logout endpoint
app.post('/logout', (req, res) => {
  // remove the cookie using the cookie name
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// POST method to receive the form data from urls_new
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  // add new shortURL to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  // redirect to new shortURL page
  // gets sent to the GET '/urls/:id'
  res.redirect(`/u/${shortURL}`);
});

// POST method to handle deleted URLs
app.post('/urls/:id/delete', (req, res) => {
  // delete shortURL from urlDatabase
  delete urlDatabase[req.params.id];
  console.log(`${req.params.id} has been deleted`);
  // redirect to urls_index page
  res.redirect('/urls');
});

// POST method to handle updates to long URL
app.post('/urls/:id/update', (req, res) => {
  // update longURL in urlDatabase
  urlDatabase[req.params.id] = req.body.longURL;
  // redirect to urls_index page
  res.redirect(`/urls/${req.params.id}`);
});


///////////// setup the server //////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});