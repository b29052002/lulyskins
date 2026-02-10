const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {

    const headers = {
        'Content-Type': 'application/json'
    };

    try {

        let paymentId = null;
        let notificationType = null;

        const { type, data } = event.queryStringParameters || {};

        if (type && data) {
            notificationType = type;
            try {
                const parsed = JSON.parse(data);
                paymentId = parsed.id;
            } catch {
                paymentId = data;
            }
        }

        if (!paymentId && event.body) {
            const body = JSON.parse(event.body);

            if (body.data?.id) {
                paymentId = body.data.id;
                notificationType = 'payment';
            }
        }

        if (!paymentId) {
            return { statusCode: 200, headers };
        }

        if (notificationType !== 'payment') {
            return { statusCode: 200, headers };
        }

        // ===== VALIDA ASSINATURA =====
        const xSignature = event.headers['x-signature'];
        const xRequestId = event.headers['x-request-id'];

        if (WEBHOOK_SECRET && xSignature && xRequestId) {

            let ts = null;
            let v1 = null;

            xSignature.split(',').forEach(part => {
                const [k, val] = part.split('=');
                if (k === 'ts') ts = val;
                if (k === 'v1') v1 = val;
            });

            const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;

            const expected = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(manifest)
                .digest('hex');

            if (expected !== v1) {
                return { statusCode: 401, headers };
            }
        }

        // ===== CONSULTA MP =====
        const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        const payment = await mpResponse.json();

        if (payment.status !== 'approved') {
            return { statusCode: 200, headers };
        }

        const saleId = payment.external_reference;

        if (!saleId) {
            return { statusCode: 400, headers };
        }

        // ===== BUSCA VENDA =====
        const { data: sale } = await supabase
            .from('raffle_sales')
            .select('*')
            .eq('id', saleId)
            .single();

        if (!sale) {
            return { statusCode: 400, headers };
        }

        // ===== VALIDA VALOR =====
        const expectedAmount = Number(sale.total_amount);
        const paidAmount = Number(payment.transaction_amount);

        if (expectedAmount !== paidAmount) {
            return { statusCode: 400, headers };
        }

        if (sale.payment_status === 'approved') {
            return { statusCode: 200, headers };
        }

        // ===== ATUALIZA VENDA =====
        await supabase
            .from('raffle_sales')
            .update({
                payment_status: 'approved',
                payment_id: payment.id
            })
            .eq('id', saleId);

        return { statusCode: 200, headers };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
