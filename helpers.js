//////////// helper functions //////////////
// generate random string
const generateRandomString = () => {
  const randomString = Math.random().toString(36).substring(7);
  return randomString;
};

// user lookup helper function, checks email
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};


// check if browser has cookie with user id
const checkCookie = (req, database) => {
  const cookie = req.session.userID;
  if (cookie) {
    return database[cookie];
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

module.exports = { generateRandomString, getUserByEmail, checkCookie, urlsForUser };