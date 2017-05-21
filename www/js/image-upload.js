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
    html.push('<div class="span text-center dropZone-hover">Drop image here</div>');
    return html.join('');
}

function getImageThumbnailHtml(src) {
//    return '<img src="' + src + '" alt="Image preview" class="thumbnail" style="max-width: ' + options.maxWidth + 'px; max-height: ' + options.maxHeight + 'px">';
    return '<img src="' + src + '" alt="Image preview" class="thumbnail img-responsive" >';
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

var options = {
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
    maxWidth: 250,
    maxHeight: 250,
    maxFileSizeKb: 2048
};

$(document).ready(function () {
    $imageUpload = $('.imageupload');
    $imageUploadInputFileName = $('#imageUploadInputFileName');
    $dropZone = $('#dropZone');
    $removeFileButton = $("#removeFileButton");
    $uploadFileButton = $("#imageUploadSubmitButton");
    $browseFileButton = $("#browseFileButton");
    
    $removeFileButton.css('display', 'none');
    $uploadFileButton.css('display', 'none');

    if (typeof (window.FileReader) == 'undefined') {
//        $dropZone.text('Не поддерживается браузером!');
        $imageUpload.prepend(getAlertHtml('FileReader does not supported'));
//        $dropZone.addClass('error');
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
//        $dropZone.removeClass('hover');
//        $dropZone.addClass('drop');
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
        $removeFileButton.css('display', 'none');
        $uploadFileButton.css('display', 'none');
        $browseFileButton.find('span').text('Browse');
    });

    $uploadFileButton.click(function () {
        $imageUpload.find('.alert').remove();

        $dropZone.find('img').remove();
        $dropZone.prepend(getDropZoneMessage());

        $imageUploadInputFileName.val('');
    });

    $browseFileButton.on('change', function () {
        $(this).blur();
        var myFile = $('#imageUploadInput').prop('files');
        console.log("browseFileButton: " + myFile[0].name);
        showImagePreview(myFile[0]);
    });

});

function showImagePreview(file) {
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
                $browseFileButton.find('span').text('Change');
                $removeFileButton.css('display', 'inline-block');
                $uploadFileButton.css('display', 'inline-block');
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