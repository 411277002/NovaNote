const db = require('../config/db');

// 新增連結
exports.createLink = async (req, res) => {
  try {
    const {
      source_type,
      source_id,
      target_type,
      target_id,
      target_url,
      display_text
    } = req.body;

    if (!source_type || !source_id || !target_type || !display_text) {
      return res.status(400).json({ message: '缺少必要欄位' });
    }

    if (target_type === 'url' && !target_url) {
      return res.status(400).json({ message: '外部網站連結需要網址' });
    }

    if ((target_type === 'note' || target_type === 'planet') && !target_id) {
      return res.status(400).json({ message: '內部連結需要目標 ID' });
    }

    const sql = `
      INSERT INTO links 
      (source_type, source_id, target_type, target_id, target_url, display_text)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      source_type,
      source_id,
      target_type,
      target_id || null,
      target_url || null,
      display_text
    ]);

    res.status(201).json({
      message: '連結新增成功',
      linkId: result.insertId
    });
  } catch (error) {
    console.error('新增連結失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

exports.getAllLinks = async (req, res) => {
  try {
    const [links] = await db.query(`
      SELECT * FROM links
      ORDER BY created_at DESC
    `)

    res.json(links)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '取得 links 失敗' })
  }
}

// 查詢某個筆記或星球連出去的連結
exports.getLinksBySource = async (req, res) => {
  try {
    const { source_type, source_id } = req.params;

    const sql = `
      SELECT * FROM links
      WHERE source_type = ? AND source_id = ?
      ORDER BY created_at DESC
    `;

    const [links] = await db.query(sql, [source_type, source_id]);

    res.json(links);
  } catch (error) {
    console.error('查詢連結失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

// 查詢反向連結
exports.getBacklinks = async (req, res) => {
  try {
    const { target_type, target_id } = req.params;

    const sql = `
      SELECT * FROM links
      WHERE target_type = ? AND target_id = ?
      ORDER BY created_at DESC
    `;

    const [links] = await db.query(sql, [target_type, target_id]);

    res.json(links);
  } catch (error) {
    console.error('查詢反向連結失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

// 刪除連結
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM links WHERE id = ?`;
    await db.query(sql, [id]);

    res.json({ message: '連結刪除成功' });
  } catch (error) {
    console.error('刪除連結失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};