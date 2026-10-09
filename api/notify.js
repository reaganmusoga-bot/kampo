export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { toUserId, title, body, url } = req.body || {};

    if (!toUserId || !title) {
        return res.status(400).json({ error: 'Missing toUserId or title' });
    }

    const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        return res.status(500).json({ error: 'Server misconfigured' });
    }

    const payload = {
        app_id: ONESIGNAL_APP_ID,
        include_aliases: {
            external_id: [toUserId]
        },
        target_channel: 'push',
        headings: { en: title },
        contents: { en: body || 'New activity on Kampo' },
        url: url || 'https://kampo-two.vercel.app'
    };

    try {
        const r = await fetch('https://api.onesignal.com/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Key ' + ONESIGNAL_API_KEY
            },
            body: JSON.stringify(payload)
        });
        const data = await r.json();
   if (!r.ok) {
    console.error('OneSignal error:', JSON.stringify(data));
    return res.status(r.status).json({
        error: 'OneSignal failed',
        details: data,
        sent: payload
    });
}
        return res.status(200).json({ success: true, id: data.id });
    } catch (e) {
        console.error('Fetch error:', e);
        return res.status(500).json({ error: e.message });
    }
}
