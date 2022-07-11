const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

// add in EJS middlware
app.set('view engine', 'ejs');
app.use(morgan('dev'));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});