angular.module('yellowPages').service('elasticClient', ['esFactory', function(esFactory){
  return esFactory({
    host: 'localhost:9200'
  });
}]);