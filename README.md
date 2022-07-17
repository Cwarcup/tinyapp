# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Features

- Uses cookies to track user sessions
- Built in analytics
  - tracks the number of visits to a *unique* URL
  - tracks *total* number of visits to a URL
  - tracks IP addresses of visitors
  - tracks date and time of visits accessing a short URL
  - analytics are only visible to the user who created the URL
- Permissions
  - only a user that creates a URL has authorization to edit and delete it
  - can only create a URL if they are logged in and registered with the site
- Header contents are conditional on whether the user is logged in or not

## Final Product

![login page](https://media3.giphy.com/media/cL7pKZUIpcivqdfPk4/giphy.gif?cid=790b7611f31a14d517a1b98da284dbafaac4232b75ef47a9&rid=giphy.gif&ct=g)

![edit a URL](https://media0.giphy.com/media/efqvBkCNNAPaJ3W4Dg/giphy.gif?cid=790b7611d031cc790a76413536d1070af325ac3ab0d2479a&rid=giphy.gif&ct=g)

![errors](https://media0.giphy.com/media/sVHvhNtVfPDJ3V7BlZ/giphy.gif?cid=790b761157b1f94a67171b4f399c3ae28b5e50a51eee2525&rid=giphy.gif&ct=g)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

Test Data:
- email: 'test@email.com'
- password: 'a'

> Has preset data in the database. See comments in `express_server.js` to remove predefined data.

Example Short URL: http://localhost:8080/u/abcd
