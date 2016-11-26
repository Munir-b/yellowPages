(function(){
  angular.module('yellowPages')
  .controller('searchController', ['$scope', 'elasticClient', '$http', function($scope, elasticClient, $http){
    $scope.results = [];
    $scope.$watch('searchCriteria', function(data){
      if(!data) return;
      $http.post('/search', {
        query: {
          termToSearch: data
        }
      }).then(function success(res){
        $scope.results = parseResponse(res);
      }, function failure(error){
        console.log('FAILURE');
        console.log(error);
      });
    });

    function parseResponse(res) {
      var results = [];
      if(res && res.data && res.data.hits && res.data.hits.hits){
        _.forEach(res.data.hits.hits, function(hit){
          var item = {};
          item.name = hit._source.name;
          item.address = hit._source.address;
          item.age = hit._source.birthday;
          item.phone = hit._source.phone;
          item.avatar = hit._source.avatar_origin;
          results.push(item);
        });
      }
      return results;
    }

  }]);
})();
