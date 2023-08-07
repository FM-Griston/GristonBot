const { DBHOST, DBNAME, DBPASSWORD } = process.env;
const mysql = require('mysql');

module.exports = mysql.createConnection({
    host: DBHOST,
    user: DBNAME,
    password: DBPASSWORD,
    database: DBNAME
});