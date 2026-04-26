const db = require('../config/db');

// 1. 獲取所有星球
exports.getPlanets = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM planets');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. 創建新星球
exports.createPlanet = async (req, res) => {
    // 🔴 修正 1：從 req.body 中解構出 texture_type
    const { name, color, texture_type, user_id, x_pos, y_pos } = req.body;
    
    // 如果前端沒傳座標，才使用隨機值（或是維持你原本的隨機邏輯）
    const finalX = x_pos !== undefined ? x_pos : Math.random();
    const finalY = y_pos !== undefined ? y_pos : Math.random();

    try {
        // 🔴 修正 2：在 SQL 語句中加入 texture_type 欄位
        const [result] = await db.query(
            'INSERT INTO planets (name, color, texture_type, x_pos, y_pos, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                name, 
                color || '#646cff', 
                texture_type || 'rocky', // 🔴 修正 3：傳入紋路值，並給予預設值 'rocky'
                finalX, 
                finalY, 
                user_id
            ]
        );
        
        res.json({ 
            msg: '星球已誕生', 
            planetId: result.insertId 
        });
    } catch (err) {
        console.error("資料庫寫入失敗:", err);
        res.status(500).json({ error: err.message });
    }
};

// 3. 更新星球座標
exports.updatePlanetPosition = async (req, res) => {
    const { x_pos, y_pos } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE planets SET x_pos = ?, y_pos = ? WHERE id = ?', [x_pos, y_pos, id]);
        res.json({ msg: '星球軌道已校準' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. 編輯星球 (改名或換顏色)
exports.updatePlanet = async (req, res) => {
    const { name, color } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE planets SET name = ?, color = ? WHERE id = ?', [name, color, id]);
        res.json({ msg: '星球資訊已更新' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. 刪除星球 (注意：通常這會讓裡面的筆記變回漂浮狀態)
exports.deletePlanet = async (req, res) => {
    const { id } = req.params;
    try {
        // 先把該星球的筆記 planet_id 設為 NULL，否則會報外鍵約束錯誤
        await db.query('UPDATE notes SET planet_id = NULL WHERE planet_id = ?', [id]);
        // 再刪除星球
        await db.query('DELETE FROM planets WHERE id = ?', [id]);
        res.json({ msg: '星球已爆炸消失，筆記已重新漂浮' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};