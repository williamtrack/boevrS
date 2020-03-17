const router = require('express').Router();
const request = require('request');
const multer = require('multer');
const fs = require('fs');
let userIdName = '';
// const crypto = require('crypto');
// const WXBizDataCrypt = require('../utils/WXBizDataCrypt');

const wx = {
    appid: 'wx2096a9d342339ba9',
    secret: '507c780aa28a5484bec695e4bbb29809'
};


//创建文件夹
let uploadFolder = __dirname + '/../upload/userImg';
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
        cb(null, userIdName);
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({storage: storage});

function func(req, res, next) {
    userIdName = req.query.userIdName;
    next();
}

router.get('/updateAddress',function (req,res) {
    let sqlCmd = 'update users set address =?,coordinate=? where binary id = ?';
    let sqlParams = [req.query.address,req.query.coordinate,req.query.userId];
    sqlQuery.query(sqlCmd, sqlParams).then((response) => {
        res.send('success');
    }, (err) => {
        res.send('fail');
        console.log(err, 'updateChild err.');
    });
});

//上传文件，目前已弃用
router.post('/uploadUserImg', func, upload.single('file'), function (req, res) {
    res.send('success');
});

router.get('/downloadUserImg', function (req, res) {
    let userId = req.query.userId;
    let path = './upload/userImg/' + userId;
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
        fs.readFile(path, '', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                // console.log(e);
                res.writeHead(200, {'Content-Type': ''});
                res.end(data);
            }
        });
    }, (e) => {
        // console.log(e);
        res.writeHead(404, {'Content-Type': ''});
        res.end('notExisted');
    });
});

router.get('/updateUserName', function (req, res, next) {
        let sqlCmd = 'UPDATE users SET userName = ? WHERE binary id = ?';
        let sqlParams = [req.query.userName, req.query.userId];
        sqlQuery.query(sqlCmd, sqlParams).then((response) => {
            // console.log(response);
            res.send(response);
        }, (err) => {
            console.log(err);
            res.send(err);
        })
    }
);


router.get('/checkLogin', function (req, res, next) {
    let sqlCmd = "SELECT * FROM sessions WHERE BINARY token=" + "'" + req.query.token + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        if (response[0]) {
            //返回sessions对应的users记录
            let sqlCmd = "select * from users where binary sessionId=" + "'" + response[0].id + "'";
            sqlQuery.query(sqlCmd).then((response01) => {
                if (!response01[0].defaultChildId) {
                    res.json({
                        is_login: true,
                        is_first: true,
                        users: response01[0],
                    });
                } else {
                    res.json({
                        is_login: true,
                        is_first: false,
                        users: response01[0],
                    });
                }
            }, () => {
                console.log('checkLogin errCode 01.')
            });
        } else {
            res.json({
                is_login: false,
            });
        }
    }, () => {
        console.log('checkLogin errCode 00.')
    });
});

router.post('/login', function (req, res, next) {
    let session = {
        openid: '',
        sessionKey: '',
        token: '',
    };

    const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code';
    // const test = 'https://api.weixin.qq.com/sns/jscode2session?appid=wx2096a9d342339ba9&secret=507c780aa28a5484bec695e4bbb29809&js_code=   &grant_type=authorization_code';
    request(url, (err, response, body) => {
        if (err) {
            res.end();
            console.log('login errCode 00');
        } else {
            let sessionGet = JSON.parse(body);//如果直接=body，则不能解析
            console.log(sessionGet);
            if (sessionGet.openid) {
                let tokenNew = 'token_' + new Date().getTime();
                session.token = tokenNew;
                session.sessionkey = sessionGet.session_key;
                session.openid = sessionGet.openid;

                let sqlCmd = "SELECT * FROM sessions WHERE BINARY openid=" + "'" + session.openid + "'";
                //查找openid用户是否登录到数据库
                sqlQuery.query(sqlCmd).then((response02) => {
                    if (response02[0]) {
                        let sessionId = response02[0].id;
                        //说明曾经登录到数据库(创建过openid),下一步更新token
                        let sqlCmd = 'UPDATE sessions SET token = ? WHERE binary openid = ?';
                        let sqlParams = [session.token, session.openid];
                        //更新数据库中openid对应的token
                        sqlQuery.query(sqlCmd, sqlParams).then(() => {
                            //返回sessions对应的users记录
                            let sqlCmd = "select * from users where binary sessionId=" + "'" + sessionId + "'";
                            sqlQuery.query(sqlCmd).then((response03) => {
                                if (!response03[0].defaultChildId) {
                                    res.json({
                                        is_first: true,
                                        token: tokenNew,
                                        users: response03[0],
                                    });
                                } else {
                                    res.json({
                                        is_first: false,
                                        token: tokenNew,
                                        users: response03[0],
                                    });
                                }
                            }, () => {
                                console.log('login errCode 06.')
                            });
                        }, () => {
                            res.end();
                            console.log('login errCode 05');
                        })
                    } else {
                        //未登录到数据库，添加session
                        let sqlCmd = 'INSERT INTO sessions(id,openid,sessionKey,token) VALUES(0,?,?,?)';
                        let sqlParams = [session.openid, session.sessionkey, session.token];
                        sqlQuery.query(sqlCmd, sqlParams).then((response03) => {
                            //添加users
                            let sqlCmd = 'insert into users(id,sessionId) values(0,?)';
                            let sqlParams = [response03.insertId];
                            sqlQuery.query(sqlCmd, sqlParams).then((response04) => {
                                let users = {
                                    id: response04.insertId,
                                    sessionId: response03.insertId,
                                    deviceId: null,
                                    defaultChildId: null,
                                    userName: null,
                                };
                                res.json({
                                    is_first: true,
                                    token: tokenNew,
                                    users: users,
                                })
                            }, () => {
                                res.end();
                                console.log('login errCode 04');
                            });
                        }, () => {
                            res.end();
                            console.log('login errCode 03');
                        });
                    }
                }, () => {
                    res.end();
                    console.log('login errCode 02');
                });
            } else {
                res.end();
                console.log('login errCode 01');
            }
        }
    })
});

router.get('/setDefaultChild', function (req, res, next) {
    let sqlCmd = "UPDATE users set defaultChildId = ? where binary sessionId= ?";
    let sqlParas = [req.query.defaultChildId, req.query.sessionId];
    sqlQuery.query(sqlCmd, sqlParas).then((response) => {
        //发送child信息
        let sqlCmd = "select * from children where id = " + req.query.defaultChildId;
        sqlQuery.query(sqlCmd, sqlParas).then((res01) => {
            res.send(res01[0]);
        }, () => {
            res.end();
            console.log('setDefaultChild err');
        });
    }, () => {
        res.end();
        console.log('setDefaultChild err');
    });
});

// router.post('/encryptedData', (req, res) => {
//     let pc = new WXBizDataCrypt(wx.appid, '35miFU2AMKxh3hrM0tAesw==');
//     // console.log(req.body);
//     // console.log(req.body.encryptedData);
//     let data = pc.decryptData(req.body.encryptedData, req.body.iv);
//     console.log('解密后', data);
//     //校验rawData是否正确
//     let sha1 = crypto.createHash('sha1');
//     sha1.update(req.body.rawData + wx.secret);
//     let signature2 = sha1.digest('hex');
//     console.log(signature2);
//     console.log(req.body.signature);
//     res.json({pass: signature2 == req.body.signature});
//     res.end();
// });

module.exports = router;