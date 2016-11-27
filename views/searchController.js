(function(){
  'use strict';
  angular.module('yellowPages')
  .controller('searchController', ['$scope', '$http', function($scope, $http){
    $scope.results = [];
    $scope.$watch('searchCriteria', function(term){
      search(term);
    });

    var search = _.debounce(function(term){
      if(!term) return;
      $http.post('/search', {
        query: {
          termToSearch: term
        }
      }).then(function success(res){
        $scope.results = parseResponse(res);
      }, function failure(error){
        console.log('FAILURE');
        console.log(error);
      });
    }, 250);

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

        // var birthdayDate = new Date(birthday);
        // var dateNow = new Date();
        //
        // var years = dateNow.getFullYear() - birthdayDate.getFullYear();
        // var months = dateNow.getMonth()-birthdayDate.getMonth();
        // var days = dateNow.getDate()-birthdayDate.getDate();
        // if (isNaN(years)) {
        //   return '';
        // } else {
        //   if(months < 0 || (months == 0 && days < 0)) {
        //     years = parseInt(years) -1;
        //   }
        //   return years;
        // }
        var ageDifMs = Date.now() - birthday;
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }
  }]);
})();
