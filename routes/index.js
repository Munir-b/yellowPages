(function() {
  'use strict';
  var express = require('express');
  var router = express.Router();
  var elasticSearch = require('elasticsearch');
  var utils = require('../utils/utils');
  var serverOptions =
  {
    hosts: [
      'http://localhost:9200'
    ]
  };

  var elasticSearchClient = new elasticSearch.Client(serverOptions);
  /* GET home page. */

  router.get('/', function(req, res) {
    res.sendfile('views/index.html');
  });

  /* GET search results. */
  router.post("/search", function(req, res) {
    var termToSearch = req.body.query.termToSearch;
    var from = req.body.query.from || 0;
    var size = req.body.query.pageSize || 10;
    var max_result_window = 1000000;
    if(from+size > max_result_window){
      size = max_result_window-from;
    }
    var query = utils.prepareQuery(termToSearch);
    elasticSearchClient.search({
      index: 'people',
      type: 'yellow_pages',
      from: from,
      size: size,
      body: {
        query: query
      }
    }, function(err, response) {
      if (err) {
        res.status(500);
        res.message(err);
        console.log('error')
      } else {
        res.status(200).json(response);
      }
    });
  });

  module.exports = router;
})();
