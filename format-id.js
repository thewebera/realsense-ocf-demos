var childProcess = require('child_process');
var cmd_curl = 'curl --noproxy "*" http://10.239.115.12:8000/api/oic/res';
function getLedId(ledNum, state) {
console.log('login getLedId time : ' + new Date);
    childProcess.exec(cmd_curl, function(err,stdout,stderr){
        if(err) {
            console.log('Failed to get led id with error:'+stderr);
        } else {
console.log('before parse time : ' + new Date);
            var data = JSON.parse(stdout);
console.log('after parse time : ' + new Date);
            data.forEach(function (item){
console.log('forEach time : ' + new Date);
               var target_href = ['/a/led', ledNum].join('')
               //console.log(target_href)
               if(item.links[0].href == '/a/led'){
                   console.log(item.links[0].href)
                   console.log(item.di)
                   var url = [item.links[0].href, '?di=', item.di].join('')
                   updateLedStatus(ledNum, url, state)
               }
           })
        }
    });
    console.log('logout updateLedStatus time: ' + new Date);
}


function updateLedStatus(ledNum, url, state) {
console.log('login updateLedStatus time: ' + new Date);
    if(state == 'on') {
        serverFile = './test/led-on.json'
    } else if(state == 'off'){
        serverFile = './test/led-off.json'
    } else {
        console.log('Error, no state output')
    }
console.log(url);
console.log(serverFile);
    childProcess.execFile('./test/oic-post', [url, serverFile], function(err, stdout, stderr){
//console.log('start LED: ' + new Date);
//    var cmd = ['curl -X POST --noproxy "*" -w "\nHTTP: %{http_code}\n" -H "Content-Type: application/json" -T ', serverFile, ' http://10.239.115.12:8000/api/oic', url].join('')
//    console.log('#########', cmd)
//    childProcess.exec(cmd, function(err, stdout, stderr){
        if(err) {
            console.log('Failed to update led status with error: '+stderr);
        } else {
            console.log('Turn', state, ['led', ledNum].join(''))
        }
    })
console.log('logout updateLedStatus time: ' + new Date);
}

console.log('start time: ' + new Date);
getLedId(1, 'on');
//getLedId(1, 'off');
