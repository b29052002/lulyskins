const fetch = require('node-fetch');
const ACCESS_TOKEN = 'APP_USR-2110354351670786-020516-b41ee554dbbbbc79c6a32ca9bb826019-44207380';

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const paymentData = JSON.parse(event.body);

        console.log('📥 Recebendo solicitação de pagamento:', {
            amount: paymentData.transaction_amount,
            description: paymentData.description,
            external_reference: paymentData.external_reference
        });

        if (!paymentData.transaction_amount || paymentData.transaction_amount <= 0) {
            throw new Error('Valor inválido');
        }

        if (!paymentData.description) {
            throw new Error('Descrição é obrigatória');
        }

        const mpPayload = {
            transaction_amount: parseFloat(paymentData.transaction_amount),
            description: paymentData.description,
            payment_method_id: 'pix',
            payer: {
                email: paymentData.payer.email,
                first_name: paymentData.payer.first_name,
                last_name: paymentData.payer.last_name
            }
        };

        if (paymentData.notification_url) {
            mpPayload.notification_url = paymentData.notification_url;
        }

        if (paymentData.external_reference) {
            mpPayload.external_reference = paymentData.external_reference;
        }

        console.log('📤 Enviando para Mercado Pago:', mpPayload);

        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'X-Idempotency-Key': `${Date.now()}-${Math.random()}`
            },
            body: JSON.stringify(mpPayload)
        });

        const responseData = await response.json();

        console.log('📥 Resposta do Mercado Pago:', {
            status: response.status,
            id: responseData.id,
            status_payment: responseData.status
        });


        if (!response.ok) {
            console.error('❌ Erro do Mercado Pago:', responseData);
            throw new Error(responseData.message || 'Erro ao criar pagamento');
        }


        const pixData = {
            id: responseData.id,
            status: responseData.status,
            qr_code: responseData.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: responseData.point_of_interaction?.transaction_data?.qr_code_base64 || null,
            ticket_url: responseData.point_of_interaction?.transaction_data?.ticket_url || null
        };

 
        if (!pixData.qr_code || !pixData.qr_code_base64) {
            console.error('❌ QR Code não gerado:', responseData);
            throw new Error('QR Code não foi gerado pelo Mercado Pago');
        }

        console.log('✅ Pagamento PIX criado com sucesso!', {
            payment_id: pixData.id,
            has_qr_code: !!pixData.qr_code
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(pixData)
        };

    } catch (error) {
        console.error('❌ Erro na function:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Erro ao processar pagamento',
                details: error.toString()
            })
        };
    }
};
