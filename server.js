global.Promise = require('bluebird');
var cluster = require('cluster');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var https = require('https');
var config = require('./config.js');
var url = require('url');
var sharp = require('sharp');
var fs = require('fs');
var multer = require('multer');

// determine wether we need to use `http` or `https` libs
var httpLib = http;
// if ( /^https/.test(config.defineUrl) ) {
// 	httpLib = https;
// }

// app.use(logger('dev'));

// app.use(express.static(path.join(__dirname, 'www')));
app.use('/', express.static(path.join(__dirname, 'www')));

//used for save compatibility with old img.omsklug.com
app.use('/i', express.static(path.join(__dirname, 'old_images')));

app.get('/health', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    res.setHeader('Content-Type', 'application/json');
    var data = {
        message: 'healthy'
    };
    res.status(200).send(JSON.stringify(data));
});

var storage = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, config.IMAGES_TARGET_FOLDER);
    },
    filename: function(request, file, callback) {
//        console.log(file);
        callback(null, file.originalname);
    }
});

var upload = multer({
     dest: config.IMAGES_TARGET_FOLDER,
//    storage: storage,
    limits: {
        fieldNameSize: 50,
        files: 1,
        fields: 5,
        fileSize: 1024 * 1024
    }
}).single('file');

app.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            console.log('error' + err);
        }
    });
    // console.log(req);
//    console.log(req.body, 'Body');
//    console.log(req.file, 'file');
    res.status(200).end();
});


// app.post('/upload', upload.single('file'), function(req, res) {
//   // console.log(req);
//     console.log(req.body, 'Body');
//     console.log(req.file, 'files');
//     res.status(200).end();
// })
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

//show files
app.get('/uploads/:file', function(req, res) {
    file = req.params.file;
    var img = fs.readFileSync(__dirname + "/uploads/" + file);
    res.writeHead(200, {
        'Content-Type': 'image/jpg'
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
var server = app.listen(8080, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("Started: " + new Date())
    console.log("Process: (pid " + process.pid + ") listening at http://%s:%s", host, port)

})
// }

// 	})
