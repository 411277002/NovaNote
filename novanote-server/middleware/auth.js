const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 從 HTTP Header 獲取 Token (格式通常是 Bearer <token>)
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: '沒有 Token，授權失敗' });
    }

    try {
        // 驗證 Token 是否合法
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        // 將解析出來的用戶資料放入 req 中，讓後面的 Controller 可以使用
        req.user = decoded;
        
        // 通過驗證，前往下一站 (Controller)
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token 無效或已過期' });
    }
};