
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , proxy = require('./routes/proxy')
  , http = require('http')
  , path = require('path')
  , listen = require('./listen')
  , app = express()

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.favicon())
app.use(express.logger('dev'))
// all requests to /proxy* get forwarded to Cloudant through the proxy
app.use(proxy('proxy'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

app.get('/', routes.index)
app.get('/template/:name', function(req, res){ res.render(req.params.name) })
require('./routes/api')(app, 'api')

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
})
