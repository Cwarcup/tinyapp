const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('#getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    // Write your assert statement here
  });
  it('should return a user object when it is provided an email that exists in the database', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    assert.isObject(user, 'user is an object');
  });
  it('should return undefined when it is provided an email that does not exist in the database', () => {
    const user = getUserByEmail('user2000@example.com', testUsers);
    assert.isUndefined(user, 'user is undefined');
  });
});

const testUrls = {
  abcd : {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
  },
  efgh : {
    longURL: 'http://www.facebook.com',
    userID: 'user2RandomID'
  },
  ijkl : {
    longURL: 'http://www.instagram.com',
    userID: 'userRandomID'
  }
};

describe('#urlsForUser', () => {
  it('should return the urls that are associated with a user', () => {
    const urls = urlsForUser('userRandomID', testUrls);
    const expectedUrls = {
      abcd: 'http://www.google.com',
      ijkl: 'http://www.instagram.com'
    };
    assert.deepEqual(urls, expectedUrls, 'urls are equal');
  });

  it('should return an empty object if the userID does not exist in user database', () => {
    const urls = urlsForUser('doesNotExist', testUrls);
    assert.deepEqual(urls, {}, 'urls are empty');
  });
});