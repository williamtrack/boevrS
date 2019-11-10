const router = require('express').Router();
const fs = require('fs');
const multer = require('multer');
let childId=null;


//创建文件夹
let uploadFolder = __dirname + '/../upload/logsTrain';
let createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};
createFolder(uploadFolder);
// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        // cb(null, file.fieldname + '-' + Date.now()+'.jpg');
        cb(null, childId);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});
function func(req,res,next){
    console.log(req.query.childId);
    childId=req.query.childId;
    next();
}

router.post('/upload',func,upload.single('file'), function (req, res) {
    console.log('yes');
    res.send('success');
});


router.get('/getLogsTrain',function (req,res) {
    let childId=req.query.childId;
    let path='./upload/logsTrain/'+childId;
    fs.readFile(path, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
            res.end(changeToJson(data));
        }
    });
});

function changeToJson(str){
    // let tmp=str.substring(0,str.length-1);
    // if(tmp[tmp.length-1]!=']'){
    //     tmp=tmp.substring(0,tmp.length-1);
    // }
    let tmp=str.substring(0,str.length-2);
    tmp='{"logs": ['+tmp+']}';
    // console.log(tmp);
    return tmp;
}

module.exports = router;