import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { createPageUrl } from '../components/utils';
import { ArrowLeft, Ticket, Trophy, CheckCircle2 } from 'lucide-react';

export default function MyRaffles() {
  const [activeTab, setActiveTab] = useState('active');

  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return { user: data?.user || null, isAuthenticated: !!data?.user };
    }
  });

  const { data: userRow } = useQuery({
    queryKey: ['users-row', authData?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authData?.user?.id
  });

  const { data: mySales = [], isLoading } = useQuery({
    queryKey: ['my-sales', userRow?.whatsapp],
    queryFn: async () => {
      if (!userRow?.whatsapp) return [];
      const { data, error } = await supabase
        .from('raffle_sales')
        .select('*')
        .eq('buyer_phone', userRow.whatsapp)
        .in('payment_status', ['paid', 'approved'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRow?.whatsapp
  });

  const { data: allRaffles = [] } = useQuery({
    queryKey: ['all-raffles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (!authData?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Você precisa estar logado</h2>
          <Link to={createPageUrl('Login')} className="text-blue-400 hover:text-blue-300">
            Fazer login →
          </Link>
        </div>
      </div>
    );
  }

  const raffleMap = {};
  allRaffles.forEach(raffle => {
    raffleMap[raffle.id] = raffle;
  });

  const activeEntries = mySales.filter(sale =>
    raffleMap[sale.raffle_id]?.active === true
  );

  const completedEntries = mySales.filter(sale =>
    raffleMap[sale.raffle_id]?.active === false
  );

  const displayEntries = activeTab === 'active' ? activeEntries : completedEntries;

  return (
    <div className="min-h-screen bg-[#0a0e27]" style={{
      backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/f23eed07b_1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-[#0a0e27]/85"></div>

      <header className="bg-[#0d1130] border-b border-blue-900/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={createPageUrl('Home')} className="flex items-center hover:opacity-80 transition">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png"
              alt="Luly Skins"
              className="w-12 h-12 object-contain"
            />
          </Link>

          <Link
            to={createPageUrl('Home')}
            className="flex items-center space-x-2 text-blue-300 hover:text-white transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Minhas Rifas</h1>
          <p className="text-gray-300">Acompanhe suas participações e resultados</p>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-blue-900/30">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'active'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Rifas Ativas
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'completed'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Histórico
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-300 mt-4">Carregando...</p>
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-md border border-blue-600/30 rounded-xl">
            <Ticket className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Nenhuma participação encontrada
            </h3>
            <p className="text-gray-300 mb-6">
              {activeTab === 'active'
                ? 'Você ainda não participou de nenhuma rifa ativa'
                : 'Você não tem histórico de rifas finalizadas'}
            </p>
            <Link
              to={createPageUrl('Raffles')}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              Ver Rifas Disponíveis
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayEntries.map((sale) => {
              const raffle = raffleMap[sale.raffle_id];
              if (!raffle) return null;

              const saleNumbers = Array.isArray(sale.numbers) ? sale.numbers : [];
              const isWinner = raffle.active === false && raffle.winner_number != null
                ? saleNumbers.includes(raffle.winner_number)
                : false;

              return (
                <div
                  key={sale.id}
                  className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl overflow-hidden"
                >
                  <div className="grid md:grid-cols-3 gap-6 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-blue-600/20">
                        {raffle.image_url ? (
                          <img src={raffle.image_url} alt={raffle.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🎯</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{raffle.title}</h3>
                        <p className="text-gray-400 text-sm">
                          {raffle.active ? 'Rifa Ativa' : 'Finalizada'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-2">Seus números</p>
                      <div className="flex flex-wrap gap-2">
                        {saleNumbers.slice(0, 10).map(num => (
                          <span
                            key={num}
                            className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                              raffle.winner_number === num
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600/30 text-blue-300'
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                        {saleNumbers.length > 10 && (
                          <span className="px-3 py-1 rounded-lg bg-blue-600/30 text-blue-300 text-sm">
                            +{saleNumbers.length - 10}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">
                        Total: R$ {Number(sale.payment_amount || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      {!raffle.active ? (
                        isWinner ? (
                          <div className="bg-green-600/20 border-2 border-green-500 rounded-xl p-4 text-center">
                            <Trophy className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="text-green-300 font-bold text-lg">VOCÊ GANHOU!</p>
                            <p className="text-green-400 text-sm">Número sorteado: {raffle.winner_number}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400 font-semibold">Não foi dessa vez</p>
                            <p className="text-gray-500 text-xs">Número: {raffle.winner_number}</p>
                          </div>
                        )
                      ) : (
                        <Link
                          to={createPageUrl('RaffleDetail') + `?id=${raffle.id}`}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                        >
                          Ver Detalhes
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-blue-900/30 bg-[#0d1130] py-8 mt-20 relative">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2026 Luly Skins. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
