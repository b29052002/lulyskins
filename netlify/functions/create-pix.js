const fetch = require('node-fetch');

// 🔒 Agora vem do Netlify (seguro)
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

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

    // Verifica variável de ambiente
    if (!ACCESS_TOKEN) {
        console.error('MP_ACCESS_TOKEN não configurado');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    try {
        const paymentData = JSON.parse(event.body);

        console.log('📥 Dados recebidos:', paymentData);

        // ===== Validações básicas =====
        if (!paymentData.transaction_amount || paymentData.transaction_amount <= 0) {
            throw new Error('Valor inválido');
        }

        if (!paymentData.description) {
            throw new Error('Descrição obrigatória');
        }

        // ===== GARANTE PAYER (aqui estava o problema) =====
        const payer = paymentData.payer || {};

        const payerData = {
            email: payer.email || 'cliente@rifa.com',
            first_name: payer.first_name || 'Cliente',
            last_name: payer.last_name || 'Rifa'
        };

        // ===== Payload Mercado Pago =====
        const mpPayload = {
            transaction_amount: Number(paymentData.transaction_amount),
            description: paymentData.description,
            payment_method_id: 'pix',
            payer: payerData,
            notification_url: paymentData.notification_url,
            external_reference: paymentData.external_reference
        };

        console.log('📤 Enviando para MP:', mpPayload);

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
            },
            body: JSON.stringify(mpPayload)
        });

        const result = await response.json();

        console.log('📥 Resposta MP:', result);

        if (!response.ok) {
            console.error('❌ Erro Mercado Pago:', result);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: result.message || 'Erro Mercado Pago',
                    details: result
                })
            };
        }

        const transactionData =
            result.point_of_interaction?.transaction_data;

        if (!transactionData?.qr_code) {
            throw new Error('QR Code não retornado pelo Mercado Pago');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                id: result.id,
                qr_code: transactionData.qr_code,
                qr_code_base64: transactionData.qr_code_base64,
                ticket_url: transactionData.ticket_url
            })
        };

    } catch (error) {
        console.error('❌ Erro create-pix:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
