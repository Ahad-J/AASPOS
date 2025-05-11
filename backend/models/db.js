// models/db.js 
const sql = require('mssql');

const config = {
    server: "DESKTOP-JEO3CPC", // Replace with your actual server name
    database: "VERSION_1", // Replace with your database name
    user: "myuser1", // Use the SQL user you created
    password: "ALI1234", // Use the password you set
    port: 1433,
    options: {
        trustServerCertificate: true,
        encrypt: false,
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
    sql, pool, poolConnect
};
