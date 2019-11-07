const router = require('express').Router();
module.exports = router;

const multer = require('multer');
const fs = require('fs');


router.get('/test',function (req,res) {
    let form = fs.readFileSync('./res/1.html', {encoding: 'utf8'});
    res.send(form);
});

router.get('/test01',function (req,res) {
    fs.readFile('./upload/logsTrain/0001.json', 'utf-8', function (err, data) {
        // console.log(JSON.parse(data).logs[1].TestName);
        let history=changeToJson(data);
        console.log(JSON.parse(history).logs[0]);
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});
            //res.end(data);
            res.end(data);
        }
    });
});

//创建文件夹
let uploadFolder = __dirname + '/../upload';
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
        cb(null, file.fieldname + '-' + Date.now());
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});
const uploads = multer({storage: storage}).array('file');

router.post('/upload', upload.single('file'), function (req, res) {
    res.send('successfully upload!');
});

router.post('/uploads',function (req,res,next) {
    uploads(req, res, function (err) {
        if (err) {
            console.error('1.[System] ' + err.message);
            res.end('上传失败');
        } else {
            //循环处理
            let imgPath=[];
            req.files.forEach(function (i) {
                //获取临时文件的存储路径
                imgPath.push(i.path);
                console.log("i.path:",i.path)
            });

            //所有文件上传成功
            //回复信息
            let response = {
                message: 'Files uploaded successfully',
                imgPath
            };
            //返回
            res.end(JSON.stringify(response));
        }
    });
});

function changeToJson(str){
    let tmp=str.substring(0,str.length-1);
    tmp='{"logs": ['+tmp+']}';
    return tmp;
}