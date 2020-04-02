var fs = require("fs");

//path模块，可以生产相对和绝对路径
var path = require("path");

//配置远程路径
var remotePath = "./";

//获取当前目录绝对路径，这里resolve()不传入参数
var filePath = path.resolve();

//读取文件存储数组
var fileArr = [];
let str = "\"files\":[\"";

this.getDir=function getDirTree( inputPath, callback){
    let files = fs.readdirSync(inputPath);
    for(file of files){
        let filePath = inputPath + '/' + file;
        let fileState = fs.statSync(filePath);
        if(fileState.isDirectory()){ // 如果是目录 递归
            getDirTree(filePath)
        }else{
            // console.log(filePath)
            str=str+filePath+"\",\"";
        }
    }
    callback && callback.call();
}

getDirTree(__dirname + '\\upload\\unity', function(){
    console.log(__dirname + '\\upload\\unity');
    console.log(str);
});

exports.getDirTree = getDirTree();