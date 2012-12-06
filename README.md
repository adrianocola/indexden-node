IndexDen Node Client
=====================

A node.js client for indexden (http://indexden.com/) that can also be used with indextank.

This project was based in this [gist](https://gist.github.com/1023154) by [francois2metz](https://github.com/francois2metz)

## Installation

```
npm install indexden
```

## Connecting to indexden server

```javascript
indexDenClient = require('indexden').connect({
    url: "index_den_url",    //default: http://localhost:20220
    user: "index_den_username",  //optional
    pass: "index_den_password"  //optional
});
```

## Executing commands on indexden

```javascript

//create a new index
indexDenClient.createIndex("test_index",function(err,index){

    //add a new document to the created index
    indexDenClient.createDocuments("test_index",{docid:"1",fields:{text:"Some text to serve as example"}},function(err){

        //search for the word "example"
        indexDenClient.search("test_index","example",{fetch: "*"},function(err,docs,response){
                console.log(docs); //print the document created in the previous step
            });

    });

});

```

## Complete API
... TODO ...


## License

Copyright (c) 2012 Adriano Cola

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.