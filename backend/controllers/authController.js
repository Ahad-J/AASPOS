const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { name, password, empid, role } = req.body;
    await authModel.createUser({ name, password, empid, role });
    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { empid, password } = req.body;
    
    // 1. Find user by employee ID
    const result = await authModel.findUserByEmployeeId(empid);
    
    if (!result.recordset.length) {
      return res.status(400).json({ error: "❌ User not found!" });
    }

    const user = result.recordset[0];
    
    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(400).json({ error: "❌ Invalid credentials!" });
    }

    // 3. Create JWT payload
    const payload = {
      user: {
        id: user.employee_id,
        role: user.role,
        username: user.username
      }
    };

    // 4. Generate JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expiration time
    );

    // 5. Send response with token
    res.json({ 
      message: "✅ Login successful!", 
      token: token,
      role: user.role, 
      username: user.username,
      employee_id: user.employee_id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};