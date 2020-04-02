const router = require('express').Router();
module.exports = router;

const multer = require('multer');
const fs = require('fs');

let getDir = require('../utils/getDirTree');

router.get('/getDir', function (req, res) {
    let data = '';
    getDir('.//upload//unity', function (e) {
        // console.log(JSON.parse(e));
        data = e;
    });
    global.str='';
    res.end(data);
});

router.get('/download', function (req, res) {
    let dir = req.query.dir;
    fs.readFile('.//upload//unity' + dir, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            // res.writeHead(200,{'Content-Type':'image/jpg'});
            res.end(data);
        }
    });
});