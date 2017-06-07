'use strict';

let client = require('iotivity-node').client;

let getRes = function(res) {
    return new Promise((resolve, reject) => {

        function errorHandler(error){
            console.log('Server responded with error', error.message);
        }
        client.on("error", errorHandler);

        function resourcefound(resource) {
            client.removeListener("resourcefound", resourcefound);
            //console.log('++++++--------');
            if (resource.resourcePath == res.resourcePath) {
                //console.log(resource.properties);
                clearInterval(find);
                resolve(resource);
            }
        }
        client.on("resourcefound", resourcefound);

        var find = setInterval(function(){
            client.findResources(res)
            .catch(function(error) {
                console.log("Client: Starting device discovery failed: " +
                    ("" + error) + "\n" + JSON.stringify(error, null, 4));
                reject(error);
            });
        },20000);
    })
}

var updateRes = function(res, color) {
    return getRes(res).then((item) => {
        //console.log(item);
        return item
    })
    .then(function(items){
        //console.log('retrieve items is:', items);
        return client.retrieve(items); 
    })
    .then(
        function(resource){
            //console.log('retrieve resource is', resource)
            //console.log('properties rgbled: ' + resource.properties.rgbValue + ' color: ' + color);
            resource.properties.rgbValue = color;
            client.update(resource)
            .then(
                function(updateRes){
                    if(updateRes == resource){
                        console.log('updated resource');
                        process.exit(0);
                    }
                },
                function(error){
                    console.log('failed to update resource with error', error.message);
                }
            )
        },
        function(error){
            console.log('Failed to retrieve resource with error', error.message)
        }
    );
}

//updateRes({ resourcePath: '/a/rgbled1' }, [255, 0, 0]);

module.exports = updateRes;
