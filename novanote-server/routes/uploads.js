const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const uploadRoot = path.join(__dirname, '..', 'uploads')
const imageDir = path.join(uploadRoot, 'images')
const videoDir = path.join(uploadRoot, 'videos')

ensureDir(imageDir)
ensureDir(videoDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imageDir)
      return
    }

    if (file.mimetype.startsWith('video/')) {
      cb(null, videoDir)
      return
    }

    cb(new Error('只允許上傳圖片或影片'))
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, safeName)
  }
})

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/')
  const isVideo = file.mimetype.startsWith('video/')

  if (!isImage && !isVideo) {
    cb(new Error('只允許上傳圖片或影片'), false)
    return
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 200 // 200MB
  }
})

router.post('/media', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '沒有收到檔案' })
  }

  const isImage = req.file.mimetype.startsWith('image/')
  const folder = isImage ? 'images' : 'videos'

  const fileUrl = `/uploads/${folder}/${req.file.filename}`

  res.json({
    url: fileUrl,
    type: isImage ? 'image' : 'video',
    filename: req.file.filename,
    originalName: req.file.originalname
  })
})

module.exports = router