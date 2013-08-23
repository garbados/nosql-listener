var Twit = require('twit')
  , nano = require('nano')("https://"
            + process.env.USERNAME
            + ":"
            + process.env.PASSWORD
            + "@"
            + process.env.USERNAME
            + ".cloudant.com"
    )
  , db = nano.use('nosql-listener')

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY
  , consumer_secret: process.env.CONSUMER_SECRET
  , access_token: process.env.ACCESS_TOKEN
  , access_token_secret: process.env.ACCESS_SECRET
})

var stream = T.stream('statuses/filter', {track: "nosql,cloudant,mongodb,couchdb,hbase,couchbase"})

stream.on('tweet', function(tweet){
  console.log(tweet.retweeted_status);
  var to_save = {
    _id: tweet.id_str,
    text: tweet.text,
    type: "tweet",
    created_at: tweet.created_at,
    urls: tweet.entities.urls,
    geo: tweet.coordinates,
    retweet_count: tweet.retweet_count,
    retweeted_id: tweet.retweeted_status && tweet.retweeted_status.id_str,
    user: {
      name: tweet.user.name,
      handle: tweet.user.screen_name,
      url: tweet.user.url
    }
  };
  db.insert(to_save, tweet.id_str, function(err, body){
    if(err || (body && !body.ok)){
      console.log(err, body)
    }else{
      console.log(body.id, to_save.created_at, body.ok)
    }
  })
})