const router = require('express').Router();
module.exports = router;
const multer = require('multer');
const fs = require('fs');

//检查或创建文件夹
let uploadFolder = __dirname + '/../upload/app/';
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
        cb(null, "launcher");
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});
router.post('/uploadApp', upload.single('file'), function (req, res) {
    res.send('successfully upload!');
});

router.get('/getAppInfo', function (req, res) {
    let path = './upload/app/version';
    //函数：判断文件是否存在
    let isFileExisted = function (filePath) {
        return new Promise(function (resolve, reject) {
            fs.access(filePath, (err) => {
                if (err) {
                    reject('err');
                } else {
                    resolve('existed');
                }
            })
        })
    };
    isFileExisted(path).then((e) => {
        // console.log(e);
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                // console.log('existed');
                //string to json
                let version = JSON.parse(changeToJsonString(data));
                let length = version.index.length;
                let lastVersion = version.index[length - 1];
                //json to string
                let abc=JSON.stringify(lastVersion);
                // console.log(abc);
                //如果不指定utf-8,则会导致返回中文有问题
                res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
                res.end(abc);
            }
        });
    }, (e) => {
        // console.log('notExisted');
        res.end('notExisted');
    });
});

router.post('/updateAppInfo', function (req, res) {
    let path = './upload/app/version';
    // let index = JSON.stringify(req.body);
    // let indexFormat = index + ",\n";
    // // console.log(indexFormat);
    // //同步写文件
    // fs.appendFileSync(path, indexFormat);
    let infoFormat=req.body.info+"\"url\":"+"\"https://boevr.cn/version/getApp\"},\n";
    fs.appendFileSync(path, infoFormat);
    res.end();
});

router.get('/getApp', function (req, res) {
    fs.readFile('./upload/app/launcher', function (err, data) {
        // console.log(data);
        if (err) {
            console.log(err);
            res.end();
        } else {
            // res.writeHead(200,{'Content-Type':'image/jpeg'});
            res.send(data);
        }
    });
});


function changeToJsonString(str) {
    let tmp = str.substring(0, str.length - 2);
    tmp = '{"index": [' + tmp + ']}';
    // console.log(tmp);
    return tmp;
}