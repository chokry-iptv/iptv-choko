// api/proxy.js
// استخدام require بدلاً من import لتفادي مشاكل الـ ESM

module.exports = async (req, res) => {
    // 1. استخراج رابط البث المستهدف
    const targetUrl = req.query.url;

    if (!targetUrl) {
        res.status(400).send('Error: URL parameter is required.');
        return;
    }

    try {
        // 2. استخدام دالة fetch العالمية (متاحة في بيئات Vercel الحديثة)
        const response = await fetch(targetUrl, {
            method: 'GET',
            // 🛡️ 3. إضافة الهيدرات لتجاوز حظر 403
            headers: {
                'User-Agent': 'VLC/3.0.17 LibVLC/3.0.17',
                'Referer': 'https://www.google.com/', 
                'Accept': '*/*'
            }
        });

        // 4. تعيين هيدرات CORS للسماح بالوصول
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // 5. إعادة توجيه رمز الحالة ونوع المحتوى
        res.status(response.status);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain');

        // 6. إرجاع المحتوى
        // (Note: response.body.pipe(res) requires the response to be streamable)
        response.body.pipe(res);

    } catch (error) {
        console.error('Vercel Proxy Error:', error);
        res.status(500).send('Proxy Failed to Fetch Resource.');
    }
};
