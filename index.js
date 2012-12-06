var spore = require('spore');
var u = require('underscore');


module.exports.connect = function(options) {

    var IndexTankClient = {};

    var  url = options && options.url ? options.url : 'http://localhost:20220'
        , user  = options && options.user
        , pass = options && options.pass;

    var client = spore.createClient(__dirname +'/indexden.json', {base_url: url});

    // json middleware
    client.enable(spore.middlewares.json());
    // status middleware (throw error if http status is not expected)
    client.enable(spore.middlewares.status());
    // authentication middleware
    client.enable(spore.middlewares.basic(user, pass));

    IndexTankClient.listIndexes = function(fn) {
        client.list_indexes(function(err, result) {
            var indexes = processBody(result);
            if(fn) fn(err,indexes);
        });
    }

    IndexTankClient.createIndex = function(index,public_search,fn) {
        if(typeof public_search === "function"){
            fn = public_search;
            public_search = false;
        }
        client.create_index({index: index, public_search: public_search}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.getIndex = function(index,fn) {
        client.get_index({index : index}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.deleteIndex = function(index,fn) {
        client.delete_index({index : index}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.createDocuments = function(index,docs,fn) {
        client.add_documents({index : index}, JSON.stringify(docs), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.deleteDocuments = function(index,docids,fn) {
        var ids;
        if(typeof docids === "string"){
            ids = {docid: docids};
        }else if(Object.prototype.toString.call( docids ) === '[object Array]'){
            ids = [];
            u.each(docids,function(docid){
                ids.push({docid: docid});
            });
        }
        client.delete_documents({index : index}, JSON.stringify(ids), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.updateVariables = function(index,docid,variables,fn) {
        client.update_variables({index : index}, JSON.stringify({docid: docid, variables: variables}), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.updateCategories = function(index,docid,categories,fn) {
        client.update_categories({index : index}, JSON.stringify({docid: docid, categories: categories}), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.getFunctions = function(index,fn) {
        client.get_functions({index : index}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.addFunction = function(index,number,definition,fn) {
        client.add_function({index : index, number: number}, {definition: definition}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.deleteFunction = function(index,number,fn) {
        client.delete_function({index : index, number: number}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));
        });
    }

    IndexTankClient.search = function(index, query, params, fn) {
        if(typeof params === "function"){
            fn = params;
            params = {};
        }
        params.index = index;
        params.q = query;
        client.search(params, function(err, result) {
            var response = processBody(result);
            if(fn) fn(err, response.results, response);

        });
    }

    IndexTankClient.deleteSearch = function(index, query, params, fn) {
        if(typeof params === "function"){
            fn = params;
            params = {};
        }
        params.index = index;
        params.q = query;
        client.delete_search(params, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err,processBody(result));

        });
    }

    IndexTankClient.promote = function(index, docid, query, fn) {
        client.promote({index: index}, {docid: docid, query: query}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err, processBody(result));

        });
    }

    return IndexTankClient;
}

function processBody(result){
    var body = result.body;
    if(result.body && typeof body === "string"){
        try{
            body = JSON.parse(body);
        }catch(e){
            throw e;
        }
    }

    return body;
}



