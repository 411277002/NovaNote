require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const planetRoutes = require('./routes/planets');
const noteRoutes = require('./routes/notes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/notes', noteRoutes);


// --- 伺服器啟動 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 NovaNote 宇宙伺服器啟動成功！
    🔗 網址：http://localhost:${PORT}
    📡 權限系統：/api/auth
    🪐 星球系統：/api/planets
    📝 筆記系統：/api/notes
    `);
});

module.exports = app;