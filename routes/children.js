const router = require('express').Router();
module.exports = router;
const multer = require('multer');
const fs = require('fs');

let childId = null;
//创建文件夹
let uploadFolder = __dirname + '/../upload/img';
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
        cb(null, childId);
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});

function func(req, res, next) {
    childId = req.body.childId;
    console.log(childId);
    next();
}

router.post('/uploadImg', func, upload.single('file'), function (req, res) {
    res.send('success');
});

router.get('/downloadImg', function (req, res) {
    let mchildId = req.query.childId;
    let path = './upload/img/' + mchildId;
    //判断文件是否存在
    let isFileExisted = function (filePath) {
        return new Promise(function (resolve, reject) {
            fs.access(filePath, (err) => {
                if (err) {
                    reject('notExisted');
                } else {
                    resolve('existed');
                }
            })
        })
    };
    isFileExisted(path).then((e) => {
        console.log(e);
        fs.readFile(path, '', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('existed');
                // res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                res.end(data);
            }
        });
    }, (e) => {
        console.log(e);
        res.end('notExisted');
    });
});


router.post('/addChild', function (req, res) {
    let sqlCmd = 'INSERT INTO children(id,sessionId,childName,age,gender,leftEye,rightEye,myopia) VALUES(0,?,?,?,?,?,?,?)';
    let sqlParams = [req.body.sessionId, req.body.childName, req.body.age, req.body.gender, req.body.leftEye, req.body.rightEye, req.body.myopia];
    // console.log(sqlCmd,sqlParams);
    sqlQuery.query(sqlCmd, sqlParams).then((r) => {
        res.send(r);
    }, (err) => {
        res.send('err');
        console.log('addChild err.');
    });
});

router.get('/delChild', function (req, res) {
    //需要将传入的id 字符型转换为int型
    let intId = parseInt(req.query.id);
    let sqlCmd = "DELETE FROM children where id=" + "'" + intId + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        res.send(response);
    }, () => {
        console.log('delChild err.');
        res.end();
    });
});

router.post('/updateChild', function (req, res) {
    let sqlCmd = 'update children set sessionId =?,childName=?,age=?,gender=?,leftEye=?,rightEye=?,myopia=? where binary id = ?';
    let sqlParams = [req.body.sessionId, req.body.childName, req.body.age, req.body.gender, req.body.leftEye, req.body.rightEye, req.body.myopia, req.body.id];
    sqlQuery.query(sqlCmd, sqlParams).then((response) => {
        res.send(response);
    }, (err) => {
        res.end();
        console.log(err, 'updateChild err.');
    });
});

router.get('/fetchAllChildren', function (req, res) {
    let sqlCmd = "select * from children where binary sessionId=" + "'" + req.query.sessionId + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        res.send(response);
    }, () => {
        res.end();
        console.log('fetchAllChild errCode 00.');
    });
});

router.get('/fetchChild', function (req, res) {
    let intId = parseInt(req.query.id);
    let sqlCmd = "select * from children where id=" + "'" + intId + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        //检查连续训练天数，如果不连续，keepOn则置为0
        let dt = response[0].uploadDate;
        let date = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-').replace(/(?=\b\d\b)/g, '0');
        let currentDate = new Date();
        let currentDateF = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()].join('-').replace(/(?=\b\d\b)/g, '0');
        // console.log(currentDateF,date);

        if (dateInterval(date, currentDateF) > 1) {
            let keepOn = 0;
            let sqlCmd = 'update children set keepOn=? where id=?';
            let sqlParams = [keepOn, req.query.id];
            sqlQuery.query(sqlCmd, sqlParams).then((e) => {
                response[0].keepOn = 0;
                res.send(response);
            });
        } else {
            res.send(response);
        }
    }, () => {
        console.log('fetchChild err.');
        res.send('err');
    });
});

function dateInterval(date1, date2) {
    let sDate = new Date(date1);
    let now = new Date(date2);
    let days = now.getTime() - sDate.getTime();
    let day = parseInt(days / (1000 * 60 * 60 * 24));
    return day;
}