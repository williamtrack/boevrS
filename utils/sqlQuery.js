/*
接口：
query:增加、删除
backQuery:查询
*/

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F234jkl;',
    port: '3306',
    database: 'wx',
});
//怎么关闭？？？
connection.connect();

function SqlQuery() {
    //更新(增、删、改)，返回的是对象 //查询，返回的是数组
    this.query = function (sqlCmd, sqlParams) {
        if (arguments.length === 1) {
            return new Promise(
                function (resolve, reject) {
                    connection.query(sqlCmd, (err, result) => {
                        if (err) {
                            reject(err);//promise返回值.用于then后者
                            // console.log(err);
                            console.log('sqlQuery err: ',err);
                        } else if (!err) {
                            resolve(result);//promise返回值.用于then前者
                        }
                    })
                }
            );
        } else if (arguments.length === 2) {
            return new Promise(
                function (resolve, reject) {
                    connection.query(sqlCmd, sqlParams, (err, result) => {
                        if (err) {
                            reject(err);
                            // console.log(err);
                            console.log('sqlQuery err: ',err);
                        } else if (!err) {
                            resolve(result);
                        }
                    })
                }
            );
        } else {
            return null;
        }
    };
}

module.exports = SqlQuery;