var spore = require('spore');
var u = require('underscore');


/**
 * Connect to an indexden of indextank server
 *
 * @param {Object} [options] url, user and pass
 */
module.exports.connect = function(options) {

    var indexden = {};

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

    /**
     * Gets the metadata of every index
     *
     * @param {Function} [fn] callback function with (err,indexes)
     */
    indexden.listIndexes = function(fn) {
        client.list_indexes(function(err, result) {
            var indexes = processBody(result);
            if(fn) fn(err,indexes);
        });
    }

    /**
     * Creates or updates an index
     *
     * @param {String} index index name
     * @param {Boolean} [public_search] whether the public API will be available for this index (indexden only)
     * @param {Function} [fn] callback function with (err,index)
     */
    indexden.createIndex = function(index,public_search,fn) {
        if(typeof public_search === "function"){
            fn = public_search;
            public_search = false;
        }
        client.create_index({index: index, public_search: public_search}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    /**
     * Retrieves metadata for the index
     *
     * @param {String} index index name
     * @param {Function} [fn] callback function with (err,index)
     */
    indexden.getIndex = function(index,fn) {
        client.get_index({index : index}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    /**
     * Delete an index
     *
     * @param {String} index index name
     * @param {Function} [fn] callback function with (err)
     */
    indexden.deleteIndex = function(index,fn) {
        client.delete_index({index : index}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Add a new document or update an existing one. Pass an Array of documents to add/update
     * multiple documents
     *
     * @param {String} index index name
     * @param {Object|Array} docs document(s) to index. Must have docid(string) and fields(map)
     * @param {Function} [fn] callback function with (err)
     */
    indexden.createDocuments = function(index,docs,fn) {
        client.add_documents({index : index}, JSON.stringify(docs), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Delete document(s)
     *
     * @param {String} index index name
     * @param {String,Array} docids one docid or an array of docids
     * @param {Function} [fn] callback function with (err,response)
     */
    indexden.deleteDocuments = function(index,docids,fn) {
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

    /**
     * Update the variables of a document
     *
     * @param {String} index index name
     * @param {String} docid document id
     * @param {Object} variables a map from the var number to float
     * @param {Function} [fn] callback function with (err)
     */
    indexden.updateVariables = function(index,docid,variables,fn) {
        client.update_variables({index : index}, JSON.stringify({docid: docid, variables: variables}), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Update the categories of a document
     *
     * @param {String} index index name
     * @param {String} docid document id
     * @param {Object} categories a map from the categories' names to the values
     * @param {Function} [fn] callback function with (err)
     */
    indexden.updateCategories = function(index,docid,categories,fn) {
        client.update_categories({index : index}, JSON.stringify({docid: docid, categories: categories}), function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Get all functions defined for one index
     *
     * @param {String} index index name
     * @param {Function} [fn] callback function with (err,functions)
     */
    indexden.getFunctions = function(index,fn) {
        client.get_functions({index : index}, function(err, result) {
            if(fn) fn(err,processBody(result));
        });
    }

    /**
     * Define a function
     *
     * @param {String} index index name
     * @param {Integer} number function number
     * @param {String} definition the formula that defines the function
     * @param {Function} [fn] callback function with (err)
     */
    indexden.addFunction = function(index,number,definition,fn) {
        client.add_function({index : index, number: number}, {definition: definition}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Delete a function
     *
     * @param {String} index index name
     * @param {Integer} number function number
     * @param {Function} [fn] callback function with (err)
     */
    indexden.deleteFunction = function(index,number,fn) {
        client.delete_function({index : index, number: number}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    /**
     * Performs a search
     *
     * @param {String} index index name
     * @param {String} query the query to be performed
     * @param {Object} [options] map of options (start, len, fetch, etc...)
     * @param {Function} [fn] callback function with (err,docs,response)
     */
    indexden.search = function(index, query, options, fn) {
        if(typeof options === "function"){
            fn = options;
            options = {};
        }
        options.index = index;
        options.q = query;
        client.search(options, function(err, result) {
            var response = processBody(result);
            if(fn) fn(err, response.results, response);

        });
    }

    /**
     * Deletes documents found by the search
     *
     * @param {String} index index name
     * @param {String} query the query to be performed
     * @param {Object} [options] map of options (start, function, etc...)
     * @param {Function} [fn] callback function with (err)
     */
    indexden.deleteSearch = function(index, query, options, fn) {
        if(typeof options === "function"){
            fn = options;
            options = {};
        }
        options.index = index;
        options.q = query;
        client.delete_search(options, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);

        });
    }

    /**
     * Promote a document for a query
     *
     * @param {String} index index name
     * @param {String} docid the id of the document to promote
     * @param {String} query the query to in which to promote it
     * @param {Function} [fn] callback function with (err)
     */
    indexden.promote = function(index, docid, query, fn) {
        client.promote({index: index}, {docid: docid, query: query}, function(err, result) {
            if (result.status== 200 && err) err = undefined;
            if(fn) fn(err);
        });
    }

    return indexden;
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



