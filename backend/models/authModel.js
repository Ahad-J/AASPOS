const { sql, pool, poolConnect } = require('./db');
const bcrypt = require('bcrypt');

async function createUser({ name, password, empid, role }) {
  try {
    await poolConnect;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('username', sql.VarChar(64), name)
      .input('password', sql.VarChar(255), hashedPassword)
      .input('role', sql.VarChar(32), role)
      .input('empid', sql.VarChar(16), empid)
      .query(`INSERT INTO Users (username, password_hash, role, employee_id) 
              VALUES (@username, @password, @role, @empid)`);
    return result;
  } catch (err) {
    throw err;
  }
}

async function findUserByEmployeeId(empid) {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('empid', sql.VarChar(16), empid)
      .query('SELECT * FROM Users WHERE employee_id = @empid');
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = { createUser, findUserByEmployeeId };