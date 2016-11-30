(function(){
  'use strict';
  angular.module('yellowPages')
  .controller('searchController', ['$scope', '$http', function($scope, $http){
    $scope.results = [];
    $scope.$watch('searchCriteria', function(term){
      if(!term){
        $scope.results = [];
        return;
      }
      search(term);
    });

    var search = _.debounce(function(term){
      $http.post('/search', {
        query: {
          termToSearch: term
        }
      }).then(function success(res){
        var results = parseResponse(res);
        $scope.results = resizeImages(results);
      }, function failure(error){
        console.log('FAILURE');
        console.log(error);
      });
    }, 150);

    function parseResponse(res) {
      var results = [];
      if(res && res.data && res.data.hits && res.data.hits.hits){
        _.forEach(res.data.hits.hits, function(hit){
          var item = {};
          item.name = hit._source.name;
          item.address = hit._source.address;
          item.age = calculateAge(hit._source.birthday);
          item.phone = hit._source.phone;
          item.avatar = hit._source.avatar_origin;
          results.push(item);
        });
      }
      return results;
    }

    function calculateAge(birthday){

      if (birthday.value != '') {
        var ageDifMs = Date.now() - birthday;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }

    function resizeImages(res){
      for(var i=0;i<res.length;i++){
        res[i].avatar.replace('400x400', '50x50');
      }
      return res;
    }
  }]);
})();
