// backend/routes/recyclingDiaryRoutes.js

const express = require('express');
const router = express.Router();
const RecyclingDiary = require('../models/recyclingDiaryModel'); // 你的日記模型
const multer = require('multer');
const path = require('path');

// 設置 multer 的存儲引擎
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 指定文件保存的文件夾
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用當前時間戳作為文件名
    }
});

const upload = multer({ storage: storage });


// 這是處理日記提交的 POST 路由
router.post('/api/recycling-diary', upload.single('image'), async (req, res) => {
    try {
        // 從請求中提取標題和內容
        const { title, content } = req.body;

        // 建立新的日記實例
        const newDiary = new RecyclingDiary({
            userId: req.user._id, // 假設你已經設置了 userId
            title: title || '無標題',
            content: content || '無內容',
            image: req.file ? req.file.path : null,
        });

        // 儲存日記
        await newDiary.save();

        // 返回成功回應
        res.status(201).json({ msg: '日記已保存', diary: newDiary });
    } catch (error) {
        console.error('Error saving diary:', error);
        res.status(500).json({ msg: '保存日記時出錯' });
    }
});

module.exports = router;
