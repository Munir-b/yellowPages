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
      //phone or age
      criteria = criteria.replace('-','');
      var criteriaNumericValue = parseInt(criteria);
      if(criteriaNumericValue !== NaN){
        if(criteria.length <= 3){
          //age
          res.age.push(criteriaNumericValue);
        } else {
          //phone
          res.phone.push(criteriaNumericValue);
        }
      } else {
        //name
        res.name.push(criteria);
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
    query.bool = {};
    query.bool.must = [];
    var names = {bool: {should:[]}};
    var ages = {bool: {should:[]}};
    var phones = {bool: {should:[]}};
    _.forEach(res.names, function(name){
      names.bool.should.push({term:{name:name}});
    });
    _.forEach(res.age, function(age){
      var birthdayBoundaries = api.calculateBirthday(age);
      ages.bool.should.push({range:{birthday:{gt: birthdayBoundaries.higherBirthday, lte: birthdayBoundaries.lowerBirthday}}});
    });
    _.forEach(res.phone, function(phone){
      phones.bool.should.push({term:{phone:phone}});
    });
    if(names.bool.should.length > 0){
      query.bool.must.push(names);
    }
    if(ages.bool.should.length > 0){
      query.bool.must.push(ages);
    }
    if(phones.bool.should.length > 0){
      query.bool.must.push(phones);
    }
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
