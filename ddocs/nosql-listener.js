var couchapp = require('couchapp');

ddoc = {
  _id: '_design/queries',
  views: {
    users: {
      map: function(doc){
        if (doc.type === 'tweet') {
          emit(doc.user.handle, null);
        }
      },
      reduce: '_count'
    },
    dates: {
      map: function(doc){
        if(doc.type === 'tweet') {
          var date = new Date(doc.created_at);
          emit([date.getYear(), date.getMonth(), date.getDate()], null);
        }
      },
      reduce: '_count'
    },
    trending: {
      map: function(doc){
        if(doc.type === 'tweet') {
          var date = new Date(doc.created_at);
          for(var i in doc.urls){
            emit([date.getYear(), date.getMonth(), date.getDate(), doc.urls[i].expanded_url], null);
          }
        }
      },
      reduce: '_count'
    },
    popular: {
      map: function(doc){
        if(doc.type === 'tweet') {
          var date = new Date(doc.created_at);
          if(doc.retweeted_id){
            emit([date.getYear(), date.getMonth(), date.getDate(), doc.retweeted_id], null);
          }else{
            emit([date.getYear(), date.getMonth(), date.getDate(), String(doc._id)], null);
          }
        }
      },
      reduce: '_count'
    }
  },
  lists: {},
  shows: {},
  indexes: {
    text: {
      index: function(doc){
        index("default", doc.text);
        if (doc.created_at) {
          index("date", new Date(doc.created_at).getTime());
        }
      }
    }
  }
};

module.exports = ddoc;