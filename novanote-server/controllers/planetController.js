const db = require('../config/db');

// 1. 獲取所有正常星球，不包含垃圾桶星球
exports.getPlanets = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE deleted_at IS NULL
      ORDER BY id DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error('取得星球失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 2. 創建新星球
exports.createPlanet = async (req, res) => {
  const { name, color, texture_type, user_id, x_pos, y_pos } = req.body;

  const finalX = x_pos !== undefined ? x_pos : Math.random();
  const finalY = y_pos !== undefined ? y_pos : Math.random();

  try {
    const [result] = await db.query(
      `
      INSERT INTO planets 
        (name, color, texture_type, x_pos, y_pos, user_id, deleted_at) 
      VALUES (?, ?, ?, ?, ?, ?, NULL)
      `,
      [
        name || '未命名星球',
        color || '#646cff',
        texture_type || 'rocky',
        finalX,
        finalY,
        user_id || null
      ]
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [result.insertId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('資料庫寫入星球失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 3. 更新星球座標
exports.updatePlanetPosition = async (req, res) => {
  const { x_pos, y_pos } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `
      UPDATE planets
      SET x_pos = ?, y_pos = ?
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [x_pos, y_pos, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到星球，或星球已在垃圾桶中' });
    }

    res.json({
      msg: '星球軌道已校準',
      id,
      x_pos,
      y_pos
    });
  } catch (err) {
    console.error('更新星球座標失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 4. 編輯星球：改名、換顏色、換地貌
exports.updatePlanet = async (req, res) => {
  const { name, color, texture_type } = req.body;
  const { id } = req.params;

  try {
    const [oldRows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (oldRows.length === 0) {
      return res.status(404).json({ error: '找不到星球，或星球已在垃圾桶中' });
    }

    const oldPlanet = oldRows[0];

    await db.query(
      `
      UPDATE planets
      SET 
        name = ?,
        color = ?,
        texture_type = ?
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [
        name || oldPlanet.name || '未命名星球',
        color || oldPlanet.color || '#646cff',
        texture_type || oldPlanet.texture_type || 'rocky',
        id
      ]
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('更新星球資訊失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 5. 刪除星球：移到垃圾桶，不是真的刪除
exports.deletePlanet = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到星球，或星球已經在垃圾桶中' });
    }

    await db.query(
      `
      UPDATE planets
      SET deleted_at = NOW()
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    // 注意：
    // 移到垃圾桶時，不清空 notes.planet_id。
    // 這樣之後復原星球時，原本在星球內的卡片還會保留關係。

    res.json({
      msg: '星球已移到星際回收站',
      planetId: id
    });
  } catch (err) {
    console.error('移到垃圾桶失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 6. 取得垃圾桶中的星球
exports.getTrashPlanets = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error('取得垃圾桶星球失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 7. 復原垃圾桶中的星球
exports.restorePlanet = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NOT NULL
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到垃圾桶中的星球' });
    }

    await db.query(
      `
      UPDATE planets
      SET deleted_at = NULL
      WHERE id = ?
      `,
      [id]
    );

    const [restoredRows] = await db.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    res.json({
      msg: '星球已從星際回收站復原',
      planet: restoredRows[0]
    });
  } catch (err) {
    console.error('復原星球失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 8. 永久刪除星球：連同星球內部卡片一起永久刪除
exports.permanentDeletePlanet = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [planetRows] = await connection.query(
      `
      SELECT *
      FROM planets
      WHERE id = ?
      `,
      [id]
    );

    if (planetRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '找不到星球' });
    }

    // 1. 找出這顆星球內的所有卡片
    const [noteRows] = await connection.query(
      `
      SELECT id
      FROM notes
      WHERE planet_id = ?
      `,
      [id]
    );

    const noteIds = noteRows.map(note => note.id);

    // 2. 如果星球內有卡片，先刪除這些卡片的 tags / links / notes
    if (noteIds.length > 0) {
      await connection.query(
        `
        DELETE FROM tags
        WHERE note_id IN (?)
        `,
        [noteIds]
      );

      await connection.query(
        `
        DELETE FROM links
        WHERE
          (source_type = 'note' AND source_id IN (?))
          OR
          (target_type = 'note' AND target_id IN (?))
        `,
        [noteIds, noteIds]
      );

      await connection.query(
        `
        DELETE FROM notes
        WHERE id IN (?)
        `,
        [noteIds]
      );
    }

    // 3. 刪除與此星球有關的星球連線 / 卡片連線
    await connection.query(
      `
      DELETE FROM links
      WHERE
        (source_type = 'planet' AND source_id = ?)
        OR
        (target_type = 'planet' AND target_id = ?)
      `,
      [id, id]
    );

    // 4. 最後永久刪除星球
    await connection.query(
      `
      DELETE FROM planets
      WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    res.json({
      msg: '星球與內部卡片已永久刪除',
      planetId: id,
      deletedNoteCount: noteIds.length
    });
  } catch (err) {
    await connection.rollback();

    console.error('永久刪除星球失敗:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};