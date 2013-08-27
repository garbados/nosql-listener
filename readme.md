# NoSQL-Listener

Aggregating NoSQL news from Twitter, from your friends at [Cloudant](https://cloudant.com/).

Built using [Express-Cloudant](http://express-cloudant.herokuapp.com/) with love by [Max Thayer](http://www.maxthayer.org/).

See it live at [http://nosql-listener.herokuapp.com](http://nosql-listener.herokuapp.com/#/).

## Roll your Own

NoSQL-Listener can be modified to aggregate news about any array of topics. To do that, you'll need [Heroku's toolbelt](https://devcenter.heroku.com/articles/quickstart#step-2-install-the-heroku-toolbelt), and a database in your account named `nosql-listener`. Once you have all that, read on!

First off, let's clone the project and download our dependencies:

    git clone git@github.com:garbados/nosql-listener.git
    cd nosql-listener
    npm install

Now, let's configure the app. NoSQL-Listener is built to run on Heroku, so we'll create a `.env` file to store configuration values, and populate it like this:

    USERNAME=your cloudant username
    PASSWORD=your cloudant password

    CONSUMER_KEY=consumer key provided by twitter when you register an application
    CONSUMER_SECRET=consumer secret provided by twitter when you register an application
    ACCESS_TOKEN=access token provided by twitter when you register an application
    ACCESS_SECRET=access secret provided by twitter when you register an application

    TOPICS=comma,separated,list,of,topics,to,watch
    TITLE=Listener Title, Displayed In Big Letters On Page

Finally, we build our static assets, upload our design docs, and run it locally:

    foreman run grunt
    foreman start

BONUS ROUND: To upload your listener to Heroku, do this:

    heroku create
    heroku config:push
    git push heroku master

Now you're live on Heroku!

NB: to prevent your Heroku instance from idling, you'll need more than one dyno running.