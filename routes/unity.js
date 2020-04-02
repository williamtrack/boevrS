const router = require('express').Router();
module.exports = router;

const multer = require('multer');
const fs = require('fs');


router.get('/test',function (req,res) {
    res.end("abc");
});

router.get('/download',function (req,res) {
    fs.readFile('./upload/unity/arremote/model2/T_box_BaseColor.jpg',function (err, data) {
        if (err) {
            console.log(err);
        } else {
            // res.writeHead(200,{'Content-Type':'image/jpg'});
            res.end(data);
        }
    });
})