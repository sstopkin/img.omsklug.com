global.Promise = require('bluebird');
var cluster = require('cluster');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var https = require('https');
var config = require('./config.js');
var url = require('url');
var fs = require('fs');
var multer = require('multer');
var crypto = require('crypto');

// determine wether we need to use `http` or `https` libs
var httpLib = http;
// if ( /^https/.test(config.defineUrl) ) {
// 	httpLib = https;
// }

// app.use(logger('dev'));

app.use('/', express.static(config.WWW));

//for save compatibility with old img.omsklug.com
app.use('/i', express.static(config.OLD_IMAGES_PATH));

app.get('/health', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    res.setHeader('Content-Type', 'application/json');
    var data = {
        message: 'healthy'
    };
    res.status(200).send(JSON.stringify(data));
});

var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, config.IMAGES_TARGET_PATH);
    },
    filename: function (request, file, callback) {
        console.log(file);
        callback(null, getNewFilename(file.originalname));
    }
});

function getNewFilename(text) {
//  var hash = crypto.createHash('sha256').update(text).digest('base64');
    return crypto.createHash('sha256').update(text + new Date().getTime()).digest('hex');
}

var upload = multer({
//     dest: config.IMAGES_TARGET_FOLDER,
    storage: storage,
    limits: {
        fieldNameSize: 50,
        files: 1,
        fields: 5,
        fileSize: 1024 * 1024
    }
}).single('file');

//app.post('/upload', function (req, res) {
//    upload(req, res, function (err) {
//        if (err) {
//            // An error occurred when uploading
//            console.log('error' + err);
//        }
//    });
//    // console.log(req);
////    console.log(req.body, 'Body');
////    console.log(req.file, 'file');
//    res.status(200).end();
//});

app.post('/api/upload', upload, (req, res) => {
    if (req.file !== undefined) {

        // once uploaded save the user data along with uploaded photo path to the database.
        var metadata = {
            'original_filename': req.file.originalname,
            'filename': req.file.filename,
            'mime_type': req.file.mimetype,
            'filesize': req.file.size,
            'ip': req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket.remoteAddress,
            'creation_date': new Date().getTime(),
            'client_user_agent': req.headers['user-agent']
        };
        res.json(metadata);

        fs.writeFile(config.METADATA_PATH + metadata.filename, JSON.stringify(metadata), function (err) {
            if (err) {
                console.log(err);
            }
        });
    } else {
        res.json({
            'message': 'Unable to Upload file'
        });
    }
});

// fieldname - Field name specified in the form
// originalname - Name of the file on the user's computer
// name - Renamed file name
// encoding - Encoding type of the file
// mimetype - Mime type of the file
// path - Location of the uploaded file
// extension - Extension of the file
// size - Size of the file in bytes
// truncated - If the file was truncated due to size limitation
// buffer - Raw data (is null unless the inMemory option is true)


// upload(req, res, function(err) {
// sharp(req.files.buffer)
// .resize(400, 400)
// .max()
// .toFormat('jpeg')
// .toFile(config.IMAGES_TARGET_FOLDER + "picture.jpg", function(err) {
//     res.send(true);
// });
// })


//
// res.writeHead(200, {
//     "Content-Type": "application/json"
// });
// var result = {
//     status: "1",
//     message: err
// }
// res.write(JSON.stringify(result));
// res.end();
//     console.log('An error has occured: \n' + err);
// });
// once all the files have been uploaded, send a response to the client
// form.on('end', function() {
//     res.writeHead(200, {
//         "Content-Type": "application/json"
//     });
//     var result = {
//         status: "0",
//         file: config.IMAGES_TARGET_PATH + uploaded_file
//     }
//     res.write(JSON.stringify(result));
//     res.end();
// });

app.get('/api/uploads/:file', function (req, res) {
    file = req.params.file;
    var img = fs.readFileSync(config.IMAGES_TARGET_PATH + file);
    res.writeHead(200, {
        'Content-Type': 'image/jpg'
    });
    res.end(img, 'binary');
});

app.get('/api/meta/:file', function (req, res) {
    file = req.params.file;
    var img = fs.readFileSync(config.METADATA_PATH + file);
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(img, 'binary');
});

// if (cluster.isMaster) {
//     var numWorkers = require('os').cpus().length;
//     var worker;
//     console.log('Master cluster setting up ' + numWorkers + ' workers...');
//     for (var i = 0; i < numWorkers; i++) {
//         worker = cluster.fork();
//     }
//     cluster.on('online', function(worker) {
//         console.log('Worker ' + worker.process.pid + ' is online');
//     });
//
//     cluster.on('exit', function(worker, code, signal) {
//         console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
//         console.log('Starting a new worker');
//         cluster.fork();
//     });
// } else {
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Started: " + new Date());
    console.log("Process: (pid " + process.pid + ") listening at http://%s:%s", host, port);
});
