// api/agora-token.js
import { RtcTokenBuilder, RtcRole } from 'agora-token';

export default async function handler(req, res) {
    // Allow your frontend to call this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { channelName, uid } = req.body;

        if (!channelName || !uid) {
            return res.status(400).json({ error: 'channelName and uid are required' });
        }

        // These come from Vercel environment variables (set in Step 2)
        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (!appId || !appCertificate) {
            return res.status(500).json({ error: 'Agora credentials not configured' });
        }

        // Token expires in 1 hour
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Build the token — role is publisher so the user can send their audio/video
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Token generation error:', error);
        return res.status(500).json({ error: 'Failed to generate token' });
    }
}
