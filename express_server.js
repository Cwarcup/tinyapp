const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// add in EJS middleware
app.set('view engine', 'ejs');

// use middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//////////////// data /////////////////////
// URL database
const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'userRandomID',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'cw',
  },
  lgLjZx: {
    longURL: 'https://www.yahoo.ca',
    userID: 'user2RandomID',
  },
  kjbk: {
    longURL: 'https://www.facebook.com',
    userID: 'cw',
  },
  sdfs: {
    longURL: 'https://www.facebook.com/sdfsad',
    userID: 'cw',
  },
  sgq3y6: {
    longURL: 'https://www.google.com/images',
    userID: 'a',
  }

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
    const enteredEmail = users[user].email;
    const enteredPassword = users[user].password;

    if (enteredEmail === email && enteredPassword === password) {
      return users[user];
    }
  }
  return null;
};

// check if browser has cookie with user id
const checkCookie = (req) => {
  const cookie = req.cookies.user_id;
  if (cookie) {
    return users[cookie];
  }
  return null;
};

// filter URLdatabase and return only URLs that belong to user
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userUrls;
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
    email: undefined,
    message: undefined,
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
    message: undefined
  };
  res.render('login', templateVars);
});

// redirect user to long URL if it exists
app.get('/u/:id',(req, res) => {
  // check if URL exists
  const urlFound = urlDatabase[req.params.id];
  // if URL does not exist, it will be undefined
  if (urlFound === undefined) {
    const templateVars = {
      id: req.params.id,
      email: undefined,
      message: undefined
    };
    // render the generic error page
    return res.status(404).render('urls_notFound', templateVars);
  }
  // if it does, sent user to long URL
  res.redirect(urlFound.longURL);
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

// GET for editing a URL
app.get('/urls/:id', (req, res) => {
  // check to see if user is logged in/has cookie
  const cookie = checkCookie(req);
  //if user is not logged in
  if (!cookie) {
    // redirect to login page
    const templateVars = {
      id: req.params.id,
      email: undefined,
      message: 'You must be logged in to view this page'
    };
    return res.status(401).render('login', templateVars);
  }
  // if user is not logged in OR URL does not exist, OR URL does
  if (!urlDatabase[req.params.id] || urlDatabase[req.params.id].userID !== cookie.id) {
    const templateVars = {
      id: req.params.id,
      email: undefined,
      message: 'URL does not exist or you do not have access to edit it.'
    };
    res.status(404).render('urls_notFound', templateVars);
  }

  // check that short URL exists and userID in urlDatabase matches cookie id
  const templateVars = {
    id: req.params.id,
    longURL: urlsForUser(cookie.id, urlDatabase)[req.params.id],
    email: cookie.email,
  };
  res.render('urls_show', templateVars);
});

// route to render "/urls" page
app.get('/urls', (req, res) => {
  if (!checkCookie(req)) {
    // if user is not logged in, redirect to login page
    const templateVars = {
      isLoggedIn: false,
      urls: urlDatabase,
      email: undefined,
      message: 'You must be logged in to view URLs. Please log in or register.'
    };
    return res.render('urls_index', templateVars);
  }

  //get URLs for specific user
  const userUrls = urlsForUser(req.cookies.user_id, urlDatabase);

  // if user is logged in, pass data with users object
  const templateVars = {
    isLoggedIn: true,
    urls: userUrls,
    email: users[req.cookies.user_id].email,
  };
  // render page with data from users object
  return res.render('urls_index', templateVars);
  
});

// home page route
app.get('/', (req, res) => {
  // if user is logged in, pass data with users object
  if (checkCookie(req)) {
    const userUrls = urlsForUser(req.cookies.user_id, urlDatabase);

    const templateVars = {
      isLoggedIn: true,
      urls: userUrls,
      email: users[req.cookies.user_id].email,
      message: undefined,
    };
    // render page with data from users object
    return res.render('urls_index', templateVars);
  }
  // if user is not logged in, redirect to login page
  res.redirect('/login');
});

///////////////// POST routes ///////////////

// REGISTER POST route
app.post('/register', (req, res) => {
  // check if email is empty string, 404 error
  if (req.body.email === '') {
    console.log('email is empty: ', req.body.email);
    const templateVars = {
      email: undefined,
      message: 'Email cannot be empty. Please enter a valid email.'
    };
    return res.status(400).render('register', templateVars);
  }

  // check if email is already in use
  if (!userLookup(req.body.email)) {
    console.log('email is already in use: ', req.body.email);
    const templateVars = {
      email: undefined,
      message: 'email is already in use. Please enter a different email.'
    };
    return res.status(400).render('register', templateVars);
  }

  // create new user object (userId, email, password)
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: hashedPassword
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
  const templateVars = {
    message: 'Email or password is incorrect. Try again.',
    email: undefined,
  };
  // if user with email can not be found, respond with 403
  console.log(`email ${req.body.email} NOT found`);
  return res.status(403).render('login', templateVars);
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
  if (!checkCookie(req)) {
    // if user is not logged in, redirect to login page
    return res.send('user is not logged in').redirect('/login');
  }
  const shortURL = generateRandomString();
  console.log('long URL: ', req.body.longURL);
  // add new shortURL to urlDatabase
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  // redirect to new shortURL page
  res.redirect('/urls');
});

// DELETE POST route - delete a URL from the database
app.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    // if short URL does not exist, redirect to urls_index page
    console.log('short URL does not exist');
    return res.status(404).redirect('/urls');
  }
  // if user is not logged in, redirect to login page
  if (!checkCookie(req)) {
    console.log('Please log in to delete a URL.');
    return res.status(403).redirect('/login');
  }

  // check if user has access to delete URL (own the URL)
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    console.log('You do not have access to delete this URL.');
    return res.status(403).redirect('/urls');
  }

  // delete shortURL from urlDatabase
  delete urlDatabase[req.params.id];
  // redirect to urls_index page
  return res.redirect('/urls');

});

// EDIT POST route to handle updates to long URL
app.post('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    // if short URL does not exist, redirect to urls_index page
    console.log('URL does not exist.');
    return res.status(404).redirect('/urls');
  }
  // check if user logged in / has cookie
  if (!checkCookie(req)) {
    // if user is not logged in, redirect to login page
    console.log('Please log in to edit a URL.');
    return res.status(401).redirect('/login');
  }
  // check if user has access to edit URL (own the URL)
  if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    console.log('You do not have access to edit this URL.');
    return res.status(403).redirect('/urls');
  }
  res.redirect(`/urls/${req.params.id}`);
});

// UPDATE POST route to handle updates to long URL
// accessible from /urls/:id page, update btn
app.post('/urls/:id/update', (req, res) => {
  // check if user logged in / has cookie
  if (!checkCookie(req)) {
    // if user is not logged in, redirect to login page
    return res.status(401).redirect('/login');
  }
  // update longURL in urlDatabase
  urlDatabase[req.params.id].longURL = req.body.longURL;
  // redirect to urls_index page
  res.redirect(`/urls/${req.params.id}`);
});


///////////// setup the server //////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});