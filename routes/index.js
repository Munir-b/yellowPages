(function() {
  'use strict';
  var express = require('express');
  var router = express.Router();
  var elasticSearch = require('elasticsearch');
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
    console.log("termToSearch=" + termToSearch);
    elasticSearchClient.search({
      index: 'people',
      type: 'yellow_pages',
      body: {
        query: {
          term: {name: termToSearch}
        }
      }
    }, function(err, response) {
      if (err) {
        res.status(500);
        console.log('error')
      } else {
        res.status(200).json(response);
      }
    });
  });

  module.exports = router;
})();
