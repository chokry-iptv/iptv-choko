// api/proxy.js
import fetch from 'node-fetch'; 

export default async (req, res) => {
    // 1. استخراج رابط البث المستهدف
    const targetUrl = req.query.url;

    if (!targetUrl) {
        res.status(400).send('Error: URL parameter is required.');
        return;
    }

    try {
        // 2. إرسال الطلب من خادم Vercel
        const response = await fetch(targetUrl, {
            method: 'GET',
            // 🛡️ 3. إضافة الهيدرات اللازمة لتجاوز حظر 403
            headers: {
                'User-Agent': 'VLC/3.0.17 LibVLC/3.0.17',
                'Referer': 'https://www.google.com/', 
                'Accept': '*/*'
            }
        });

        // 4. تعيين هيدر CORS للسماح لتطبيقك بالوصول إلى الدالة
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // 5. إعادة توجيه رمز الحالة ونوع المحتوى
        res.status(response.status);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');

        // 6. إرجاع المحتوى
        response.body.pipe(res);

    } catch (error) {
        console.error('Vercel Proxy Error:', error);
        res.status(500).send('Proxy Failed to Fetch Resource.');
    }
};
