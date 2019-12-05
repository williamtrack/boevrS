const router = require('express').Router();

router.post('/addChild', function (req, res) {
    let sqlCmd = 'INSERT INTO children(id,sessionId,childName,age,gender,leftEye,rightEye,myopia) VALUES(0,?,?,?,?,?,?,?)';
    let sqlParams = [req.body.sessionId, req.body.childName, req.body.age, req.body.gender, req.body.leftEye, req.body.rightEye,req.body.myopia];
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
    let sqlParams = [req.body.sessionId, req.body.childName, req.body.age, req.body.gender, req.body.leftEye, req.body.rightEye,req.body.myopia,req.body.id];
    sqlQuery.query(sqlCmd, sqlParams).then((response) => {
        res.send(response);
    }, (err) => {
        res.end();
        console.log(err,'updateChild err.');
    });
});

router.get('/fetchAllChildren', function (req, res) {
    let sqlCmd = "select * from children where binary sessionId="+"'"+req.query.sessionId+"'";
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
        let dt=response[0].uploadDate;
        let date = [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-').replace(/(?=\b\d\b)/g, '0');
        let currentDate = new Date();
        let currentDateF = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()].join('-').replace(/(?=\b\d\b)/g, '0');
        // console.log(currentDateF,date);

        if(dateInterval(date, currentDateF) > 1){
            let keepOn=0;
            let sqlCmd='update children set keepOn=? where id=?';
            let sqlParams = [keepOn,req.query.id];
            sqlQuery.query(sqlCmd,sqlParams).then((e) => {
                response[0].keepOn=0;
                res.send(response);
            });
        }else {
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

module.exports = router;