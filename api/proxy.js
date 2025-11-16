// api/proxy.js
// يستخدم تنسيق CommonJS لضمان التوافق مع بيئة Vercel
// ويستخدم دالة fetch العالمية المتاحة افتراضياً.

module.exports = async (req, res) => {
    // 1. استخراج رابط البث المستهدف
    const targetUrl = req.query.url;

    if (!targetUrl) {
        // الرد برمز خطأ 400 إذا كان رابط البث مفقوداً
        res.status(400).send('Error: URL parameter is required.');
        return;
    }

    try {
        // 2. إرسال الطلب من خادم Vercel
        const response = await fetch(targetUrl, {
            method: 'GET',
            // 🛡️ 3. إضافة الهيدرات لتجاوز حظر 403 (Forbidden)
            headers: {
                // التظاهر بأن الطلب قادم من مشغل وسائط موثوق
                'User-Agent': 'VLC/3.0.17 LibVLC/3.0.17',
                // إيهام الخادم بأن الطلب قادم من نطاق آمن
                'Referer': 'https://www.google.com/', 
                'Accept': '*/*'
            }
        });

        // 4. تعيين هيدرات CORS للسماح بالوصول من تطبيقك على أي نطاق
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // 5. إعادة توجيه رمز الحالة ونوع المحتوى
        res.status(response.status);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');

        // 6. إرجاع المحتوى (ملف M3U أو جزء البث) كتّيار (Stream)
        response.body.pipe(res);

    } catch (error) {
        // التعامل مع أخطاء الاتصال الداخلي
        console.error('Vercel Proxy Error:', error);
        res.status(500).send('Proxy Failed to Fetch Resource. Check Vercel logs.');
    }
};
