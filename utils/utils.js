(function(){
  'use strict';
  var _ = require('../node_modules/lodash/lodash.min');
  var api = {};
  //365*24*60*60*1000
  var ONE_YEAR = 31536000000;
  api.parse = function(str) {
    var res = {nameOrPhone:[], age: []};
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
        res.nameOrPhone.push(criteria);
      } else {
        if(criteria.length <= 2){
          //age
          res.age.push(criteriaNumericValue);
        } else {
          //phone
          res.nameOrPhone.push(criteria);
        }
      }
    });
    return res;
  };

  api.prepareQuery = function(str){
    var res = api.parse(str);
    if(res.nameOrPhone.length === 0 && res.age.length === 0){
      return {};
    }
    var query = {bool:{must:[]}};
    if(res.nameOrPhone.length > 0) {
      query.bool.must.push({match:{_all: {query: res.nameOrPhone.join(' '), operator: 'and'}}});
    }
    if(res.age.length > 0){
      var birthday = api.calculateBirthdayRange(res.age[0]);
      query.bool.must.push({range:{birthday:{lte: birthday.exact, gt: birthday.older}}});
    }
    return query;
  };

  api.calculateBirthdayRange = function(age){
    var exact = Date.now() - age*ONE_YEAR;
    var older = exact-ONE_YEAR;
    return {exact: exact, older: older};
  };

  module.exports = api;
})();
