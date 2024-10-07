// backend/routes/subscribe.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 創建一個簡單的 schema 來儲存訂閱的電子郵件
const Subscription = mongoose.model('Subscription', new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}));

// 訂閱路由
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    // 驗證電子郵件格式
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: '請提供有效的電子郵件。' });
    }

    try {
        // 將電子郵件儲存到 Subscription 集合中
        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        res.status(200).json({ message: '您已成功訂閱！' });
    } catch (err) {
        // 處理電子郵件已訂閱的情況
        if (err.code === 11000) {
            return res.status(400).json({ error: '此電子郵件已經訂閱。' });
        }
        console.error('訂閱錯誤:', err);
        res.status(500).json({ error: '伺服器錯誤，請稍後再試。' });
    }
});

module.exports = router;
