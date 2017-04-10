// Copyright (c) 2016 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

'use strict';

let pt = require('person-tracking');
var childProcess = require('child_process');
var colors = require('colors');
let trackerOptions = {
  skeleton: {
    enable: true,
  },
  tracking: {
    enable: true,
    enableHeadBoundingBox: true,
  },
  recognition: {
    enable: true,
    policy: 'standard',
    useMultiFrame: false,
  },
  gesture: {
    enable: true,
    enableAllGestures: true,
  },
  personFace: {
    enableFaceLandmarks: true,
    enableHeadPose: true,
  },
};

let cameraOptions = {
  color: {
    width: 640,
    height: 480,
    frameRate: 30,
    isEnabled: true,
  },
  depth: {
    width: 320,
    height: 240,
    frameRate: 30,
    isEnabled: true,
  },
};

let tracker = null;
let registerOngoing = false;
let registerPerformed = false;
let intervalId = null;
let cmd_curl = 'curl http://192.168.12.230:8000/api/oic/res';
let lastModifyTime;
let ledList = {};
let led1LastChangeTime;
let led2LastChangeTime;
let led3LastChangeTime;
let led4LastChangeTime;
function initialLED() {
    childProcess.exec(cmd_curl, function(err,stdout,stderr){
        if(err) {
            console.log('Failed to get led id with error:'+stderr);
            process.exit();
        } else {
            var data = JSON.parse(stdout);
            data.forEach(function (item){
               if(item.links[0].href.indexOf('/a/led') > -1){
                   ledList[item.links[0].href] = item.di;  
               }
           })
        }
    });
}
console.log(new Date);
initialLED();
console.log(new Date);
let led1FlgOld = false;
let led2FlgOld = false;
let led3FlgOld = false;
let led4FlgOld = false;
function controlLEDbyPersons(persons) {
  let led1Flg = false;
  let led2Flg = false;
  let led3Flg = false;
  let led4Flg = false;
  persons.forEach((person) => {
    let distance = 0;
    if(person.trackInfo && person.trackInfo.center){
      distance = person.trackInfo.center.worldCoordinate.z;
    }
    if(distance <= 1 && distance > 0) {
      console.log(colors.blue(distance));
      led1Flg = true;
    }
    if(distance <= 2 && distance > 1) {
      console.log(colors.red(distance));
      led2Flg = true;
    }
    if(distance <= 3 && distance > 2) {
      console.log(colors.white(distance));
      led3Flg = true;
    }
    if(distance <= 4 && distance > 3) {
      console.log(colors.green(distance));
      led4Flg = true;
    }
  });
  if(led1FlgOld !== led1Flg) {
    if (led1Flg){
      console.log(('update led 1 with' + led1Flg).blue.bold);
    } else {
      console.log(('update led 1 with' + led1Flg).blue.inverse);
    }
    updateLedStatus(2, '/a/led2', led1Flg); led1FlgOld = led1Flg;
  }
  if(led2FlgOld !== led2Flg) {
    if (led2Flg){
      console.log(('update led 2 with' + led2Flg).red.bold);
    } else {
      console.log(('update led 2 with' + led2Flg).red.inverse);
    }
    updateLedStatus(12, '/a/led12', led2Flg); led2FlgOld = led2Flg;
  } 
  if(led3FlgOld !== led3Flg) {
    if (led3Flg){
      console.log(('update led 3 with' + led3Flg).white.bold);
    } else {
      console.log(('update led 3 with' + led3Flg).white.inverse);
    }
    updateLedStatus(7, '/a/led7', led3Flg); led3FlgOld = led3Flg;
  }
  if(led4FlgOld !== led4Flg) {
    if (led4Flg){
      console.log(('update led 4 with' + led4Flg).green.bold);
    } else {
      console.log(('update led 4 with' + led4Flg).green.inverse);
    }
    updateLedStatus(9, '/a/led9', led4Flg); led4FlgOld = led4Flg;
  }
}

