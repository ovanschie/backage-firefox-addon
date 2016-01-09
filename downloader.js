'use strict';

const {XMLHttpRequest}  = require('sdk/net/xhr');

var { Cc, Ci, Cu, Cm }  = require('chrome');
var ds                  = require('sdk/fs/path').sep;
var profilePath         = require('sdk/system').pathFor('ProfD');
var fileIO              = require('sdk/io/file');

function downloadFileSync(packageName, version){

    packageName     = packageName.toLowerCase();
    var targetDir   = profilePath + ds + 'backage-scripts' + ds + packageName;
    var url         = 'https://cdn.jsdelivr.net/g/' + packageName + '@' + version;

    fileIO.mkpath(targetDir);

    console.log('downloading ' + url + ' to ' + targetDir);

    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if (request.status === 200) {
        console.log('download complete');

        var newFile = fileIO.open(targetDir + ds + version + '.js', 'w');

        if (!newFile.closed) {
          newFile.write(request.responseText);
          newFile.close();

          return true;
        }

        return false;
    }
    else{
        console.log('download failed');
        return false;
    }
}

exports.fileDownloader = downloadFileSync;