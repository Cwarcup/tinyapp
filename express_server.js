const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

// add in EJS middleware
app.set('view engine', 'ejs');

// use middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//////////////// data /////////////////////
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
  cw: {
    id: 'cw',
    email: 'cw@email.com',
    password: 'cw',
  }
};
//////////// helper functions //////////////
// generate random string
const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(7);
  return randomString;
};

// user lookup helper function, checks email and password
const userLookup = (email, password) => {
  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        return users[user];
      }
    }
  }
  return null;
};

// check if browser has cookie with user id
const checkCookie = (req) => {
  if (req.cookies.user_id) {
    return users[req.cookies.user_id];
  }
  return null;
};

//////////   GET ROUTES   //////////
// GET for /register
app.get('/register', (req, res) => {
  // if user is logged in and tries to access register page, redirect to /urls
  if (checkCookie(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    email: undefined
  };
  // if user is not logged in, render register page
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  // if user is logged in and tries to access login page, redirect to /urls
  if (checkCookie(req)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    email: undefined,
    message: 'Please log in to create a new URL.'
  };
  res.render('login', templateVars);
});

// redirect user to long URL if it exists
app.get('/u/:id',(req, res) => {
  // check if long URL exists
  const longURL = urlDatabase[req.params.id];
  // if it does, sent user to long URL
  if (longURL) {
    res.redirect(longURL);
  }
  // if it doesn't, send user to error page
  const templateVars = {
    id: req.params.id,
    email: undefined
  };
  res.status(404).render('urls_notFound', templateVars);
  
});

// route to create a new short URL
app.get('/urls/new', (req, res) => {
  // if user is logged in, pass data with users object
  if (checkCookie(req)) {
    const templateVars = {
      urls: urlDatabase,
      email: users[req.cookies.user_id].email
    };
    res.render('urls_new', templateVars);
  }
  // if user is not logged in, redirect to login page
  res.redirect('/login');
});

// handle route parameters
app.get('/urls/:id', (req, res) => {
  // data to pass to the ejs file
  // must be logged in and valid short URL
  if (checkCookie(req) && urlDatabase[req.params.id]) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      urls: urlDatabase,
      email: users[req.cookies.user_id].email
    };
    return res.render('urls_show', templateVars);
  }

  // user tries to access short URL that does NOT exist
  if (!urlDatabase[req.params.id]) {
    const templateVars = {
      id: req.params.id,
      email: undefined
    };
    res.status(404).render('urls_notFound', templateVars);
  }

  console.log(req.params.id);
  // if user is not logged in, redirect to login page
  return res.redirect('/urls');
});

// route to render "/urls" page
app.get('/urls', (req, res) => {
  // if user is logged in, pass data with users object
  if (checkCookie(req)) {
    const templateVars = {
      urls: urlDatabase,
      email: users[req.cookies.user_id].email,
      message: undefined
    };
    // render page with data from users object
    return res.render('urls_index', templateVars);
  }
  
  // if user is not logged in, redirect to login page
  const templateVars = {
    urls: urlDatabase,
    email: undefined,
    message: 'You must be logged in to create, edit, or delete a URL.'
  };
  return res.render('urls_index', templateVars);
});

// home page route
app.get('/', (req, res) => {
  res.redirect('/urls');
});

///////////////// POST routes ///////////////

// REGISTER POST route
app.post('/register', (req, res) => {
  // check if email is empty string, 404 error
  if (req.body.email === '') {
    console.log('email is empty: ', req.body.email);
    return res.status(400).redirect('/register');
  }

  // check if email is already in use
  if (userLookup(req.body.email)) {
    console.log('email is already in use: ', req.body.email);
    return res.status(400).redirect('/register');
  }

  // create new user object (userId, email, password)
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };
  // add newUser to users database
  users[newUser.id] = newUser;
  // set cookie for new user using newUser.id
  res.cookie('user_id', newUser.id);
  res.redirect('/urls');
});

// LOGIN POST route
app.post('/login', (req, res) => {
  // iterate through users database to see if email matches
  if (userLookup(req.body.email, req.body.password)) {
    // if email & password match, set cookie for user
    res.cookie('user_id', userLookup(req.body.email, req.body.password).id);
    // send user to /urls
    return res.redirect('/urls');
  }
  // if user with email can not be found, respond with 403
  if (!userLookup(req.body.email, req.body.password)) {
    console.log(`email ${req.body.email} NOT found`);
    return res.status(403).redirect('/login');
  }
});

// LOGOUT POST route
app.post('/logout', (req, res) => {
  // remove the cookie using the cookie name
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// URLS homepage POST route
// POST method to receive the form data from urls_new
app.post('/urls', (req, res) => {
  // if user is not logged in, redirect to login page
  if (checkCookie(req)) {
    const shortURL = generateRandomString();
    // add new shortURL to urlDatabase
    urlDatabase[shortURL] = req.body.longURL;
    // redirect to new shortURL page
    // gets sent to the GET '/urls/:id'
    console.log('post req');
    res.redirect('/urls');
  }
  res.send('user is not logged in').redirect('/login');

});

// DELETE POST route - delete a URL from the database
app.post('/urls/:id/delete', (req, res) => {
  // if user is logged in
  if (checkCookie(req)) {
    // delete shortURL from urlDatabase
    delete urlDatabase[req.params.id];
    console.log(`${req.params.id} has been deleted`);
    // redirect to urls_index page
    res.redirect('/urls');
  }
  // if user is not logged in, redirect to login page
  res.redirect('/urls');
});

// UPDATE POST route to handle updates to long URL
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