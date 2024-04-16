

// load.js
// from Greggman
// https://raw.githubusercontent.com/greggman/three-load-shaders/master/load.js

function loadFile(url, responseType, callback) 
{
    var request = new XMLHttpRequest();
    request.responseType = responseType || "text";
    if (request.overrideMimeType) {
        request.overrideMimeType('text/plain');
    }

    function handleLoad(e) {
        if (request.responseType == "text")
            callback(null, request.responseText);
        else 
            callback(null, request.response);
    }

    function handleError(e) {
        callback(e);
    }

    // request.open('get', url + "?t=" + (new Date()).getTime(), true);
    request.open('get', url, true);
    request.addEventListener('load', handleLoad, false);
    request.addEventListener('error', handleError, false);
    request.send();
}

function loadFiles(path, files, responseType, callback)
{
    var numToLoad = 0;
    var loadedFiles = {};

    function callbackOnce(content)
    {
        if (callback)
        {
            var cb = callback;
            callback = undefined;
            return cb(content);
        }
    };

    files.forEach(function(file)
    {
        ++numToLoad;
        loadFile(path+file, responseType, function(err, content)
        {
            if (err)
            {
                return callbackOnce(err);
            }
            // var fileNameArray = file.split('/');
            // var fileName = fileNameArray[Math.max(0, fileNameArray.length - 1)];
            loadedFiles[file] = content;
            --numToLoad;
            if (numToLoad == 0)
            {
                callbackOnce(loadedFiles);
            }
        })
    });
}