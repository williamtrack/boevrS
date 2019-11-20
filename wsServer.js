const WebSocket = require('ws');
const url = require('url');
let wsCtrl = {};
let wsVR = {};
function noop() {}
function heartbeat() {
    this.isAlive = true;
}

module.exports = function (e) {
    const ws = new WebSocket.Server(e);

    const interval = setInterval(function ping() {
        ws.clients.forEach(function each(ws) {
            // console.log(ws.isAlive);
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 5000);

    ws.on('connection', function connection(ws, req) {

        const pathname = url.parse(req.url, true).pathname;
        const fromId = url.parse(req.url, true).query.fromId;
        const toId = url.parse(req.url, true).query.toId;
        if (pathname != '/wsServer' && pathname != '/wsCtrl' || !fromId || !toId) {
            ws.close();
        }
        // console.log('webSocket %s is connecting!', fromId);
        // for (let st in wsCtrl) {
        //     console.dir(st);
        // }
        if(pathname==='/wsCtrl'){
            ws.isAlive = true;
            ws.on('pong', heartbeat);

            wsCtrl[fromId] = ws;
            ws.send('connect');
            if (fromId != toId && wsVR[toId]) {
                ws.send('isOnYes');
            }
            ws.on('message', function incoming(msg) {
                if (fromId != toId && wsVR[toId]) {
                    // console.log(msg);
                    switch (msg) {
                        case 'getPic':
                            wsVR[toId].send(msg);
                            break;
                        default:
                            wsVR[toId].send(msg);
                            break;
                    }
                }
            });
            ws.on('error',function () {
                console.log('error')
            });
            ws.on('close', function close() {
                // console.log('webSocket ' + fromId + ' is closed!');
                delete (wsCtrl[fromId]);
            });
        }


        if(pathname==='/wsServer'){
            ws.isAlive = true;
            ws.on('pong', heartbeat);

            wsVR[fromId] = ws;
            if (fromId != toId && wsCtrl[toId]) {
                wsCtrl[toId].send('isOnYes');
            }
            ws.on('message', function incoming(msg) {
                if (fromId != toId && wsCtrl[toId]) {
                    // console.log(msg);
                    wsCtrl[toId].send(msg);
                }
            });

            ws.on('close', function close() {
                // console.log('webSocket ' + fromId + ' is closed!');
                if (wsCtrl[toId]) {
                    wsCtrl[toId].send('isOnNo');
                }
                delete (wsVR[fromId]);
            });
        }

    });
};