import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trophy } from 'lucide-react';

export default function AdminRaffleDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const raffleId = urlParams.get('id');

  const [winnerNumber, setWinnerNumber] = useState('');

  const { data: raffle } = useQuery({
    queryKey: ['admin-raffle', raffleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!raffleId
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['admin-raffle-sales', raffleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffle_sales')
        .select('*')
        .eq('raffle_id', raffleId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!raffleId
  });

  const finalizeRaffleMutation = useMutation({
    mutationFn: async ({ winnerNumber }) => {
      const { data, error } = await supabase
        .from('raffles')
        .update({
          active: false,
          winner_number: Number(winnerNumber),
          finished_at: new Date().toISOString()
        })
        .eq('id', raffleId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-raffle', raffleId]);
      queryClient.invalidateQueries(['raffles']);
      alert('Rifa finalizada com sucesso!');
    }
  });

  const handleFinalize = (e) => {
    e.preventDefault();
    if (confirm(`Confirmar número vencedor: ${winnerNumber}?`)) {
      finalizeRaffleMutation.mutate({ winnerNumber });
    }
  };

  const exportSales = () => {
    const approvedSales = sales.filter(s => s.payment_status === 'paid' || s.payment_status === 'approved');

    let txtContent = `LISTA DE NÚMEROS - ${raffle?.title}\n`;
    txtContent += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n\n`;
    txtContent += `${'='.repeat(80)}\n\n`;

    const numberToName = {};
    approvedSales.forEach(sale => {
      const firstName = (sale.buyer_name || '').split(' ')[0] || 'Comprador';
      (sale.numbers || []).forEach(num => {
        numberToName[num] = firstName;
      });
    });

    const sortedNumbers = Object.keys(numberToName)
      .map(n => parseInt(n, 10))
      .sort((a, b) => a - b);

    sortedNumbers.forEach(num => {
      txtContent += `${num} - ${numberToName[num]}\n`;
    });

    const totalArrecadado = approvedSales.reduce((sum, s) => sum + Number(s.payment_amount || 0), 0);

    txtContent += `\n${'='.repeat(80)}\n\nRESUMO:\n\n`;
    txtContent += `Total de compradores: ${approvedSales.length}\n`;
    txtContent += `Total de números vendidos: ${sortedNumbers.length}\n`;
    txtContent += `Total arrecadado: R$ ${totalArrecadado.toFixed(2)}\n`;

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rifa-${raffleId}-vendas.txt`;
    a.click();
  };

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const approvedSales = sales.filter(s => s.payment_status === 'paid' || s.payment_status === 'approved');
  const pendingSales = sales.filter(s => s.payment_status === 'pending' || s.payment_status === 'reserved');

  const totalNumsVendidos = approvedSales.reduce((sum, s) => sum + (Array.isArray(s.numbers) ? s.numbers.length : 0), 0);
  const totalArrecadado = approvedSales.reduce((sum, s) => sum + Number(s.payment_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={createPageUrl('Home')} className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white">
              LS
            </div>
            <h1 className="text-2xl font-bold text-white">Luly Skins - Admin</h1>
          </Link>

          <Link to={createPageUrl('Admin')} className="text-purple-300 hover:text-white transition">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-white mb-4">{raffle.title}</h1>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Status:</span>
                  <span className={`font-semibold ${raffle.active ? 'text-green-300' : 'text-slate-300'}`}>
                    {raffle.active ? 'Ativa' : 'Finalizada'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Preço:</span>
                  <span className="text-white font-semibold">R$ {Number(raffle.price_per_number || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Números vendidos:</span>
                  <span className="text-white font-semibold">{totalNumsVendidos} / {raffle.total_numbers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Total arrecadado:</span>
                  <span className="text-white font-semibold">
                    R$ {totalArrecadado.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={exportSales}
                className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Vendas
              </Button>

              {raffle.active && (
                <div className="border-t border-purple-500/30 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Finalizar Rifa
                  </h3>

                  <form onSubmit={handleFinalize} className="space-y-4">
                    <div>
                      <Label className="text-purple-300">Número Sorteado</Label>
                      <Input
                        type="number"
                        value={winnerNumber}
                        onChange={(e) => setWinnerNumber(e.target.value)}
                        className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={finalizeRaffleMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {finalizeRaffleMutation.isPending ? 'Finalizando...' : 'Finalizar Rifa'}
                    </Button>
                  </form>
                </div>
              )}

              {!raffle.active && raffle.winner_number != null && (
                <div className="border-t border-purple-500/30 pt-6">
                  <Alert className="bg-green-500/20 border-green-500">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <AlertDescription className="text-white ml-2">
                      <p className="font-semibold">Número vencedor</p>
                      <p className="text-sm text-green-300">Número: {raffle.winner_number}</p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Entries */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Participantes ({approvedSales.length})</h2>

              <div className="space-y-3">
                {approvedSales.length === 0 ? (
                  <p className="text-purple-300 text-center py-8">Nenhuma venda aprovada ainda</p>
                ) : (
                  approvedSales.map((sale) => (
                    <div key={sale.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold">{sale.buyer_name}</p>
                          <p className="text-purple-300 text-sm">{sale.buyer_phone}</p>
                        </div>
                        <span className="text-white font-semibold">R$ {Number(sale.payment_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(sale.numbers || []).slice().sort((a, b) => a - b).map(num => (
                          <span key={num} className="px-2 py-1 bg-purple-600 text-white rounded text-sm">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {pendingSales.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Pagamentos Pendentes ({pendingSales.length})</h2>

                <div className="space-y-3">
                  {pendingSales.map((sale) => (
                    <div key={sale.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold">{sale.buyer_name}</p>
                          <p className="text-purple-300 text-sm">{sale.buyer_phone}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                          Pendente
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(sale.numbers || []).slice().sort((a, b) => a - b).map(num => (
                          <span key={num} className="px-2 py-1 bg-slate-600 text-white rounded text-sm">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
