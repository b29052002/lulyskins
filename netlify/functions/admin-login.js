const crypto = require('crypto');

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    if (!ADMIN_PASSWORD_HASH) {
        console.error("ADMIN_PASSWORD_HASH not set");
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    try {
        const { password } = JSON.parse(event.body);

        if (!password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Password required' })
            };
        }

        // Hash SHA256
        const hash = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        if (hash !== ADMIN_PASSWORD_HASH) {
            console.log('❌ Login failed');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' })
            };
        }

        // Criar token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1h

        console.log('✅ Admin login');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token,
                expiresAt
            })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
