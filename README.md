# tinyApp URL Shortener

In this exercise we learned how to use the EJS templating engine to render web pages.

We used the Express render method to respond to requests by sending back a template, along with an object containing the data the template needs. We then used EJS to render this data to our web page. We used Express route parameters to pass data from our frontend to our backend via the request url. Finally, we created a partial template for our header so that we can have the code for it in one location, but render it on multiple pages.


### Learning Outcomes
- Add route for /urls in expressserver.js and render using accompanying template
- Add route for /urls/:id in expressserver.js and render using accompanying template
- Include the header partial inside urls_index.ejs and urls_show.ejs. Make sure this is included inside the top of the **body**