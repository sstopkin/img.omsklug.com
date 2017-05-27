function getAlertHtml(message) {
    var html = [];
    html.push('<div class="alert alert-danger alert-dismissible">');
    html.push('<button type="button" class="close" data-dismiss="alert">');
    html.push('<span>&times;</span>');
    html.push('</button>' + message);
    html.push('</div>');
    return html.join('');
}

function getDropZoneMessage() {
    var html = [];
    html.push('<div class="jumbotron1" style="border: 4px double black;">Drop image here</div>');
    return html.join('');
}

function getImageThumbnailHtml(src) {
//    return '<img src="' + src + '" alt="Image preview" class="thumbnail" style="max-width: ' + options.maxWidth + 'px; max-height: ' + options.maxHeight + 'px">';
    var html = [];
    html.push('<div class="wrapper">');
    html.push('<img src="' + src + '" alt="Image preview" class="thumbnail center-block">');
    html.push('</div>');
    return html.join('');
}

function getFileExtension(path) {
    return path.substr(path.lastIndexOf('.') + 1).toLowerCase();
}

function isValidImageFile(file, callback) {
    // Check file size.
    if (file.size / 1024 > options.maxFileSizeKb)
    {
        callback(false, 'File is too large (max ' + options.maxFileSizeKb + 'kB).');
        return;
    }

    // Check image format by file extension.
    var fileExtension = getFileExtension(file.name);
    if ($.inArray(fileExtension, options.allowedFormats) > -1) {
        callback(true, 'Image file is valid.');
    } else {
        callback(false, 'File type is not allowed.');
    }
}

var $imageUpload;
var $imageUploadInputFileName;
var $dropZone;
var $removeFileButton;
var $uploadFileButton;
var $browseFileButton;
var $progressBar;
var tmp_file;
var $uploadedFileInfo;
var $buttonBlock;
var $browseBlock;

var options = {
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
    maxFileSizeKb: 10240,
    APP_URL: "http://localhost:8080"
};

$(document).ready(function () {
    $imageUpload = $('.imageupload');
    $imageUploadInputFileName = $('#imageUploadInputFileName');
    $dropZone = $('#dropZone');
    $cha = $("#removeFileButton");
    $removeFileButton = $("#removeFileButton");
    $uploadFileButton = $("#imageUploadSubmitButton");
    $browseFileButton = $("#browseFileButton");
    $progressBar = $(".progress");
    $uploadedFileInfo = $("#uploadedFileInfo");
    $buttonBlock = $('#buttonBlock');
    $browseBlock = $('#browseBlock');

    if (typeof (window.FileReader) === 'undefined') {
        $imageUpload.prepend(getAlertHtml('FileReader does not supported by browser'));
    } else {
        $dropZone.prepend(getDropZoneMessage());
    }

    $dropZone[0].ondragover = function () {
        $dropZone.addClass('hover');
        return false;
    };

    $dropZone[0].ondragleave = function () {
        $dropZone.removeClass('hover');
        return false;
    };
    $dropZone[0].ondrop = function (event) {
        $(this).blur();
        event.preventDefault();
        $dropZone.removeClass('hover');
        var file = event.dataTransfer.files[0];
        console.log("dropZone: " + file.name);
        showImagePreview(file);
    };

    $removeFileButton.click(function () {
        $imageUpload.find('.alert').remove();
        $dropZone.find('img').remove();
        $dropZone.find('div').remove();

        $dropZone.prepend(getDropZoneMessage());
        $imageUploadInputFileName.val('');
        $buttonBlock.css('display', 'none');
        $browseBlock.css('display', 'inline');
    });

    $uploadFileButton.click(function () {
        $buttonBlock.css('display', 'none');
        $browseFileButton.css('display', 'none');
        upload(tmp_file);
    });

    $browseFileButton.on('change', function () {
        $(this).blur();
        var myFile = $('#imageUploadInput').prop('files');
        console.log("browseFileButton: " + myFile[0].name);
        showImagePreview(myFile[0]);
    });
});

function showImagePreview(file) {
    tmp_file = file;
    $imageUpload.find('.alert').remove();
    $dropZone.find('img').remove();

    isValidImageFile(file, function (isValid, message) {
        if (isValid) {

            var fileReader = new FileReader();

            fileReader.onload = function (e) {
                // Show thumbnail and remove button.
                $dropZone.find('div').remove();
                $dropZone.prepend(getImageThumbnailHtml(e.target.result));
//                    $fileTab.prepend(getImageThumbnailHtml(e.target.result));
                $buttonBlock.css('display', 'table');
                $browseBlock.css('display', 'none');
                $imageUploadInputFileName.val(file.name);
            };

            fileReader.onerror = function () {
                $imageUpload.prepend(getAlertHtml('Error loading image file.'));
                $imageUploadInputFileName.val('');
            };

            fileReader.readAsDataURL(file);
        } else {
            $imageUpload.prepend(getAlertHtml(message));
            $browseFileButton.find('span').text('Browse');
            $imageUploadInputFileName.val('');
        }
        $browseFileButton.prop('disabled', false);
    });
}

function upload(file) {
    var data = new FormData();
    data.append('file', file);

    $progressBar.css('display', 'block');
    var xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            var valeur = (e.loaded / e.total) * 100;
            var progressBar = $progressBar.find('.progress-bar');
            progressBar.css('width', valeur + '%').attr('aria-valuenow', valeur);
            progressBar.text(valeur + '%');
        }
    };
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) { //XMLHttpRequest.DONE
            responsePage($.parseJSON(xhr.response));
        }
    };
    xhr.open("POST", options.APP_URL + '/api/upload', true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send(data);
}

function responsePage(data) {
    $uploadedFileInfo.css('display', 'block');
    var html = [];
    var url = options.APP_URL + '/api/uploads/' + data.filename;
    html.push('<ul class="list-group">');
    html.push('<li class="list-group-item"><a href="' + url + '">' + url + '</a></li>');
    html.push('<li class="list-group-item">' + 'Image: ' + data.filesize + ' / ' + data.mime_type + '</li>');
    html.push('<li class="list-group-item">' + 'Client: ' + data.ip + ' / ' + data.client_user_agent + '</li>');
    html.push('<li class="list-group-item">' + 'Creation date: ' + timeConverter(data.creation_date) + '</li>');

    html.push('</ul>');
    $uploadedFileInfo.prepend(html.join(''));
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + '-' + month + '-' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}