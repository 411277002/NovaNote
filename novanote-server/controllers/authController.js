const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 註冊新用戶
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // 1. 檢查 Email 是否已被註冊
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) return res.status(400).json({ msg: 'Email 已被使用' });

        // 2. 加密密碼 (加鹽 10 次)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. 存入資料庫
        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ msg: '註冊成功！' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 用戶登入
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. 查詢資料庫
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: "此信箱尚未註冊" });
        }
        const user = rows[0];

        // 2. 比對密碼
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "密碼輸入錯誤" });
        }

        // 3. 簽發 Token (檢查 JWT 套件)
        if (typeof jwt === 'undefined') {
            throw new Error("後端遺失 jwt 套件引入，請在檔案頂部加上 const jwt = require('jsonwebtoken');");
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'nova_backup_secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (err) {
        // --- 這裡改用 console.log(err) 而不是 err.message ---
        console.log("❌ 偵測到嚴重錯誤！");
        console.log(err); 
        res.status(500).json({ 
            error: "伺服器內部錯誤", 
            debug: err.stack // 把錯誤堆疊傳給前端，讓你直接在瀏覽器看到哪一行壞了
        });
    }
};