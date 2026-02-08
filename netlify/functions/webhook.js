// Netlify Function: Webhook Mercado Pago
// SDK v2
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');

// ===== SUPABASE =====
const SUPABASE_URL = 'https://nlpjugpeexxgtmrcrkwx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scGp1Z3BlZXh4Z3RtcmNya3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTI1MTgsImV4cCI6MjA4NTg4ODUxOH0.44yZ8FSVx2H0gT-jZ-dpPxK_VH9vCwBQ28v36i0PXHA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== MERCADO PAGO =====
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-2110354351670786-020516-b41ee554dbbbbc79c6a32ca9bb826019-44207380'
});
const payment = new Payment(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('📩 Webhook recebido:', JSON.stringify(body));

    // Aceita os dois formatos que o MP envia
    const paymentId = body?.data?.id || body?.id;

    if (!paymentId) {
      console.log('⚠️ Nenhum paymentId encontrado');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ignored: true })
      };
    }

    console.log('💳 Payment ID:', paymentId);

    // 🔧 CORREÇÃO: SDK v2 precisa de objeto { id: paymentId }
    const paymentInfo = await payment.get({ id: paymentId });
    
    console.log('📊 Status:', paymentInfo.status);
    console.log('🔖 External Reference:', paymentInfo.external_reference);

    if (paymentInfo.status === 'approved') {
      const saleId = paymentInfo.external_reference;

      if (!saleId) {
        console.log('⚠️ Pagamento aprovado sem external_reference');
      } else {
        const { error } = await supabase
          .from('raffle_sales')
          .update({
            payment_status: 'approved',
            payment_id: paymentId,
            paid_at: new Date().toISOString()
          })
          .eq('id', saleId);

        if (error) {
          console.error('❌ Erro Supabase:', error);
        } else {
          console.log('✅ Venda atualizada no Supabase');
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('❌ Erro no webhook:', err);
    console.error('❌ Message:', err.message);
    console.error('❌ Stack:', err.stack);
    
    return {
      statusCode: 200, // Retorna 200 para MP não ficar retentando
      headers,
      body: JSON.stringify({
        error: 'Webhook error',
        message: err.message
      })
    };
  }
};
