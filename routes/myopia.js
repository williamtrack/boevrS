const router = require('express').Router();
module.exports = router;

router.post('/updatePlan', function (req, res, next) {
    let sqlCmd = 'update children set minSta=?,minDyn=?,times=?,currentTime=?,lastDate=? where binary id = ?';
    let sqlParams = [req.body.minSta, req.body.minDyn, req.body.times, 1, req.body.lastDate, req.body.id];
    sqlQuery.query(sqlCmd, sqlParams).then((response) => {
        res.send(response);
    }, (err) => {
        res.end('err');
        console.log('updatePlan err.');
    });
});

router.get('/getPlan', function (req, res) {
    snToChildId(req.query.sn).then((snToId) => {
        let currentDate = new Date();
        currentDate = [currentDate.getMonth() + 1, currentDate.getDate()].map(formatNumber).join('');
        //把0801变为801；
        currentDate = parseInt(currentDate);
        let sqlCmd = 'select * from children where binary id = ' + snToId;
        sqlQuery.query(sqlCmd).then((e) => {
            if (e[0].lastDate === currentDate) {
                res.send(e);
            } else {
                let sqlCmd = 'update children set currentTime=1,lastDate=' + currentDate + ' where binary id=' + snToId;
                // console.log(sqlCmd);
                sqlQuery.query(sqlCmd).then(() => {
                    let aa = e[0];
                    aa.currentTime = 1;
                    aa.lastDate = currentDate;
                    res.send(aa);
                }, () => {
                    res.send('err');
                    console.log('getPlan err.');
                });
            }

        }, () => {
            res.end('err');
            console.log('getPlan err.');
        })
    }, () => {
        res.end('err');
        console.log('getPlan err');
    });
});

router.get('/updateCurrentTime', function (req, res) {
    let currentDate = new Date();
    currentDate = [currentDate.getMonth() + 1, currentDate.getDate()].map(formatNumber).join('');
    currentDate = parseInt(currentDate);
    snToChildId(req.query.sn).then((snToId) => {
        let sqlCmd = 'update children set currentTime=?,lastDate=? where binary id =?';
        let sqlParams=[req.query.currentTime,currentDate,snToId];
        sqlQuery.query(sqlCmd,sqlParams).then(() => {
            res.end('success');
        }, () => {
            res.end('err');
            console.log('updateCurrentTime err');
        });
    }, () => {
        res.end('err');
        console.log('updateCurrentTime err');
    });
});

router.post('/addEyeHistory', function (req, res) {

    let sqlCmd = 'INSERT INTO eyeHistory(id,childId,leftEye,rightEye,addTime) VALUES(0,?,?,?,?)';
    let sqlParams = [req.body.childId, req.body.leftEye, req.body.rightEye, req.body.addTime];
    sqlQuery.query(sqlCmd, sqlParams).then((r) => {
        res.send(r);
    }, (err) => {
        res.send('err');
        console.log('addEyeHistory err.');
    });
});

router.get('/fetchEyeHistory', function (req, res) {
    let sqlCmd = 'select * from eyeHistory where childId = ?';
    let sqlParams = [req.query.childId];
    sqlQuery.query(sqlCmd, sqlParams).then((r) => {
        res.send(r);
    }, (err) => {
        res.send('err');
        console.log('fetchEyeHistory err.');
    });
});

const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n
};

let snToChildId = (sn) => {
    return new Promise(
        function (resolve, reject) {
            let sqlCmd = 'select id from devices where sn=' + "'"+sn+"'";
            sqlQuery.query(sqlCmd).then((e) => {
                let sqlCmd = 'select defaultChildId from users where deviceId =' + e[0].id;
                sqlQuery.query(sqlCmd).then((e) => {
                    console.log(e);
                    if(e[0]){
                        resolve(e[0].defaultChildId);
                    }else{
                        reject();
                    }
                }, () => {
                    reject();
                    console.log('snToChildId err');
                });
            }, () => {
                reject();
                console.log('snToChildId err');
            });
        }
    );
};