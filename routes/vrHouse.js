const router = require('express').Router();
module.exports = router;
const multer = require('multer');
const fs = require('fs');


router.get('/', function (req, res) {
    // fs.readFile('./pages/vrHouse/index.html', function (err, data) {
    //     if (err) {
    //         console.log(err);
    //         res.end();
    //     } else {
    //         res.writeHead(200,{'Content-Type':'text/html'});
    //         res.end(data);
    //     }
    // });
    if (req.url == '/') return res.redirect(301, 'https://boevr.cn/static/index.html');
});