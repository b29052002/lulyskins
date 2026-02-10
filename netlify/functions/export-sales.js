const { verifyAdmin } = require('./_auth');
const { createClient } = require('@supabase/supabase-js');


const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nlpjugpeexxgtmrcrkwx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event, context) => {
    const user = verifyAdmin(event);

if (!user) {
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Acesso negado' }),
  };
}

    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'text/plain'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: 'Method not allowed'
        };
    }

    try {
        const { raffleId } = JSON.parse(event.body);

        if (!raffleId) {
            return {
                statusCode: 400,
                headers,
                body: 'Raffle ID required'
            };
        }

        console.log('📥 Exportando vendas da rifa:', raffleId);

        // Buscar rifa
        const { data: raffle, error: raffleError } = await supabase
            .from('raffles')
            .select('*')
            .eq('id', raffleId)
            .single();

        if (raffleError || !raffle) {
            console.error('❌ Rifa não encontrada');
            return {
                statusCode: 404,
                headers,
                body: 'Raffle not found'
            };
        }

        const { data: sales, error: salesError } = await supabase
            .from('raffle_sales')
            .select('*')
            .eq('raffle_id', raffleId)
            .eq('payment_status', 'approved')
            .order('created_at', { ascending: true });

        if (salesError) {
            console.error('❌ Erro ao buscar vendas:', salesError);
            throw salesError;
        }

        if (!sales || sales.length === 0) {
            return {
                statusCode: 200,
                headers,
                body: 'Nenhuma venda aprovada encontrada.'
            };
        }

        const numberToName = {};
        
        sales.forEach(sale => {
            const firstName = sale.buyer_name.split(' ')[0];
            sale.numbers.forEach(num => {
                numberToName[num] = firstName;
            });
        });

        const sortedNumbers = Object.keys(numberToName)
            .map(n => parseInt(n))
            .sort((a, b) => a - b);

        let txtContent = `LISTA DE NÚMEROS - ${raffle.title}\n`;
        txtContent += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
        txtContent += `Total de Números Vendidos: ${sortedNumbers.length}\n`;
        txtContent += `\n${'='.repeat(80)}\n\n`;


        sortedNumbers.forEach(num => {
            txtContent += `${num} - ${numberToName[num]}\n`;
        });

        txtContent += `\n${'='.repeat(80)}\n\nRESUMO DE COMPRADORES:\n\n`;

        sales.forEach(sale => {
            const firstName = sale.buyer_name.split(' ')[0];
            txtContent += `${firstName}: ${sale.numbers.length} número(s) - ${sale.numbers.sort((a, b) => a - b).join(', ')}\n`;
        });

        txtContent += `\n${'='.repeat(80)}\n`;
        txtContent += `\nESTATÍSTICAS:\n`;
        txtContent += `Total de compradores: ${sales.length}\n`;
        txtContent += `Total arrecadado: R$ ${sales.reduce((sum, s) => sum + s.total_amount, 0).toFixed(2)}\n`;

        console.log('✅ Exportação gerada com sucesso');

        return {
            statusCode: 200,
            headers,
            body: txtContent
        };

    } catch (error) {
        console.error('❌ Erro na exportação:', error);
        return {
            statusCode: 500,
            headers,
            body: 'Erro ao gerar exportação'
        };
    }
};
