require('dotenv').config()
const db = require('./config/db')

async function setupDatabase() {
  try {
    console.log('開始建立 NovaNote 資料表...\n')

    // 1. users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    console.log('✓ users')

    // 2. planets
    await db.query(`
      CREATE TABLE IF NOT EXISTS planets (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(20) DEFAULT '#646cff',
        texture_type VARCHAR(50) DEFAULT 'rocky',
        x_pos DOUBLE DEFAULT 0,
        y_pos DOUBLE DEFAULT 0,
        user_id INT UNSIGNED NULL,
        deleted_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_planets_user_id (user_id),
        INDEX idx_planets_deleted_at (deleted_at),

        CONSTRAINT fk_planets_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE SET NULL
      )
    `)

    console.log('✓ planets')

    // 3. notes
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT '未命名文件',
        content LONGTEXT,
        x_pos DOUBLE DEFAULT 0,
        y_pos DOUBLE DEFAULT 0,
        user_id INT UNSIGNED NULL,
        planet_id INT UNSIGNED NULL,
        deleted_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        INDEX idx_notes_user_id (user_id),
        INDEX idx_notes_planet_id (planet_id),
        INDEX idx_notes_deleted_at (deleted_at),

        CONSTRAINT fk_notes_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_notes_planet
          FOREIGN KEY (planet_id)
          REFERENCES planets(id)
          ON DELETE SET NULL
      )
    `)

    console.log('✓ notes')

    // 4. tags
    await db.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        note_id INT UNSIGNED NOT NULL,
        tag_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_tags_note_id (note_id),
        INDEX idx_tags_tag_name (tag_name),

        CONSTRAINT fk_tags_note
          FOREIGN KEY (note_id)
          REFERENCES notes(id)
          ON DELETE CASCADE
      )
    `)

    console.log('✓ tags')

    // 5. links
    await db.query(`
      CREATE TABLE IF NOT EXISTS links (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

        source_type VARCHAR(20) NOT NULL,
        source_id INT UNSIGNED NOT NULL,

        target_type VARCHAR(20) NOT NULL,
        target_id INT UNSIGNED NULL,

        target_url VARCHAR(2048) NULL,
        display_text VARCHAR(255) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_links_source (source_type, source_id),
        INDEX idx_links_target (target_type, target_id),
        INDEX idx_links_created_at (created_at)
      )
    `)

    console.log('✓ links')

    console.log('\nNovaNote 資料庫建立完成！')

    const [tables] = await db.query('SHOW TABLES')
    console.table(tables)

    process.exit(0)
  } catch (err) {
    console.error('\n❌ 建立資料庫失敗')
    console.error(err)
    process.exit(1)
  }
}

setupDatabase()