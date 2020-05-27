const router = require('express').Router();
module.exports = router;
const multer = require('multer');
const fs = require('fs');


router.get('/vrHouse', function (req, res) {
    // fs.readFile('./pages/vrHouse/index.html', function (err, data) {
    //     if (err) {
    //         console.log(err);
    //         res.end();
    //     } else {
    //         res.writeHead(200,{'Content-Type':'text/html'});
    //         res.end(data);
    //     }
    // });
    if (req.url === '/vrHouse') return res.redirect(301, 'https://boevr.cn/static/vrHouse/index.html');
    // if (req.url === '/vrHouse') return res.redirect(301, 'http://127.0.0.1/static/vrHouse/index.html');
});

router.get('/rtmp', function (req, res) {
    if (req.url === '/rtmp') return res.redirect(301, 'https://boevr.cn/static/rtmp/index.html');
    // if (req.url === '/rtmp') return res.redirect(301, 'http://127.0.0.1/static/rtmp/index.html');
});