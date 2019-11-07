const router = require('express').Router();
const wsObj = {};

router.ws('/:uid', function (ws, req) {
    const uid = req.params.uid;
    console.log('webSocket %s is connecting!', uid);
    wsObj[uid] = ws;

    for (let st in wsObj) {
        console.dir(st);
    }

    ws.on('message', function (msg) {
        console.log(msg);
        try {
            var {toId, ctrl} = JSON.parse(msg);
            var mess = {toId, ctrl};
            var fromId = uid;
        } catch (e) {
            console.log(e);
        }
        if (fromId != toId) {
            switch (mess.ctrl) {
                case 'isOn':
                    if (wsObj[toId]) {
                        console.log('[][]');
                        wsObj[fromId].send('isOnYes');
                    } else {
                        console.log('--');
                        wsObj[fromId].send('isOnNo');
                    }
                    break;
                default:
                    if (wsObj[toId]) {
                        switch (mess.ctrl) {
                            case 'getPic':
                                console.log('[][]');
                                wsObj[toId].send(mess.ctrl);
                                break;
                            case 'text':
                                console.log('----');
                                wsObj[toId].send(JSON.stringify({fromId, ctrl}));
                                break;
                            default:
                                console.log(mess.ctrl);
                                wsObj[toId].send(mess.ctrl);
                                break;
                        }
                    }
                    break;
            }
        }
    });

    ws.on('close', function (msg) {
        console.log('webSocket ' + uid + ' is closed!');
        delete (wsObj[uid]);
    })
});


module.exports = router;