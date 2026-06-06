const db = require('../config/db');

// 1. 獲取所有正常筆記，不包含垃圾桶筆記
exports.getNotes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        n.*, 
        GROUP_CONCAT(t.tag_name) AS tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.deleted_at IS NULL
      GROUP BY n.id
      ORDER BY n.id DESC
    `);

    const formattedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('取得筆記失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 2. 新增筆記
exports.createNote = async (req, res) => {
    const { title, content, user_id, tags, planet_id } = req.body;

    const x_pos = Math.random() * 0.6 + 0.2;
    const y_pos = Math.random() * 0.6 + 0.2;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            INSERT INTO notes
                (title, content, x_pos, y_pos, user_id, planet_id, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, NULL)
            `,
            [
                title || '未命名文件',
                content || '',
                x_pos,
                y_pos,
                user_id || null,
                planet_id || null
            ]
        );

        const newNoteId = result.insertId;

        if (tags && tags.length > 0) {
            const tagValues = tags.map(tagName => [newNoteId, tagName]);
            await connection.query(
                'INSERT INTO tags (note_id, tag_name) VALUES ?',
                [tagValues]
            );
        }

        const [rows] = await connection.query(
            'SELECT * FROM notes WHERE id = ?',
            [newNoteId]
        );

        await connection.commit();

        res.json({
            ...rows[0],
            tags: tags || []
        });
    } catch (err) {
        await connection.rollback();
        console.error('新增筆記失敗:', err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// 3. 編輯筆記
exports.updateNote = async (req, res) => {
  const { title, content, tags } = req.body;
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [noteRows] = await connection.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (noteRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '找不到筆記，或筆記已在垃圾桶中' });
    }

    await connection.query(
      `
      UPDATE notes
      SET title = ?, content = ?
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [
        title || '未命名文件',
        content || '',
        id
      ]
    );

    await connection.query(
      'DELETE FROM tags WHERE note_id = ?',
      [id]
    );

    if (tags && tags.length > 0) {
      const cleanTags = tags
        .map(tagName => String(tagName).trim())
        .filter(Boolean);

      if (cleanTags.length > 0) {
        const tagValues = cleanTags.map(tagName => [id, tagName]);

        await connection.query(
          'INSERT INTO tags (note_id, tag_name) VALUES ?',
          [tagValues]
        );
      }
    }

    const [updatedRows] = await connection.query(
      `
      SELECT 
        n.*, 
        GROUP_CONCAT(t.tag_name) AS tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.id = ?
      AND n.deleted_at IS NULL
      GROUP BY n.id
      `,
      [id]
    );

    await connection.commit();

    const updatedNote = updatedRows[0];

    res.json({
      msg: '筆記與標籤已更新',
      note: {
        ...updatedNote,
        tags: updatedNote.tags ? updatedNote.tags.split(',') : []
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('更新筆記失敗:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// 4. 獲取單一正常筆記內容
exports.getNoteById = async (req, res) => {
  const { id } = req.params;

  try {
    const [notes] = await db.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (notes.length === 0) {
      return res.status(404).json({ error: '找不到該筆記，或筆記已在垃圾桶中' });
    }

    const [tags] = await db.query(
      'SELECT tag_name FROM tags WHERE note_id = ?',
      [id]
    );

    res.json({
      ...notes[0],
      tags: tags.map(t => t.tag_name)
    });
  } catch (err) {
    console.error('取得單一筆記失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 5. 歸類筆記到星球 / 離開星球
exports.moveNote = async (req, res) => {
  const { planet_id } = req.body;
  const { id } = req.params;

  try {
    const [noteRows] = await db.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (noteRows.length === 0) {
      return res.status(404).json({ error: '找不到筆記，或筆記已在垃圾桶中' });
    }

    if (planet_id !== null && planet_id !== undefined) {
      const [planetRows] = await db.query(
        `
        SELECT *
        FROM planets
        WHERE id = ?
        AND deleted_at IS NULL
        `,
        [planet_id]
      );

      if (planetRows.length === 0) {
        return res.status(404).json({ error: '找不到目標星球，或星球已在垃圾桶中' });
      }
    }

    await db.query(
      `
      UPDATE notes
      SET planet_id = ?
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [planet_id || null, id]
    );

    res.json({
      msg: planet_id ? '歸類成功' : '已離開星球',
      noteId: id,
      planet_id: planet_id || null
    });
  } catch (err) {
    console.error('歸類筆記失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 6. 更新座標
exports.updatePosition = async (req, res) => {
  const { x_pos, y_pos } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `
      UPDATE notes
      SET x_pos = ?, y_pos = ?
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [x_pos, y_pos, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到筆記，或筆記已在垃圾桶中' });
    }

    res.json({
      msg: '座標已更新',
      noteId: id,
      x_pos,
      y_pos
    });
  } catch (err) {
    console.error('更新筆記座標失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 7. 刪除筆記：移到垃圾桶，不是真的刪除
exports.deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到筆記，或筆記已經在垃圾桶中' });
    }

    await db.query(
      `
      UPDATE notes
      SET deleted_at = NOW()
      WHERE id = ?
      AND deleted_at IS NULL
      `,
      [id]
    );

    res.json({
      msg: '筆記已移到星際回收站',
      noteId: id
    });
  } catch (err) {
    console.error('移動筆記到垃圾桶失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 8. 取得垃圾桶中的筆記
exports.getTrashNotes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        n.*, 
        GROUP_CONCAT(t.tag_name) AS tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.deleted_at IS NOT NULL
      GROUP BY n.id
      ORDER BY n.deleted_at DESC
    `);

    const formattedRows = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('取得垃圾桶筆記失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 9. 復原垃圾桶中的筆記
exports.restoreNote = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      AND deleted_at IS NOT NULL
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到垃圾桶中的筆記' });
    }

    await db.query(
      `
      UPDATE notes
      SET deleted_at = NULL
      WHERE id = ?
      `,
      [id]
    );

    const [restoredRows] = await db.query(
      `
      SELECT 
        n.*, 
        GROUP_CONCAT(t.tag_name) AS tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.id = ?
      AND n.deleted_at IS NULL
      GROUP BY n.id
      `,
      [id]
    );

    const restoredNote = restoredRows[0];

    res.json({
      msg: '筆記已從星際回收站復原',
      note: {
        ...restoredNote,
        tags: restoredNote.tags ? restoredNote.tags.split(',') : []
      }
    });
  } catch (err) {
    console.error('復原筆記失敗:', err);
    res.status(500).json({ error: err.message });
  }
};

// 10. 永久刪除筆記
exports.permanentDeleteNote = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM notes
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '找不到筆記' });
    }

    // 先刪除 tags，避免留下無效標籤
    await connection.query(
      'DELETE FROM tags WHERE note_id = ?',
      [id]
    );

    // 刪除 links 表中與這張 note 有關的連線
    await connection.query(
      `
      DELETE FROM links
      WHERE
        (source_type = 'note' AND source_id = ?)
        OR
        (target_type = 'note' AND target_id = ?)
      `,
      [id, id]
    );

    // 最後才真的刪除 note
    await connection.query(
      'DELETE FROM notes WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.json({
      msg: '筆記已永久刪除',
      noteId: id
    });
  } catch (err) {
    await connection.rollback();

    console.error('永久刪除筆記失敗:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};