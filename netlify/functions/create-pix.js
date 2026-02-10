const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {

    const headers = {
        'Access-Control-Allow-Origin': 'https://www.lulyskins.com.br',
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

    if (!ACCESS_TOKEN) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    try {

        const paymentData = JSON.parse(event.body);

        const saleId = paymentData.external_reference;

        if (!saleId) throw new Error('Venda inválida');

        // 🔍 Busca venda no banco
        const { data: sale, error } = await supabase
            .from('raffle_sales')
            .select('*')
            .eq('id', saleId)
            .single();

        if (error || !sale) throw new Error('Venda não encontrada');

        if (sale.payment_status === 'approved') {
            throw new Error('Venda já paga');
        }

        const payer = paymentData.payer || {};

        const mpPayload = {
            transaction_amount: Number(sale.total_amount),
            description: sale.description || 'Rifa lulyskins',
            payment_method_id: 'pix',
            payer: {
                email: payer.email || 'cliente@rifa.com',
                first_name: payer.first_name || 'Cliente',
                last_name: payer.last_name || 'Rifa'
            },
            external_reference: sale.id,
            notification_url: 'https://www.lulyskins.com.br/.netlify/functions/webhook'
        };

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': `${sale.id}-${Date.now()}`
            },
            body: JSON.stringify(mpPayload)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify(result)
            };
        }

        const transactionData = result.point_of_interaction?.transaction_data;

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

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
