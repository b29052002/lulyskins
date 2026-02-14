import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { createPageUrl } from '../components/utils';
import { Ticket, Clock } from 'lucide-react';

export default function Raffles() {
  const [activeTab, setActiveTab] = useState('active');

  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return { user: data?.user || null, isAuthenticated: !!data?.user };
    }
  });

  const { data: raffles = [], isLoading } = useQuery({
    queryKey: ['raffles', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('raffles')
        .select('*');

      if (activeTab === 'active') {
        query = query.eq('active', true).order('created_at', { ascending: false });
      } else {
        query = query.eq('active', false).order('finished_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0e27]" style={{
      backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/f23eed07b_1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-[#0a0e27]/85"></div>

      {/* Header */}
      <header className="bg-[#0d1130] border-b border-blue-900/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={createPageUrl('Home')} className="flex items-center hover:opacity-80 transition">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png"
              alt="Luly Skins"
              className="w-12 h-12 object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            {authData?.isAuthenticated ? (
              <>
                <Link
                  to={createPageUrl('MyRaffles')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-semibold"
                >
                  Minhas Rifas
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-semibold"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to={createPageUrl('Login')}
                  className="px-4 py-2 bg-transparent border border-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  to={createPageUrl('Register')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-semibold"
                >
                  Cadastrar
                </Link>
              </>
            )}
            <Link
              to={createPageUrl('Home')}
              className="text-blue-300 hover:text-white transition font-semibold ml-2"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Rifas Disponíveis</h1>
          <p className="text-purple-300">Escolha sua rifa e boa sorte!</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'active'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Ativas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Raffles Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-purple-300 mt-4">Carregando...</p>
          </div>
        ) : raffles.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-purple-500/20">
            <div className="text-6xl mb-4">
              {activeTab === 'active'
                ? <Ticket className="w-16 h-16 mx-auto text-purple-400" />
                : <Clock className="w-16 h-16 mx-auto text-purple-400" />
              }
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeTab === 'active' ? 'Nenhuma rifa ativa no momento' : 'Nenhuma rifa finalizada'}
            </h3>
            <p className="text-purple-300">
              {activeTab === 'active'
                ? 'Fique de olho! Em breve teremos novas rifas.'
                : 'O histórico de rifas aparecerá aqui.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <Link
                key={raffle.id}
                to={createPageUrl('RaffleDetail') + `?id=${raffle.id}`}
                className="bg-gradient-to-b from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl overflow-hidden hover:border-blue-500 transition cursor-pointer transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center overflow-hidden relative">
                  {raffle.image_url ? (
                    <img src={raffle.image_url} alt={raffle.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-6xl">🎯</span>
                  )}
                  {!raffle.active && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Finalizada
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {raffle.title}
                  </h4>

                  {raffle.description && (
                    <p className="text-purple-300 mb-4 line-clamp-2 text-sm">
                      {raffle.description}
                    </p>
                  )}

                  {!raffle.active && raffle.winner_number ? (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                      <p className="text-green-300 text-sm font-semibold">Número vencedor</p>
                      <p className="text-white text-lg">{raffle.winner_number}</p>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">
 Fletcher R$ {Number(raffle.price_per_number || 0).toFixed(2)}
                    </span>
                    {raffle.active && (
                      <span className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm">
                        Participar
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
