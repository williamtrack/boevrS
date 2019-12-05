const router = require('express').Router();
const fs = require('fs');
const multer = require('multer');
let sessionId = null;

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
        cb(null, sessionId);
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});

function func(req, res, next) {
    sessionId = req.query.sessionId;
    next();
}

router.post('/upload', func, upload.single('file'), function (req, res) {
    res.send('success');
});

router.post('/uploadLogs', func, function (req, res) {
    let path = './upload/logsTrain/' + sessionId;
    // console.log(req.body.logs);
    let logs = req.body.logs;
    let ID = parseInt(JSON.parse(logs).ID);

    let logsF = logs + ",\n";
    fs.appendFileSync(path, logsF);

    //获取当前时间
    let currentDate = new Date();
    let currentDateF = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()].map(formatNumber).join('-');

    let sqlCmd = 'select uploadDate,keepOn from children where binary id =' + JSON.parse(logs).ID;
    sqlQuery.query(sqlCmd).then((e) => {
        let dt = e[0].uploadDate;
        let keepOn = e[0].keepOn;
        //下面方法为系统时区，东八区
        let date = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-').replace(/(?=\b\d\b)/g, '0');
        let interval = dateInterval(date, currentDateF);
        // console.log(date, currentDateF);
        // console.log(dateInterval(date, currentDateF));

        if (interval === 1) {
            keepOn++;
            let sqlCmd = 'update children set uploadDate=?,keepOn=? where binary id = ?';
            let sqlParams = [currentDateF, keepOn, ID];
            sqlQuery.query(sqlCmd, sqlParams).then(() => {
                res.send('success');
            }, (err) => {
                res.end('err');
                console.log('uploadLogs err.');
            });

        } else if (interval === 0) {
            res.send('success');
        } else {
            keepOn = 1;
            let sqlCmd = 'update children set uploadDate=?,keepOn=? where binary id = ?';
            let sqlParams = [currentDateF, keepOn, ID];
            sqlQuery.query(sqlCmd, sqlParams).then(() => {
                res.send('success');
            }, (err) => {
                res.end('err');
                console.log('uploadLogs err.');
            });
        }
    }, (err) => {
        res.end('err');
        console.log('uploadLogs err.');
    });
});


router.get('/getLogsTrain', function (req, res) {
    let sessionId = req.query.sessionId;
    let path = './upload/logsTrain/' + sessionId;
    fs.readFile(path, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
            res.end(changeToJson(data));
        }
    });
});

const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n
};

function changeToJson(str) {
    let tmp = str.substring(0, str.length - 2);
    tmp = '{"logs": [' + tmp + ']}';
    // console.log(tmp);
    return tmp;
}

function dateInterval(date1, date2) {
    let sDate = new Date(date1);
    let now = new Date(date2);
    let days = now.getTime() - sDate.getTime();
    let day = parseInt(days / (1000 * 60 * 60 * 24));
    return day;
}

module.exports = router;