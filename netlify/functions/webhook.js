const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Credenciais
const ACCESS_TOKEN = 'APP_USR-2110354351670786-020516-b41ee554dbbbbc79c6a32ca9bb826019-44207380';
const SUPABASE_URL = 'https://nlpjugpeexxgtmrcrkwx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scGp1Z3BlZXh4Z3RtcmNya3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTI1MTgsImV4cCI6MjA4NTg4ODUxOH0.44yZ8FSVx2H0gT-jZ-dpPxK_VH9vCwBQ28v36i0PXHA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        console.log('🔔 ===== WEBHOOK RECEBIDO =====');
        console.log('📋 Method:', event.httpMethod);
        console.log('📋 Headers:', JSON.stringify(event.headers, null, 2));
        console.log('📋 Query Params:', JSON.stringify(event.queryStringParameters, null, 2));
        console.log('📋 Body:', event.body);

        let paymentId = null;
        let notificationType = null;

        // MÉTODO 1: Via Query Params (formato antigo)
        const { type, data } = event.queryStringParameters || {};
        if (type && data) {
            console.log('📦 Notificação via Query Params (antigo)');
            notificationType = type;
            try {
                const parsedData = JSON.parse(data);
                paymentId = parsedData.id;
            } catch (e) {
                paymentId = data;
            }
        }

        // MÉTODO 2: Via Body POST (formato novo - v1)
        if (!paymentId && event.body) {
            try {
                const body = JSON.parse(event.body);
                console.log('📦 Body Parsed:', JSON.stringify(body, null, 2));
                
                // Formato 1: { type: "payment", data: { id: "123" } }
                if (body.type && body.data && body.data.id) {
                    console.log('📦 Notificação via Body - Formato 1');
                    notificationType = body.type;
                    paymentId = body.data.id;
                }
                
                // Formato 2: { action: "payment.updated", data: { id: "123" } }
                else if (body.action && body.data && body.data.id) {
                    console.log('📦 Notificação via Body - Formato 2');
                    notificationType = 'payment';
                    paymentId = body.data.id;
                }
                
                // Formato 3: { id: "123", topic: "payment" }
                else if (body.id && body.topic) {
                    console.log('📦 Notificação via Body - Formato 3');
                    notificationType = body.topic;
                    paymentId = body.id;
                }
            } catch (e) {
                console.error('⚠️ Erro ao parsear body:', e);
            }
        }

        console.log('🔍 Payment ID extraído:', paymentId);
        console.log('🔍 Tipo de notificação:', notificationType);

        // Se não encontrou payment ID, retornar ok mas logar
        if (!paymentId) {
            console.log('⚠️ Payment ID não encontrado. Ignorando notificação.');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Notificação recebida mas sem payment ID'
                })
            };
        }

        // Verificar se é notificação de pagamento
        if (notificationType !== 'payment') {
            console.log('ℹ️ Tipo de notificação ignorado:', notificationType);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Notificação recebida'
                })
            };
        }

        console.log('💳 Consultando pagamento no Mercado Pago:', paymentId);

        // Buscar detalhes do pagamento no Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!mpResponse.ok) {
            console.error('❌ Erro ao consultar Mercado Pago:', mpResponse.status);
            const errorText = await mpResponse.text();
            console.error('❌ Response:', errorText);
            throw new Error(`MP API error: ${mpResponse.status}`);
        }

        const payment = await mpResponse.json();

        console.log('📥 Pagamento consultado:');
        console.log('   ID:', payment.id);
        console.log('   Status:', payment.status);
        console.log('   External Reference:', payment.external_reference);
        console.log('   Amount:', payment.transaction_amount);

        // Se pagamento foi aprovado
        if (payment.status === 'approved') {
            const saleId = payment.external_reference;

            if (!saleId) {
                console.error('❌ External reference vazio!');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Sale ID not found in external_reference' })
                };
            }

            console.log('✅ Pagamento APROVADO! Atualizando venda:', saleId);

            // Atualizar status da venda no Supabase
            const { data: updateData, error: updateError } = await supabase
                .from('raffle_sales')
                .update({ 
                    payment_status: 'approved',
                    payment_id: payment.id
                })
                .eq('id', saleId)
                .select();

            if (updateError) {
                console.error('❌ Erro ao atualizar Supabase:', updateError);
                throw updateError;
            }

            console.log('✅ Venda atualizada com sucesso!');
            console.log('✅ Data:', JSON.stringify(updateData, null, 2));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Pagamento processado com sucesso',
                    sale_id: saleId,
                    payment_id: payment.id
                })
            };
        } else {
            console.log('⏳ Pagamento ainda não aprovado. Status:', payment.status);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Pagamento em processamento',
                    status: payment.status
                })
            };
        }

    } catch (error) {
        console.error('💥 ERRO CRÍTICO no webhook:', error);
        console.error('💥 Stack:', error.stack);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            })
        };
    }
};
