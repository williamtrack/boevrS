const WebSocket = require('ws');
const url = require('url');
global.wsCtrl = {};
global.wsAR = {};
let wsVR = {};

function noop() {
}

function heartbeat() {
    this.isAlive = true;
}

module.exports = function (e) {
    const ws = new WebSocket.Server(e);

    const interval = setInterval(function ping() {
        //ws.clients  指的是所有连接成员，如果没有连接，则ws.clients为空(伪空，里面有个非对象的set)，而ws一直都有
        ws.clients.forEach(function each(wsClient) {
            // console.log(ws.clients);
            if (wsClient.isAlive === false) return wsClient.terminate();
            wsClient.isAlive = false;
            wsClient.ping(noop);
        });
    }, 5000);

    ws.on('connection', function connection(wsClient, req) {
        const pathname = url.parse(req.url, true).pathname;
        const fromId = url.parse(req.url, true).query.fromId;
        const toId = url.parse(req.url, true).query.toId;

        if (pathname == '/boeAr' && fromId) {
            const fromId = url.parse(req.url, true).query.fromId;
            const roomId = url.parse(req.url, true).query.roomId;
            const roomKey = url.parse(req.url, true).query.roomKey;
            if (roomKey=="null" && roomKey=="null") {
                wsClient.close();
            } else {
                fun(fromId, roomId, roomKey, wsClient);
            }
        } else {
            if (pathname != '/wsServer' && pathname != '/wsCtrl' || !fromId || !toId) {
                wsClient.close();
            }
            console.log('\x1B[34mWSS \x1B[39m%s is open!', fromId);
            // for (let st in wsCtrl) {
            //     console.dir(st);
            // }
            if (pathname === '/wsCtrl') {
                wsClient.isAlive = true;
                wsClient.on('pong', heartbeat);

                wsCtrl[fromId] = wsClient;
                wsClient.send('connect');
                if (fromId != toId && wsVR[toId]) {
                    wsClient.send('isOnYes');
                }
                wsClient.on('message', function incoming(msg) {
                    // console.log(msg);
                    if (fromId != toId && wsVR[toId]) {
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
                wsClient.on('error', function () {
                    console.log('error')
                });
                wsClient.on('close', function close() {
                    console.log('\x1B[34mWSS \x1B[39m%s is closed!', fromId);
                    delete (wsCtrl[fromId]);
                });
            }


            if (pathname === '/wsServer') {
                wsClient.isAlive = true;
                wsClient.on('pong', heartbeat);

                wsVR[fromId] = wsClient;
                if (fromId != toId && wsCtrl[toId]) {
                    wsCtrl[toId].send('isOnYes');
                }
                wsClient.on('message', function incoming(msg) {
                    // console.log(msg);
                    if (fromId != toId && wsCtrl[toId]) {
                        wsCtrl[toId].send(msg);
                    }
                });

                wsClient.on('close', function close() {
                    console.log('\x1B[34mWSS \x1B[39m%s is closed!', fromId);
                    if (wsCtrl[toId]) {
                        wsCtrl[toId].send('isOnNo');
                    }
                    delete (wsVR[fromId]);
                });
            }
        }


    });

    let fun = function (fromId, roomId, roomKey, wsClient) {
        console.log(fromId, roomId, roomKey);
        wsAR[fromId] = wsClient;
        wsClient.isAlive = true;
        wsClient.roomId = roomId;
        wsClient.roomKey = roomKey;
        wsClient.on('pong', heartbeat);
        wsClient.on('message', function incoming(msg) {
            // console.log(msg);
            // console.log(wsAR);
            // console.log(roomId, typeof (roomKey));
            if (roomId !== "null" && roomKey !== "null") {
                for (let member in wsAR) {
                    // console.log(wsAR[i]);
                    if ((wsAR[member] !== wsAR[fromId])&&(wsAR[member].roomId==wsAR[fromId].roomId)&&(wsAR[member].roomKey==wsAR[fromId].roomKey)) {
                        wsAR[member].send(msg);
                    }
                }
            }
            // wsAR[fromId].send(msg);
        });
        wsClient.on('close', function close() {
            delete (wsAR[fromId]);
            console.log('\x1B[34mWSS \x1B[39m%s is closed!', fromId);
        });
    }
};