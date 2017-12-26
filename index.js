/**
 * Created by johnny on 2017/12/25.
 */
var fs          = require('fs'),
    path        = require('path'),
    through     = require('through2-concurrent'),
    gutil       = require('gulp-util'),
    tinify      = require('tinify'),
    prettyBytes = require('pretty-bytes'),
    PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-tinyimg';

function tinypng(apiKey, file) {
    var validExtensions = ['.png', '.jpg', '.jpeg'];

    if(!apiKey) {
        throw new PluginError(PLUGIN_NAME, 'We can\'t upload images without your API Key');
    }
    return through.obj(function(file, enc, cb) {
        if(file.isNull()) {
            cb(null, file);
            return;
        }


        if(file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        if(validExtensions.indexOf(path.extname(file.path)) === -1) {
            gutil.log(PLUGIN_NAME + ': Skipping unsupported image ' + file.path);
            cb(null, file);
            return;
        }
        var prevLength = file.contents.length;
        function tiny(contents,retry) {
            tinify.key=apiKey();
            tinify.fromBuffer(contents).toBuffer(function(err, resultData) {
                if (err instanceof tinify.AccountError) {
                    console.log("The error message is: " + err.message);
                    if(retry){
                    tiny(contents,false);
                    }else{
                        cb(null, file);
                    }
                    // Verify your API key and account limit.
                }  else {
                    // Something else went wrong, unrelated to the Tinify API.

                    if(err){
                        cb(null, file);
                    }else{
                        fs.unlink(file.path,function (error) {


                        });
                        file.contents = resultData;
                        gutil.log('gulp-tinypng: ', gutil.colors.green('✔ ') + file.relative + ' (saved ' +
                            prettyBytes(prevLength - resultData.length) + ' - ' + ((1 - resultData.length / prevLength) * 100).toFixed(0) + '%)');
                        cb(null, file);
                        return true;
                    }
                }
                return false;
            })
        }
        tiny(file.contents,true);

    });
}
// Exporting the plugin main function
module.exports = tinypng;