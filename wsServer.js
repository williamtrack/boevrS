const WebSocket = require('ws');
const url = require('url');
let wsObj = {};
module.exports = function (e) {
    const ws = new WebSocket.Server(e);
    ws.on('connection', function connection(ws, req) {
        const pathname = url.parse(req.url, true).pathname;
        const fromId = url.parse(req.url, true).query.fromId;
        const toId = url.parse(req.url, true).query.toId;
        if (pathname != '/wsServer'||!fromId||!toId) {
            ws.close();
        }
        // console.log('webSocket %s is connecting!', fromId);
        wsObj[fromId] = ws;
        // for (let st in wsObj) {
        //     console.dir(st);
        // }
        ws.send('connect');
        if (fromId != toId && wsObj[toId]) {
            ws.send('isOnYes');
            wsObj[toId].send('isOnYes');
        }

        ws.on('message', function incoming(msg) {
            console.log(msg);
            if (fromId != toId && wsObj[toId]) {
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
        ws.on('close', function close() {
            // console.log('webSocket ' + fromId + ' is closed!');
            if (wsObj[toId]) {
                wsObj[toId].send('isOnNo');
            }
            delete (wsObj[fromId]);
        });

    });
};