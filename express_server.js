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

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// generate random string
const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(7);
  return randomString;
};

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
  // data to pass to the ejs file
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

// home page route
app.get('/', (req, res) => {
  res.redirect('/urls');
});

///////////////// post methods ///////////////

// post method to /login
app.post('/login', (req, res) => {
  // set cookie name to 'username', value to req.body.username from form
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// logout endpoint
app.post('/logout', (req, res) => {
  // get username from the cookie
  const username = req.cookies.username;
  // remove the cookie using the cookie name
  res.clearCookie('username');
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
  console.log(req.body);
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


// setup the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});