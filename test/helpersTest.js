const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
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