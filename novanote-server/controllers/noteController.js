const db = require('../config/db'); // 引入資料庫連線

// 獲取所有筆記
exports.getNotes = async (req, res) => {
    try {
        // 使用 LEFT JOIN 加上 GROUP_CONCAT 一次抓出筆記與其所有標籤
        const [rows] = await db.query(`
            SELECT n.*, GROUP_CONCAT(t.tag_name) as tags
            FROM notes n
            LEFT JOIN tags t ON n.id = t.note_id
            GROUP BY n.id
        `);

        // 將抓到的 tags 字串 (如 "工作,靈感") 轉回陣列 ["工作", "靈感"]
        const formattedRows = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
        }));

        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 新增筆記
exports.createNote = async (req, res) => {
    const { title, content, user_id, tags } = req.body; // 接收標籤陣列
    const x_pos = Math.random() * 0.6 + 0.2;
    const y_pos = Math.random() * 0.6 + 0.2;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 插入筆記
        const [result] = await connection.query(
            'INSERT INTO notes (title, content, x_pos, y_pos, user_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, x_pos, y_pos, user_id]
        );
        const newNoteId = result.insertId;

        // 插入標籤
        if (tags && tags.length > 0) {
            const tagValues = tags.map(tagName => [newNoteId, tagName]);
            await connection.query('INSERT INTO tags (note_id, tag_name) VALUES ?', [tagValues]);
        }

        await connection.commit();
        res.json({ msg: '筆記已飄入宇宙', noteId: newNoteId, x_pos, y_pos, tags: tags || [] });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 編輯筆記
exports.updateNote = async (req, res) => {
    const { title, content, tags } = req.body;
    const { id } = req.params;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 更新筆記內容
        await connection.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id]);

        // 更新標籤：先刪除該筆記的所有舊標籤，再重新插入新標籤
        await connection.query('DELETE FROM tags WHERE note_id = ?', [id]);

        if (tags && tags.length > 0) {
            const tagValues = tags.map(tagName => [id, tagName]);
            await connection.query('INSERT INTO tags (note_id, tag_name) VALUES ?', [tagValues]);
        }

        await connection.commit();
        res.json({ msg: '筆記與標籤已更新' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 獲取單一筆記內容
exports.getNoteById = async (req, res) => {
    try {
        // 同時抓取筆記內容
        const [notes] = await db.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
        if (notes.length === 0) return res.status(404).json({ error: "找不到該筆記" });

        // 抓取對應標籤
        const [tags] = await db.query('SELECT tag_name FROM tags WHERE note_id = ?', [req.params.id]);
        
        res.json({
            ...notes[0],
            tags: tags.map(t => t.tag_name) // 轉成純字串陣列
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 歸類筆記
exports.moveNote = async (req, res) => {
    const { planet_id } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE notes SET planet_id = ? WHERE id = ?', [planet_id, id]);
        res.json({ msg: '歸類成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 更新座標
exports.updatePosition = async (req, res) => {
    const { x_pos, y_pos } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE notes SET x_pos = ?, y_pos = ? WHERE id = ?', [x_pos, y_pos, id]);
        res.json({ msg: '座標已更新' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 刪除筆記
exports.deleteNote = async (req, res) => {
    try {
        await db.query('DELETE FROM notes WHERE id = ?', [req.params.id]);
        res.json({ msg: '筆記已從宇宙消失' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};