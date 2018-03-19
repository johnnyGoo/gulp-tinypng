var gulp = require('gulp');
var tinify = require('./index');
var moment = require('moment');
var keys=require('./keys');

var fs = require('fs');
var file = 'cache.json';
var fileData;
const MAX_COUNT_PER_KEY = 500;
function initData() {
    return {keys: [], currentKey: 0, datetime: moment().subtract(-1, 'months').format()};
}

try {
    fileData = JSON.parse(fs.readFileSync(file));
} catch (err) {
    fileData = initData();
}
if (moment().unix() > moment(fileData.datetime).unix()) {
    //到期后重置数据
    fileData = initData();
}

function checkKey(fileData, key) {
    for (var i = 0; i < fileData.keys.length; i++) {
        var keyobj = fileData.keys[i];
        if (keyobj.key === key) {
            return true;
        }
    }
    return false;
}

for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (checkKey(fileData, key) === false) {
        fileData.keys.push({key: key, count: MAX_COUNT_PER_KEY});
    }
}


function limitReached(key) {

    
}


function getKey() {
    var keyobj = fileData.keys[fileData.currentKey];
    if (keyobj.count > 0) {
        keyobj.count = keyobj.count - 1;
        return keyobj.key;
    } else {
        if (fileData.currentKey < fileData.keys.length - 1) {
            fileData.currentKey++;
            return getKey();
        } else {
            console.log('key empty');
            return false;
        }

    }
}

gulp.task('tinify', function () {
    gulp.src('./img/**/*')
        .pipe(tinify(getKey,limitReached))
        .pipe(gulp.dest('dist'))
        .on('end', function () {
            //处理完成之后 保存缓存文件
           // console.log(fileData);
            fs.writeFile(file, JSON.stringify(fileData),function (err) {
                if(err) throw err;
               // console.log('saved cache file')
                
            });
        });
});


gulp.task('default', ['tinify']);
