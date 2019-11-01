const router = require('express').Router();
const wsObj = {};

router.ws('/:uid', function (ws, req) {
    const uid = req.params.uid;
    console.log('webSocket '+uid + ' is connecting!');
    wsObj[uid] = ws;

    for (let st in wsObj) {
        console.dir(st);
    }

    ws.on('message', function (msg) {
        try {
            console.log(msg);
            console.log(JSON.parse(msg));
            let {toId, type, data} = JSON.parse(msg);
            const fromId = uid;
            if (fromId != toId && wsObj[toId]) {
                // wsObj[toId]   表示 接收方 与服务器的那条连接
                // wsObj[fromId] 表示 发送方 与服务器的那条连接
                wsObj[toId].send(JSON.stringify({fromId, type, data}));
                // ws.send('abc');
            }
        } catch (e) {
            console.log(e);
        }
    });

    ws.on('close', function (msg) {
        console.log('webSocket '+ uid + ' is closed!');
        delete (wsObj[uid]);
    })
});



module.exports = router;