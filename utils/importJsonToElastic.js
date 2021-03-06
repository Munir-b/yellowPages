(function importToElastic(indexName, docType, elasticUrl, elasticPort){
	'use strict';
	var elasticsearch = require('elasticsearch');
	var fs = require('fs');
	var people = JSON.parse(fs.readFileSync(__dirname + '/../people.json'));
	var client = init();
	createIndex();
	iterate();

	function init() {
		indexName = indexName || 'people';
		docType = docType || 'yellow_pages';
		elasticUrl = elasticUrl || 'localhost';
		elasticPort = elasticPort || '9200';
		return new elasticsearch.Client({  // default is fine for me, change as you see fit
			host: elasticUrl + ':' + elasticPort
		});
	}

	function iterate() {
		var maxToInsert = 1000;
		var bulkToPush = [];
		var action = {index: {_index: indexName, _type: docType}};
		var i = 0;
		while (i < people.length) {
			bulkToPush.push(action);
			bulkToPush.push(people[i]);
			i++;
			if (bulkToPush.length === maxToInsert) {
				pushToElastic(bulkToPush);
				bulkToPush = [];
			}
		}
		pushToElastic(bulkToPush);
		console.log('finished importing to Elasticsearch');
	}

	function pushToElastic(bulkToPush){
		if(bulkToPush.length === 0){
			return;
		}
		client.bulk({
			body: bulkToPush
		}, function(error, response) {
			if(error){
				console.log(error);
			}
		});
	}

	function createIndex() {
		var body = {};
		body.mappings = {};
		body.settings = {
			"index" : {
				"number_of_shards" : 1,
				"number_of_replicas" : 1,
				"max_result_window" : 1000000
			},
			"analysis": {
				"filter": {
					"nGram_filter": {
						"type": "nGram",
						"min_gram": 1,
						"max_gram": 20,
						"token_chars": [
							"letter",
							"digit",
							"punctuation",
							"symbol"
						]
					}
				},
				"analyzer": {
					"nGram_analyzer": {
						"type": "custom",
						"tokenizer": "whitespace",
						"filter": [
							"lowercase",
							"asciifolding",
							"nGram_filter"
						]
					},
					"whitespace_analyzer": {
						"type": "custom",
						"tokenizer": "whitespace",
						"filter": [
							"lowercase",
							"asciifolding"
						]
					},
					"remove_hyphen_analyzer" : {
						"tokenizer" : "standard",
						"char_filter" : ["hyphen_mapping"]
					}
				},
				"char_filter" : {
					"hyphen_mapping" : {
						"type" : "mapping",
						"mappings" : ["-=>"]
					}
				}
			}
		};
		body.mappings[docType] = {
			_all: {
				"analyzer": "nGram_analyzer",
				"search_analyzer": "whitespace_analyzer"
			},
			properties: {
				"address": {
					"properties": {
						"city": {
							"type": "string",
							"index": "no",
							"include_in_all": false
						},
						"country": {
							"type": "string",
							"index": "no",
							"include_in_all": false
						},
						"street": {
							"type": "string",
							"index": "no",
							"include_in_all": false
						}
					},
					"include_in_all": false
				},
				"avatar_image": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				},
				"avatar_origin": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				},
				"birthday": {
					"type": "long",
					"index" : "not_analyzed",
					"include_in_all": false
				},
				"chuck": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				},
				"email": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				},
				"id": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				},
				"name": {
					"type": "text"
				},
				"phone": {
					"type": "text"
				},
				"quote": {
					"type": "string",
					"index": "no",
					"include_in_all": false
				}
			}
		};
		client.indices.create({
			index: indexName,
			body: body
		}, function(error,response) {
			if(error){
				console.log('error creating index');
				console.log(error);
			}
		});
	}
})();