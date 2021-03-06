const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

// add in EJS middleware
app.set('view engine', 'ejs');

// use middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],
}));
app.use(methodOverride('_method'));

const urlDatabase = {
  'abcd': {
    longURL: 'https://stackoverflow.com/questions/2281087/center-a-div-in-css',
    userID: 'test',
    uniqueVisits: 13,
    totalVisits: 22,
    recentVisits: [ { 'timestamp': '2022-07-17T21:13:22.608Z', 'ip': '104.31.2.164' } ]
  },
  'efgh': {
    longURL: 'https://www.google.com/',
    userID: 'test',
    uniqueVisits: 230,
    totalVisits: 950,
    recentVisits: [ { 'timestamp': new Date('2022-07-17T21:13:22.608Z'), 'ip': '171.123.159.25' }, {'timestamp': new Date('2022-07-17T21:23:06.150Z'), 'ip': '217.238.248.228'} ]
  },
  'ijkl': {
    longURL: 'https://github.com/',
    userID: 'test',
    uniqueVisits: 67,
    totalVisits: 245,
    recentVisits: [ { 'timestamp': new Date('2022-06-03T11:13:22.608Z'), 'ip': '107.77.194.36' }, {'timestamp': new Date('2022-07-17T21:23:06.150Z'), 'ip': '71.239.213.177'} ]
  }
};

const users = {
  'test': {
    id: 'test',
    email: 'test@email.com',
    password: '$2a$10$EJxCbYwb/Q0dQzGRPOWBP.oKzgpqvvWE3jWTrKo0h2tY72ht.K0ry'
  }
};

const { generateRandomString, getUserByEmail, checkCookie, urlsForUser } = require('./helpers');

////////////////////////////////// GET routes ////////////////////////////////

// GET for /register
app.get('/register', (req, res) => {
  // if user is logged in and tries to access register page, redirect to /urls
  if (checkCookie(req, users)) {
    return res.redirect('/urls');
  }

  // if user is not logged in, render register page
  const templateVars = {
    urls: urlDatabase,
    email: undefined,
    errorMessage: undefined,
  };
  return res.render('register', templateVars);
});

// GET /login
app.get('/login', (req, res) => {
  // if user is logged in and tries to access login page, redirect to /urls
  if (checkCookie(req, users)) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urls: urlDatabase,
    email: undefined,
    errorMessage: undefined
  };
  return res.render('login', templateVars);
});

// GET urls/analytics/:id
app.get('/analytics/:id', (req, res) => {
  // if user is not logged in, redirect to /login
  if (!checkCookie(req, users)) {
    return res.redirect('/login');
  }
  // if user is logged in, but does not own the shortURL, redirect to /urls
  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.redirect('/urls');
  }
  // if user is logged in and owns the shortURL, render analytics page
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);

  const templateVars = {
    urls: userURLs[req.params.id],
    shortURL: req.params.id,
    user: users[userID],
    email: users[userID].email,
    errorMessage: undefined
  };
  return res.render('urls_analytics', templateVars);
});

// GET /u/:id
app.get('/u/:id',(req, res) => {
  const urlFound = urlDatabase[req.params.id];

  // if URL does not exist, it will be undefined
  if (urlFound === undefined) {
    const templateVars = {
      id: req.params.id,
      email: undefined,
      errorMessage: 'URL not found'
    };
    return res.status(404).render('urls_notFound', templateVars);
  }

  // create a cookie for a unique id / shortURL
  const id = req.params.id;
  if (!req.session.id) {
    req.session.id = id;
    urlDatabase[id].uniqueVisits++;
  }

  // increment the totalVisits for the in UrlDatabase
  urlDatabase[id].totalVisits++;

  // update the recentVisits array in the UrlDatabase
  const userAccessed = {
    timestamp: new Date(),
    ip: req.ip
  };
  urlDatabase[id].recentVisits.push(userAccessed);

  //  if it does, sent user to long URL
  return res.redirect(urlFound.longURL);
});

// GET /urls/new
app.get('/urls/new', (req, res) => {
  // if user is logged in, pass data with users object
  if (checkCookie(req, users)) {
    const templateVars = {
      urls: urlDatabase,
      email: users[req.session.userID].email
    };
    return res.render('urls_new', templateVars);
  }
  // if user is not logged in, redirect to login page
  return res.redirect('/login');
});

