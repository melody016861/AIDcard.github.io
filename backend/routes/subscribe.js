const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Subscription = require('../models/subscriptionModel');  // 確保路徑正確

// 訂閱路由
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: '請提供有效的電子郵件。' });
    }

    try {
        const newSubscription = new Subscription({ email });
        await newSubscription.save();
        res.status(200).json({ message: '訂閱成功！' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: '此電子郵件已經訂閱。' });
        }
        res.status(500).json({ error: '伺服器錯誤，請稍後再試。' });
    }
});

module.exports = router;
