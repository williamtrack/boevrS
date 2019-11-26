const router = require('express').Router();

router.get('/fetchDeviceSn', function (req, res) {
    let sqlCmd = "SELECT * FROM devices WHERE BINARY id=" + "'" + req.query.deviceId + "'";
    sqlQuery.query(sqlCmd).then((response) => {
            res.send(response[0])
        }, () => {
            res.end('fail');
            console.log('fetchDeviceId err.');
        }
    );
});

router.get('/releaseDevice', function (req, res) {
    let sqlCmd = "UPDATE users set deviceId = null where binary sessionId= ?";
    let sqlParas = [req.query.sessionId];
    sqlQuery.query(sqlCmd, sqlParas).then((response) => {
        res.send('success');
    }, () => {
        res.end('fail');
        console.log('releaseDevice err.');
    });
});

router.get('/setDeviceId', function (req, res) {
    let sqlCmd = "select * from devices where binary sn=" + "'" + req.query.sn + "'";
    sqlQuery.query(sqlCmd).then((response) => {
        if (response[0]) {
            let sqlCmd2 = "UPDATE users set deviceId = ? where binary sessionId= ?";
            let sqlParas = [response[0].id, req.query.sessionId];
            sqlQuery.query(sqlCmd2, sqlParas).then(() => {
                res.json({
                    exist: true,
                    double: false,
                });
            }, () => {
                res.json({
                    exist: true,
                    double: true,
                });
                console.log('setDeviceId err.')
            });
        } else {
            res.json({
                exist: false,
            });
        }
    }, () => {
        res.end('fail');
        console.log('setDeviceId err.');
    });

});

module.exports = router;