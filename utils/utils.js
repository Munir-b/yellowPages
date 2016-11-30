(function(){
  'use strict';
  var _ = require('../node_modules/lodash/lodash.min');
  var api = {};
  //365*24*60*60*1000
  var ONE_YEAR = 31536000000;
  api.parse = function(str) {
    var res = {name:[], age: [], phone: []};
    if(!str) return res;
    var criteriaArray = str.split(' ');
    //removing spaces
    _.remove(criteriaArray, function(i){
       return i === '';
    });
    _.forEach(criteriaArray, function(criteria) {
      var criteriaNumericValue = parseInt(criteria);
      if(Number.isNaN(criteriaNumericValue) || criteriaNumericValue !== criteriaNumericValue){
        //name
        res.name.push(criteria);
      } else {
        if(criteria.length <= 3){
          //age
          res.age.push(criteriaNumericValue);
        } else {
          //phone
          res.phone.push(criteriaNumericValue);
        }
      }
    });
    return res;
  };

  api.prepareQuery = function(str){
    var res = api.parse(str);
    if(res.name.length === 0 && res.age.length === 0 && res.phone.length === 0){
      return {};
    }
    var query = {};
    query.match = {_all: {query: res.name, operator: 'and'}};
    return query;
  };

  api.calculateBirthday = function(age){
    if(isNaN(age)){
      return 0;
    }
    var lowerBirthday = Date.now() - age*ONE_YEAR;
    var higherBirthday = lowerBirthday-ONE_YEAR;
    return {lowerBirthday: lowerBirthday, higherBirthday: higherBirthday};
  };

  module.exports = api;
})();