pt.createPersonTracker(trackerOptions, cameraOptions).then((personTracker) => {
  tracker = personTracker;
  tracker.on('persontracked', (result) => {
    controlLEDbyPersons(result.persons);
  });
  return tracker.start();
  //operate('start', 5000, 'Start');
  //operate('stop', 150000, 'Stop');
}).catch((e) => {
  console.log('Failed to start, ', e);
  clearInterval(intervalId);
});

function registerTestWork() {
  tracker.on('persontracked', function(result) {
    result.persons.forEach(function(person) {
      trackingTest(person);
    });
  });
}

function trackingTest(person) {
  // console.log('-- tracking result begin');
  let info = person.trackInfo;
  if (!info)
    return;
  let center = info.center;
  let seg = info.segmentationMask;

  tracker.personTracking.startTrackingPerson(person.trackInfo.id).then(function() {
    //console.log('-- successfully started tracking person');
  }).catch(function(e) {
    console.log('-- failed tracking person');
  });

  console.log('--id:' + info.id);
  if (center) {
    //console.log('--center: imageCoordinate and confidence:', center.imageCoordinate.x,
    //    center.imageCoordinate.y, center.imageConfidence);
    //console.log('--center: worldCoordinate and confidence:', center.worldCoordinate.x,
    //    center.worldCoordinate.y, center.worldCoordinate.z, center.worldConfidence);
    if(center.worldCoordinate.z) {
      controlLEDbyDistance(center.worldCoordinate.z);
    }
  }
  if (seg) {
    console.log('--segmentation: width/height', seg.width, seg.height, seg.maskData);
  }
  //console.log('-- tracking result end');
}

function operate(op, time, des) {
  setTimeout(function() {
    console.log('------------', des);
  }, time);
  // eslint-disable-next-line
  let theArgs = arguments;
  setTimeout(function() {
    if (op === 'start') {
      registerTestWork();
    } else if (op === 'stop') {
      clearInterval(intervalId);
    }
    // eslint-disable-next-line
    tracker[op].apply(tracker, Array.prototype.slice.call(theArgs, 3)).then(function() {
      console.log('------------ ', op, ' done');
    }).catch(function(e) {
      console.log('------------', op, ' failed');
    });
  }, time + 500);
}

//function getLedId(ledNum, state) {
//    childProcess.exec(cmd_curl, function(err,stdout,stderr){
//        if(err) {
//            console.log('Failed to get led id with error:'+stderr);
//        } else {
//            var data = JSON.parse(stdout);
//            data.forEach(function (item){
//               var target_href = ['/a/led', ledNum].join('')
//               //console.log(target_href)
//               if(item.links[0].href == '/a/led'){
//                   console.log(item.links[0].href)
//                   console.log(item.di)
//                   var url = [item.links[0].href, '?di=', item.di].join('')
//                   updateLedStatus(ledNum, url, state)
//               }
//           })
//        }
//    });
//}


function updateLedStatus(ledNum, url, state) {
    if(ledNum === 1 && new Date - led1LastChangeTime <= 1000) {
      return; 
    }
    if(ledNum === 2 && new Date - led2LastChangeTime <= 1000) {
      return; 
    }
    if(ledNum === 3 && new Date - led3LastChangeTime <= 1000) {
      return; 
    }
    if(ledNum === 4 && new Date - led4LastChangeTime <= 1000) {
      return; 
    }
    let serverFile;
    if(state) {
        serverFile = './test/led-on.json'
    } else {
        serverFile = './test/led-off.json'
    }
    url = [url, '?di=', ledList[url]].join('');
//console.log(url);
    //childProcess.execFile('./test/oic-post', [url, serverFile], function(err, stdout, stderr){
console.log("./test/oic-put "+ url + " " + serverFile);
    childProcess.execFile('./test/oic-put', [url, serverFile], function(err, stdout, stderr){
        if(err) {
            console.log('Failed to update led status with error: '+stderr);
        } else {
           // console.log('Turn', state, ['led', ledNum].join(''))
        }
    })
}

