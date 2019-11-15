const router = require('express').Router();
const wsObj = {};

router.ws('/', function (ws, req) {
    const uid = req.params.uid;
    const toId = req.query.toId;
    console.log('webSocket %s is connecting!', uid);
    wsObj[uid] = ws;
    for (let st in wsObj) {
        console.dir(st);
    }

    ws.send('connect');
    if (uid != toId && wsObj[toId]) {
        ws.send('isOnYes');
        wsObj[toId].send('isOnYes');
    }

    ws.on('message', function (msg) {
        console.log(msg);
        if (uid != toId && wsObj[toId]) {
            switch (msg) {
                case 'getPic':
                    wsObj[toId].send(msg);
                    break;
                case 'text':
                    wsObj[toId].send(msg);
                    break;
                default:
                    wsObj[toId].send(msg);
                    break;
            }
        }
    });

    ws.on('close', function (msg) {
        console.log('webSocket ' + uid + ' is closed!');
        if (wsObj[toId]) {
            wsObj[toId].send('isOnNo');
        }
        delete (wsObj[uid]);
    })
});


module.exports = router;