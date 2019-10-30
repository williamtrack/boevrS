const router = require('express').Router();
module.exports = router;

router.post('/updatePlan', function (req, res, next) {
    let sqlCmd = 'update children set minSta=?,minDyn=?,times=? where binary id = ?';
    let sqlParams = [req.body.minSta, req.body.minDyn,req.body.times,req.body.id];
    sqlQuery.query(sqlCmd, sqlParams).then((response) => {
        res.send(response);
    }, (err) => {
        res.end();
        console.log('updatePlan err.');
    });
});

router.get('/getPlan',function (req,res) {
    let sqlCmd = 'select * from children where id = 166';
    // let sqlParams = [req.query.childId];
    sqlQuery.query(sqlCmd).then((e)=>{
        res.send(e);
    },(err)=>{
        res.end();
        console.log('getPlan err.')
    })
});

router.post('/addEyeHistory', function (req, res) {

    let sqlCmd = 'INSERT INTO eyeHistory(id,childId,leftEye,rightEye,addTime) VALUES(0,?,?,?,?)';
    let sqlParams = [req.body.childId, req.body.leftEye, req.body.rightEye, req.body.addTime];
    sqlQuery.query(sqlCmd, sqlParams).then((r) => {
        res.send(r);
    }, (err) => {
        res.send('err');
        console.log('children errCode 01.');
    });
});

router.get('/fetchEyeHistory', function (req, res) {
    let sqlCmd = 'select * from eyeHistory where childId = ?';
    let sqlParams = [req.query.childId];
    sqlQuery.query(sqlCmd, sqlParams).then((r) => {
        res.send(r);
    }, (err) => {
        res.send('err');
        console.log('children errCode 01.');
    });
});