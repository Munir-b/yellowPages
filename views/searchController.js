(function(){
  angular.module('yellowPages').controller('searchController', ['$scope', 'elasticClient', function($scope, elasticClient){
    var PAGE_SIZE = 100;
    elasticClient.search({
      index: 'people',
      q: '1315-69482',
      size: PAGE_SIZE,
      from: 0
    }, function(error, response){
      if(error){
        console.log('ERROR:_____________________________________');
        console.log(error);
      } else {
        console.log(response);
      }
    });
  }]);
})();
