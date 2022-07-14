# tinyApp URL Shortener

In this exercise we learned how to use the EJS templating engine to render web pages.

We used the Express render method to respond to requests by sending back a template, along with an object containing the data the template needs. We then used EJS to render this data to our web page. We used Express route parameters to pass data from our frontend to our backend via the request url. Finally, we created a partial template for our header so that we can have the code for it in one location, but render it on multiple pages.


### Learning Outcomes
- Add route for /urls in expressserver.js and render using accompanying template
- Add route for /urls/:id in expressserver.js and render using accompanying template
- Include the header partial inside urls_index.ejs and urls_show.ejs. Make sure this is included inside the top of the **body**

Stetch!

- install method override
- pass it in as middleware to expressserver.js
- use the query value
`app.use(methodOverride('_method'));`

We have a few aways of sending information to a URL
- the URL itself
- the body


protocal -> domain -> endpoint -> query

starts after the `?`

Starts at the `q=` the query

As soon as we hit a `&` we know we've hit the end of the query string
 side node `oq` is the original query

**On the backend...**
we read this as 
`req.query.q`

Go into any of our forms, go to the form actions
```html
form action="/urls/login?_method=DELETE" method="POST"

```
Now we have created a delete request. The `app.post('/delete')` will not work. 

Must update your routes to the appropriate method.

```html
form action="/urls/login?_method=DELETE" method="POST"

```
app.delete('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = null;
  res.redirect('/urls');
}

```