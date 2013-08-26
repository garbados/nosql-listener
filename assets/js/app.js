(function(){ "use strict"; })();

angular.module('app', [])
/* ROUTER */
.config(['$routeProvider', function($routeProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'template/tweets',
    controller: 'TweetsCtrl'
  })
  .when('/search', {
    templateUrl: 'template/search',
    controller: 'SearchCtrl'
  })
  .when('/retweets', {
    templateUrl: 'template/tweets',
    controller: 'PopularCtrl'
  })
  .when('/links', {
    templateUrl: 'template/links',
    controller: 'TrendsCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
}])
/* PROVIDERS */
.constant('md', new Showdown.converter({ extensions: ['twitter'] }))
.constant('root', '/proxy/nosql-listener')
/* CONTROLLERS */
.controller('TweetsCtrl', ['$scope', '$http', 'root', function($scope, $http, root){
  $http({
    url: [root, '_all_docs'].join('/'),
    method: 'GET',
    params: {
      include_docs: true,
      limit: 100,
      descending: true
    }
  })
  .success(function(res){
    $scope.tweets = res.rows
      .filter(function(row){
        return row.doc && row.doc.created_at;
      })
      .map(function(row){ 
        row.doc.created_at = new Date(row.doc.created_at);
        return row.doc;
      });
  });
}])
.controller('SearchCtrl', ['$scope', '$http', 'root', function($scope, $http, root){
  $scope.tweets = [];
  $scope.search = function(){
    $http({
      url: [root, '_design/queries/_search/text'].join('/'),
      method: 'GET',
      params: {
        q: $scope.query,
        include_docs: true
      }
    })
    .success(function(data){
      $scope.tweets = data.rows.map(function(row){
        row.doc.created_at = new Date(row.doc.created_at);
        return row.doc;
      })
      .sort(function(a, b){
        return b.created_at.getTime() - a.created_at.getTime();
      });
    });
  };
}])
.controller('PopularCtrl', ['$scope', '$http', 'root', function($scope, $http, root){
  var now = new Date();
  $http({
    url: [root, '_design/queries/_view/popular'].join('/'),
    method: 'GET',
    params: {
      group: true,
      stale: 'ok'
    }
  })
  .success(function(queryRes){
    var ids = queryRes.rows
    .filter(function(row){
      if((row.key[0] === now.getYear()) && (row.key[1] === now.getMonth()) && (row.key[2] === now.getDate())){
        return true;
      }
    })
    .sort(function(a, b){
      return b.value - a.value;
    })
    .map(function(row){
      return row.key[3];
    })
    .slice(1,20);
    $http({
      url: [root, '_all_docs'].join('/'),
      method: 'POST',
      params: {
        include_docs: true
      },
      data: {
        keys: ids
      }
    })
    .success(function(allDocs){
      var getScore = function(doc){
            return (Math.pow(doc.retweet_count, 2)) / (now.getTime() - doc.created_at.getTime());
          },
          popular = allDocs.rows
            .filter(function(row){
              return !row.error;
            })
            .map(function(row){
              row.doc.retweet_count = queryRes.rows.filter(function(queryRow){
                return queryRow.key[3] === String(row.id);
              })[0].value;
              row.doc.created_at = new Date(row.doc.created_at);
              return row.doc;
            })
            .sort(function(a, b){
              return getScore(b) - getScore(a);
            });
      $scope.tweets = popular;
    });
  });
}])
.controller('TrendsCtrl', ['$scope', '$http', 'root', function($scope, $http, root){
  $http({
    url: [root, '_design/queries/_view/trending'].join('/'),
    method: 'GET',
    params: {
      group: true,
      stale: 'ok'
    }
  })
  .success(function(res){
    var now = new Date();
    var trending = res.rows
    .filter(function(row){
      if((row.key[0] === now.getYear()) && (row.key[1] === now.getMonth()) && (row.key[2] === now.getDate())){
        return true;
      }
    })
    .sort(function(a, b){
      return b.value - a.value;
    });
    $scope.data = trending;
  });
}])
/* FILTERS */
.filter('mdify', function(){
  return function(input){
    if(input){
      return input.text.replace(/http:\/\/t\.co\/[\w\d]+/, function(str){
        var link = input.urls.filter(function(row){
          return str === row.url;
        })[0];
        if(link){
          return '[' + str + '](' + link.expanded_url + ')';
        }else{
          return str;
        }
      });
    }
  };
})
.filter('markdown', ['md', function(md){
  return function(input){
    if(input) {
      return md.makeHtml(input);
    }
  };
}]);