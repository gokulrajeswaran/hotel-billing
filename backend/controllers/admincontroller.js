import jwt from 'jsonwebtoken';

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // Accessing env variables
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (username === validUser && password === validPass) {
    const token = jwt.sign(
      { role: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      token
    });
  }

  return res.status(401).json({ 
    success: false, 
    message: "Invalid admin credentials" 
  });
};