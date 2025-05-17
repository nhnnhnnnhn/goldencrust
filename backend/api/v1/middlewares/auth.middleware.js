const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golden-crust-default-secret-key');
    req.user = decoded; // This will contain the user ID from the token
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Middleware cho phép truy cập không cần xác thực, nhưng vẫn lấy thông tin user nếu có token
async function authenticateOptional(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Nếu không có token, vẫn cho phép tiếp tục nhưng không có thông tin user
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golden-crust-default-secret-key');
    req.user = decoded;
  } catch (err) {
    // Nếu token không hợp lệ, không trả về lỗi, vẫn cho phép tiếp tục nhưng không có thông tin user
    console.log('Optional token verification failed:', err.message);
  }
  
  next();
}

module.exports = authMiddleware;
module.exports.authenticateOptional = authenticateOptional;