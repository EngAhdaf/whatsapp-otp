const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// إعداد العميل مع الحفاظ على الجلسة واستخدام إعدادات مناسبة للسيرفرات
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('--- QR CODE ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ تم الاتصال بالواتساب بنجاح وجاهز للإرسال!');
});

// نقطة النهاية (API Endpoint) لإرسال الـ OTP
app.post('/send-otp', async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ status: 'error', message: 'يرجى إرسال phone و otp' });
    }

    try {
        const formattedPhone = `${phone.replace('+', '').trim()}@c.us`;
        const message = `رمز التحقق الخاص بك هو: *${otp}*`;

        await client.sendMessage(formattedPhone, message);
        return res.json({ status: 'success', message: 'تم إرسال كود التحقق بنجاح' });
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});