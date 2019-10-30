const router = require('express').Router();
const request = require('request');

router.get('/checkLogin', function (req, res, next) {
    let sqlCmd = "SELECT * FROM sessions WHERE BINARY token=" + "'" + req.query.token + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        if (response[0]) {
            //返回sessions对应的users记录
            let sqlCmd = "select * from users where binary sessionId=" + "'" + response[0].id + "'";
            sqlQuery.query(sqlCmd).then((response01) => {
                res.json({
                    is_login: true,
                    users: response01[0],
                });
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
    const wx = {
        appid: 'wx2096a9d342339ba9',
        secret: '507c780aa28a5484bec695e4bbb29809'
    };
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
                            //******如果没有users？？？？
                            let sqlCmd = "select * from users where binary sessionId=" + "'" + sessionId + "'";
                            sqlQuery.query(sqlCmd).then((response03) => {
                                res.json({
                                    is_reg: true,
                                    is_first: false,
                                    token: tokenNew,
                                    users: response03[0],
                                });
                            }, () => {
                                console.log('login errCode 06.')
                            });
                        }, () => {
                            res.end();
                            console.log('login errCode 05');
                        })
                    } else {
                        //未登录到数据库
                        let sqlCmd = 'INSERT INTO sessions(id,openid,sessionKey,token) VALUES(0,?,?,?)';
                        let sqlParams = [session.openid, session.sessionkey, session.token];
                        sqlQuery.query(sqlCmd, sqlParams).then((response03) => {
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
                                    is_reg: true,
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
    let sqlParas =[req.query.defaultChildId, req.query.sessionId];
    sqlQuery.query(sqlCmd,sqlParas).then((response) => {
        res.send(response);
    }, () => {
        res.end();
        console.log('setDefaultChild errCode 00.');
    });
});

module.exports = router;