// GET /urls/:id
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  // check for valid URL ID
  if (!urlDatabase[id]) {
    const templateVars = {
      id: id,
      email: undefined,
      errorMessage: 'URL does not exist or you do not have access to edit it.'
    };
    return res.status(404).render('urls_notFound', templateVars);
  }

  //if user is not logged in
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (!userID || !userUrls[id]) {
    // redirect to login page
    const templateVars = {
      id: id,
      email: undefined,
      errorMessage: 'You must be logged in to view this page'
    };
    return res.status(401).render('login', templateVars);
  }

  const templateVars = {
    id: id,
    longURL: userUrls[req.params.id].longURL,
    email: users[userID].email
  };
  return res.render('urls_show', templateVars);
});

// GET /urls - shows all URLs for logged in user
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);

  if (!userID || users[req.session.userID] === undefined) {
    const templateVars = { errorMessage: 'please log in'};
    return res.status(401).render('urls_notFound', templateVars);
  }
  
  // if user is logged in, pass data with users object
  const templateVars = {
    urls: userURLs,
    email: users[req.session.userID].email,
  };
  return res.render('urls_index', templateVars);
});

// GET / home page
app.get('/', (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});


////////////////////////////////// POST routes ////////////////////////////////

// REGISTER POST route
app.post('/register', (req, res) => {

  // check if email is empty string, 404 error
  if (req.body.email === '') {
    const templateVars = {
      email: undefined,
      errorMessage: 'Email cannot be empty. Please enter a valid email.'
    };
    return res.status(400).render('register', templateVars);
  }

  // check if email is already in use
  if (getUserByEmail(req.body.email, users)) {
    const templateVars = {
      email: undefined,
      errorMessage: 'Email is already in use. Please enter a different email.'
    };
    return res.status(400).render('register', templateVars);
  }

  // create new user object (userId, email, password)
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };

  // add newUser to users database
  users[newUser.id] = newUser;
  // set cookie for new user using newUser.id
  req.session.userID = userID;
  res.redirect('/urls');
});

// POST /login
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // if email & password match, set cookie for user
    req.session.userID = user.id;
    // send user to /urls
    return res.redirect('/urls');
  }

  const templateVars = {
    errorMessage: 'Email or password is incorrect. Try again.',
    email: undefined,
  };
  // if user with email can not be found, respond with 403
  return res.status(403).render('login', templateVars);
});

// POST /logout
app.post('/logout', (req, res) => {
  // remove the cookie using the cookie name
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});

// POST /urls - method to receive the form data from urls_new
app.post('/urls', (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  // either have or DONT have user (undefined)
  if (!user) {
    return res.send('You are not logged in');
  }

  const shortURL = generateRandomString();
  // add new shortURL to urlDatabase
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
    uniqueVisits: 0,
    totalVisits: 0,
    recentVisits: []
  };

  // redirect to new shortURL page
  return res.redirect('/urls');
});

// POST /urls/:id/delete - delete a URL from the database
app.delete('/urls/:id', (req, res) => {
  // if short URL does not exist, redirect to urls_index page
  if (urlDatabase[req.params.id] === undefined) {
    return res.status(404).redirect('/urls');
  }

  // if user is not logged in, redirect to login page
  if (!checkCookie(req, users)) {
    return res.status(403).redirect('/login');
  }

  // check if user has access to delete URL (own the URL)
  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.status(403).redirect('/urls');
  }

  // delete shortURL from urlDatabase
  delete urlDatabase[req.params.id];
  return res.redirect('/urls');
});

// POST /urls/:id - updates to long URL from urls_show
app.put('/urls/:id', (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    // if short URL does not exist, redirect to urls_index page
    return res.status(404).redirect('/urls');
  }
  // check if user logged in / has cookie
  if (!checkCookie(req, users)) {
    // if user is not logged in, redirect to login page
    return res.status(401).redirect('/login');
  }
  // check if user has access to edit URL (own the URL)
  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.status(403).redirect('/urls');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  return res.redirect(`/urls/${req.params.id}`);
});


///////////// setup the server //////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});