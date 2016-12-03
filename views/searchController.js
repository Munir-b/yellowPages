(function(){
  'use strict';
  angular.module('yellowPages')
  .controller('searchController', ['$scope', '$http', function($scope, $http){
    var vm = this;
    var DEFAULT_PAGE_SIZE = 10;
    var DEFAULT_PAGE_NUMBER = 0;

    init();
    $scope.$watch('vm.searchCriteria.term', function(term){
      if(!term){
        init();
        return;
      }
      search(term, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, true);
    });

    var search = _.debounce(function(term, pageNumber, pageSize, newSearch){
      $http.post('/search', {
        query: {
          termToSearch: term,
          from: pageNumber,
          pageSize: pageSize
        }
      }).then(function success(res){
        var results = parseResponse(res);
        vm.results = resizeImages(results);
        //new search
        if(newSearch){
          calculatePages(vm.results.totalHits);
        }
      }, function failure(error){
        console.log('FAILURE');
        console.log(error);
        alert('an error occurred, check browser console');
      });
    }, 150);

    function init(){
      vm.searchCriteria = {};
      vm.pagination = {currentPage: 1, totalItems: 0, pageSize: 10, maxSize: 12};
      initResults();
    }

    function parseResponse(res) {
      var results = {totalHits:0, items:[]};
      if(res && res.data && res.data.hits && res.data.hits.hits){
        results.totalHits = res.data.hits.total;
        _.forEach(res.data.hits.hits, function(hit){
          var item = {};
          item.name = hit._source.name;
          item.address = hit._source.address;
          item.age = calculateAge(hit._source.birthday);
          item.phone = hit._source.phone;
          item.avatar = hit._source.avatar_origin;
          results.items.push(item);
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

    function initResults(){
      vm.results = {totalHits: 0, items: []};
    }

    function calculatePages(totalItems){
      vm.pagination.totalItems = totalItems;
    }

    vm.pageChanged = function() {
      var pageSize = vm.pagination.pageSize;
      var currentPage = vm.pagination.currentPage;
      var term = vm.searchCriteria.term;
      search(term, (currentPage-1)*pageSize, pageSize, false);
    }

  }]);
})();
