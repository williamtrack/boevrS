var fs = require("fs");

let str = '';

function getDirTree(inputPath, callback) {
    let files = fs.readdirSync(inputPath);
    for (file of files) {
        let filePath = inputPath + '//' + file;
        let fileState = fs.statSync(filePath);
        if (fileState.isDirectory()) { // 如果是目录 递归
            getDirTree(filePath, function () {
            })
        } else {
            // console.log(filePath)
            str = str + toPath(filePath) + "\",\"";
        }
    }
    callback(toJsonStr(str)) && callback.call();
}

function toJsonStr(ss) {
    let tmp = ss.substring(0, ss.length - 2);
    tmp = '{"files": ["' + tmp + ']}';
    return tmp;
}
function toPath(ss) {
    let tmp = ss.substring(16, ss.length);
    return tmp;
}

module.exports = getDirTree;