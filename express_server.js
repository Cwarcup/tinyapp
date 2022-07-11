const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// add in EJS middlware
app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

// sending json data
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// sending HTML
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// variable created in the function
app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// trying to access the variable created in the function
app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});
// results in an error 'a is not defined'


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});