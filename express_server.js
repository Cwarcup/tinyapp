const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

// add in EJS middlware
app.set('view engine', 'ejs');

// use middwares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// generate random string
const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(7);
  return randomString;
};

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
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// sending json data
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// home page route
app.get('/', (req, res) => {
  res.send('Welcome to TinyURL!');
});

///////////////// post methods ///////////////

// POST method to receive the form data from urls_new
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});


// setup the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});