const router = require('express').Router();
const fs = require('fs');
const multer = require('multer');
let sn=null;

//创建文件夹
let uploadFolder = __dirname + '/../upload/pic';
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
        cb(null, sn);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});
function func(req,res,next){
    console.log(req.query.sn);
    sn=req.query.sn;
    next();
}

router.post('/upload',func,upload.single('file'), function (req, res) {
    let a=sn+"master";
    global.wsCtrl[a].send('picReady');
    res.send('success');
});


router.get('/getPic', function (req, res) {
    res.writeHead(200,{'Content-Type':'image/jpg'});
    let picName=req.query.sn;
    let pic = fs.readFileSync('./upload/pic/'+picName);
    res.write(pic);
    res.end();
});

module.exports = router;