(function importToElastic(indexName, docType, elasticUrl, elasticPort){
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
	}

	function pushToElastic(bulkToPush){
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
		body.mappings[docType] = {
					"properties": {
						"address": {
							"properties": {
								"city": {
									"type": "string"
								},
								"country": {
									"type": "string"
								},
								"street": {
									"type": "string"
								}
							}
						},
						"avatar_image": {
							"type": "string"
						},
						"avatar_origin": {
							"type": "string"
						},
						"birthday": {
							"type": "long",
							"index" : "not_analyzed"
						},
						"chuck": {
							"type": "string"
						},
						"email": {
							"type": "string"
						},
						"id": {
							"type": "string"
						},
						"name": {
							"type": "string",
							"index" : "not_analyzed"
						},
						"phone": {
							"type": "string",
							"index" : "not_analyzed"
						},
						"quote": {
							"type": "string"
						}
					}
				};

		client.indices.create({
			index: indexName,
			type: docType,
			body: body
		}, function(error,response) {
			if(error){
				console.log('error creating index');
				console.log(error);
			}
		});
	}
})();