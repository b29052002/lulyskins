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
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        console.log('🔔 Webhook recebido:', {
            method: event.httpMethod,
            queryParams: event.queryStringParameters
        });

        // Mercado Pago envia notificações via query params
        const { type, data } = event.queryStringParameters || {};

        console.log('📦 Tipo de notificação:', type);
        console.log('📦 Data ID:', data ? JSON.parse(data).id : 'N/A');

        // Verificar se é notificação de pagamento
        if (type === 'payment') {
            const paymentId = JSON.parse(data).id;
            
            console.log('💳 Consultando pagamento:', paymentId);

            // Buscar detalhes do pagamento no Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });

            const payment = await response.json();

            console.log('📥 Pagamento consultado:', {
                id: payment.id,
                status: payment.status,
                external_reference: payment.external_reference
            });

            // Se pagamento foi aprovado
            if (payment.status === 'approved') {
                const saleId = payment.external_reference;

                console.log('✅ Pagamento aprovado! Atualizando venda:', saleId);

                // Atualizar status da venda no Supabase
                const { data: updateData, error: updateError } = await supabase
                    .from('raffle_sales')
                    .update({ 
                        payment_status: 'approved',
                        payment_id: payment.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', saleId)
                    .select();

                if (updateError) {
                    console.error('❌ Erro ao atualizar Supabase:', updateError);
                    throw updateError;
                }

                console.log('✅ Venda atualizada com sucesso:', updateData);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true,
                        message: 'Pagamento processado',
                        sale_id: saleId
                    })
                };
            } else {
                console.log('⏳ Pagamento ainda não aprovado:', payment.status);
                
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
        } else {
            console.log('ℹ️ Tipo de notificação ignorado:', type);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    message: 'Notificação recebida'
                })
            };
        }

    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                details: error.toString()
            })
        };
    }
};
