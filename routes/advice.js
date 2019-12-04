const router = require('express').Router();
const fs = require('fs');
module.exports = router;


router.post('/', function (req, res) {
    let path = __dirname + '/../upload/advice';
    let data={};
    data.time=require('../utils/getTime.js').GetTime;
    data.id=req.body.sessionId;
    data.number=req.body.number;
    data.advice=req.body.dataAdvice;
    data = JSON.stringify(data)+",\n";
    fs.appendFileSync(path, data);
    res.end('success');

    // fs.readFile(path, 'utf-8', function (err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         let pp1=JSON.parse(changeToJson(data));
    //         console.log(pp1.advices[0].advice);
    //     }
    // });
});

function changeToJson(str) {
    let tmp = str.substring(0, str.length - 2);
    tmp = '{"advices": [' + tmp + ']}';
    return tmp;
}