const { createClient } = require('@supabase/supabase-js');

// ⚠️ ESTAS credenciais ficam SEGURAS no servidor (Netlify)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nlpjugpeexxgtmrcrkwx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service Role Key (não a anon!)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Hash da senha (não a senha!)

// Criar cliente com SERVICE KEY (permissões totais)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
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

        // Verificar senha usando hash simples
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(password).digest('hex');

        if (hash !== ADMIN_PASSWORD_HASH) {
            // Log de tentativa de acesso
            console.log('❌ Tentativa de login falhou');
            
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid password' })
            };
        }

        // Gerar token de sessão (válido por 1 hora)
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        console.log('✅ Login bem-sucedido');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                token: sessionToken,
                expiresAt: expiresAt.toISOString()
            })
        };

    } catch (error) {
        console.error('❌ Erro no login:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
