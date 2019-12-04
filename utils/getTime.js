//getTime.js
function GetTime() {
    let dt = new Date();
    let time = [
        [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()].join('-'), '_',
        [dt.getHours(), dt.getMinutes(), dt.getSeconds()].join(':')
    ].join('').replace(/(?=\b\d\b)/g, '0');
    return time;
}
exports.GetTime = GetTime();