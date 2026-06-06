const db = require('../config/db')
const bcrypt = require('bcryptjs')

// 取得使用者資料
exports.getProfile = async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await db.query(
      `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
      `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到使用者' })
    }

    res.json(rows[0])
  } catch (err) {
    console.error('取得個人資料失敗:', err)
    res.status(500).json({ error: err.message })
  }
}

// 修改名稱
exports.updateProfile = async (req, res) => {
  const { id } = req.params
  const { username } = req.body

  if (!username || !username.trim()) {
    return res.status(400).json({ error: '使用者名稱不能空白' })
  }

  try {
    await db.query(
      `
      UPDATE users
      SET username = ?
      WHERE id = ?
      `,
      [username.trim(), id]
    )

    const [rows] = await db.query(
      `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
      `,
      [id]
    )

    res.json(rows[0])
  } catch (err) {
    console.error('更新個人資料失敗:', err)
    res.status(500).json({ error: err.message })
  }
}

// 修改密碼
exports.updatePassword = async (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '請輸入目前密碼與新密碼' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密碼至少需要 6 個字元' })
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到使用者' })
    }

    const user = rows[0]

    // 如果你的 users 表密碼欄位不是 password，而是 password_hash，
    // 請把下面的 user.password 改成 user.password_hash
    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(400).json({ error: '目前密碼不正確' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, id]
    )

    res.json({ msg: '密碼已更新' })
  } catch (err) {
    console.error('更新密碼失敗:', err)
    res.status(500).json({ error: err.message })
  }
}