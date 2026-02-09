const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis de ambiente não configuradas corretamente');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        console.log('🔔 ===== WEBHOOK RECEBIDO =====');
        console.log('Method:', event.httpMethod);
        console.log('Query:', event.queryStringParameters);
        console.log('Body:', event.body);

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
            try {
                const body = JSON.parse(event.body);

                if (body.type && body.data?.id) {
                    notificationType = body.type;
                    paymentId = body.data.id;
                }
                else if (body.action && body.data?.id) {
                    notificationType = 'payment';
                    paymentId = body.data.id;
                }
                else if (body.topic && body.id) {
                    notificationType = body.topic;
                    paymentId = body.id;
                }
            } catch (e) {
                console.error('Erro ao parsear body:', e);
            }
        }

        console.log('Payment ID:', paymentId);
        console.log('Type:', notificationType);

        
        if (!paymentId) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Sem payment ID'
                })
            };
        }

        if (notificationType !== 'payment') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Tipo ignorado'
                })
            };
        }

 
        console.log('Consultando Mercado Pago:', paymentId);

        const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            console.error('Erro MP:', errorText);
            throw new Error(`MP error ${mpResponse.status}`);
        }

        const payment = await mpResponse.json();

        console.log('Status:', payment.status);
        console.log('External Ref:', payment.external_reference);


        if (payment.status === 'approved') {
            const saleId = payment.external_reference;

            if (!saleId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'external_reference vazio' })
                };
            }

            console.log('Atualizando venda:', saleId);

            const { error } = await supabase
                .from('raffle_sales')
                .update({
                    payment_status: 'approved',
                    payment_id: payment.id
                })
                .eq('id', saleId);

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }

            console.log('Venda atualizada');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    sale_id: saleId
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                status: payment.status
            })
        };

    } catch (error) {
        console.error('💥 ERRO:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
