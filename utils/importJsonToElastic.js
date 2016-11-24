(function importToElastic(indexName, docType, elasticUrl, elasticPort){
	var elasticsearch = require('elasticsearch');
	var fs = require('fs');
	var people = JSON.parse(fs.readFileSync(__dirname + '/../people.json'));
	indexName = indexName || 'people';
	docType = docType || 'yellow_pages';
	elasticUrl = elasticUrl || 'localhost';
	elasticPort = elasticPort || '9200';
	var client = new elasticsearch.Client({  // default is fine for me, change as you see fit
		host: elasticUrl + ':' + elasticPort
	});
	var maxToInsert = 1000;
	var bulkToPush = [];
	var action = {index: {_index: indexName, _type: docType}};
	var i = 0;
	while(i< people.length){
		bulkToPush.push(action);
		bulkToPush.push(people[i]);
		i++;
		if(bulkToPush.length === maxToInsert){
			pushToElastic(bulkToPush);
			bulkToPush = [];
		}
	}
	pushToElastic(bulkToPush);
	function pushToElastic(bulkToPush){
		client.bulk({
			body: bulkToPush
		}, function(error, response) {
			if(error){
				console.log(error);
			}
		});
	}
})();