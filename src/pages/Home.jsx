import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '../components/utils';
import { Home as HomeIcon, Ticket, MessageCircle, Youtube, Info, ChevronDown, Trophy, FileText } from 'lucide-react';

// ✅ NOVO: Supabase (mantém o layout 100% igual, só troca o backend)
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState('comprar');

  // ✅ Mantive a mesma estrutura do authData, só trocando Base44 -> Supabase
  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        return { user: data?.user ?? null, isAuthenticated: !!data?.user };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
  });

  // ✅ Mantive a mesma estrutura do raffles, só trocando Base44 -> Supabase
  // ✅ Ajuste 1: seu banco usa "active" (boolean), não "status"
  // ✅ Ajuste 2: seu banco usa "created_at"
  const { data: raffles = [] } = useQuery({
    queryKey: ['active-raffles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Erro ao buscar rifas:', error);
        return [];
      }

      return data ?? [];
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Header */}
      <header className="bg-[#0d1130] border-b border-blue-900/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center hover:opacity-80 transition">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png" 
                alt="Luly Skins" 
                className="w-12 h-12 object-contain"
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold">
              <Link to={createPageUrl('Home')} className="flex items-center space-x-2 text-white hover:text-blue-400 transition">
                <HomeIcon className="w-4 h-4" />
                <span>HOME</span>
              </Link>
              <Link to={createPageUrl('Raffles')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                <Ticket className="w-4 h-4" />
                <span>SORTEIOS</span>
              </Link>
              <a href="https://twitch.tv/lulyjoga" target="_blank" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                <MessageCircle className="w-4 h-4" />
                <span>TWITCH</span>
              </a>
              <a href="https://youtube.com/@lulyjoga" target="_blank" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                <Youtube className="w-4 h-4" />
                <span>YOUTUBE</span>
              </a>
              <a href="https://wa.me/5511945149326" target="_blank" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                <MessageCircle className="w-4 h-4" />
                <span>WHATSAPP</span>
              </a>
              <Link to={createPageUrl('AboutMe')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                <Info className="w-4 h-4" />
                <span>SOBRE MIM</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden" style={{
        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/36c4718d4_2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/80 to-[#0a0e27]/60"></div>
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'sans-serif' }}>
                LULY SKINS
              </h1>
              <p className="text-lg text-gray-300 mb-1 leading-relaxed">
                O hub definitivo para negociar skins,
              </p>
              <p className="text-lg mb-1 leading-relaxed">
                <span className="text-gray-300">participar de sorteios </span>
                <span className="text-blue-400 font-semibold italic">exclusivos</span>
                <span className="text-gray-300"> e</span>
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                fazer parte da comunidade.
              </p>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold flex items-center space-x-2">
                <span>Quero saber mais</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png" 
                alt="Luly Logo" 
                className="w-full max-w-lg object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cupom Banner */}
      <section className="py-6 px-4">
        <a
  href="https://csgo.net/utm/luly"
  target="_blank"
  rel="noopener noreferrer"
  className="block hover:text-blue-400 transition"
>
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-600/50 rounded-xl p-4 text-center">
            <p className="text-white font-semibold flex items-center justify-center flex-wrap gap-2">
              USE CUPOM <span className="text-blue-400 font-black">"LULY"</span> PARA 25% DE BÔNUS NO SEU DEPÓSITO NO{' '}
              <span className="flex items-center gap-2">
                <img src="https://csgo.net/public/img/logo.svg?v=8" alt="CSGO.NET" className="h-5 inline-block" />
                <span className="text-red-500 font-bold">CSGO.NET</span>
              </span>
            </p>
          </div>
        </div>
        </a>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Como Funciona?
          </h2>
          
          <div className="flex justify-center mb-8 border-b border-blue-900/30">
            <button
              onClick={() => setActiveTab('comprar')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'comprar'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              COMPRAR SKINS
            </button>
            <button
              onClick={() => setActiveTab('vender')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'vender'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              VENDER SKINS
            </button>
            <button
              onClick={() => setActiveTab('trocar')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'trocar'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              TROCAR SKINS
            </button>
            <button
              onClick={() => setActiveTab('ganhar')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'ganhar'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              GANHAR SKINS
            </button>
          </div>

          {activeTab === 'comprar' && (
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/8652fa582_Group1.png" 
                  alt="CS:GO Inventory" 
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-600/30 rounded-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6">
                  Skins à pronta-entrega e sob encomenda!
                </h3>
                <p className="text-gray-300 mb-4">
                  Vendo o meu inventário pelo{' '}
                  <span className="text-blue-400 font-semibold">menor preço disponível do mercado!</span>
                </p>
                <p className="text-gray-300 mb-4">
                  Não achou o que queria? Eu busco pra você nos principais mercados mundiais e coloco na sua conta em{' '}
                  <span className="text-blue-400 font-semibold">tempo recorde!</span>
                </p>
                <p className="text-gray-300 mb-8">
                  Preço de custo real.{' '}
                  <span className="text-white font-semibold">O que você precisar, eu encontro.</span>
                </p>
                <a 
                  href="https://wa.me" 
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>QUERO COMPRAR SKINS</span>
                </a>
                <p className="text-xs text-gray-400 mt-3">
                  Te atendo por whatsapp para melhor entendimento e clareza!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vender' && (
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/8652fa582_Group1.png" 
                  alt="CS:GO Inventory" 
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-600/30 rounded-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6">
                  Venda suas skins com segurança!
                </h3>
                <p className="text-gray-300 mb-4">
                  Compro suas skins à vista com{' '}
                  <span className="text-blue-400 font-semibold">total segurança e garantia</span>.
                  Skins avulsas e inventários completos.
                </p>
                <p className="text-gray-300 mb-8">
                  Com facilidade e propostas de valores que sejam justos e tragam segurança, praticidade e facilidade.{' '}
                  <span className="text-white font-semibold">Você vai só aceitar a proposta e ficar tranquilo sabendo que vai receber o dinheiro no PIX.</span>
                </p>
                <a 
                  href="https://wa.me/5511945149326" 
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>QUERO VENDER SKINS</span>
                </a>
                <p className="text-xs text-gray-400 mt-3">
                  Te atendo por whatsapp para melhor entendimento e clareza!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'trocar' && (
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/8652fa582_Group1.png" 
                  alt="CS:GO Inventory" 
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-600/30 rounded-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6">
                  Troque suas skins com facilidade!
                </h3>
                <p className="text-gray-300 mb-4">
                  A mesma praticidade de sempre, a gente cota quanto ficaria a diferença{' '}
                  <span className="text-blue-400 font-semibold">sem nenhum compromisso</span>{' '}
                  e te garanto que quase sempre o valor comigo vai ser melhor que qualquer site de troca da internet.
                </p>
                <p className="text-gray-300 mb-8">
                  <span className="text-white font-semibold">Você entrega suas skins, paga a diferença e sai com a skin dos seus sonhos, tudo na mesma hora.</span>
                </p>
                <a 
                  href="https://wa.me/5511945149326" 
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>QUERO TROCAR</span>
                </a>
                <p className="text-xs text-gray-400 mt-3">
                  Te atendo por whatsapp para melhor entendimento e clareza!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ganhar' && (
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/8652fa582_Group1.png" 
                  alt="CS:GO Inventory" 
                  className="relative rounded-xl shadow-2xl"
                />
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-600/30 rounded-xl p-8">
                <h3 className="text-3xl font-bold text-white mb-6">
                  Ganhe skins incríveis!
                </h3>
                <div className="space-y-3 mb-8">
                  <p className="text-gray-300">
                    <span className="text-blue-400 font-bold">1 -</span> Temos rifas todas as semanas com o melhor preço de toda a internet.
                  </p>
                  <p className="text-gray-300">
                    <span className="text-blue-400 font-bold">2 -</span> Quem deposita com o código LULY no CSGONET concorre a facas e skins todo mês, basta depositar e preencher o formulário do mês.
                  </p>
                  <p className="text-gray-300">
                    <span className="text-blue-400 font-bold">3 -</span> Temos sorteios no grupo do Whats e nos vídeos do YT, entre no grupo para ficar sabendo de todos.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to={createPageUrl('Raffles')}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>RIFAS</span>
                  </Link>
                  <a 
                    href="https://wa.me/5511945149326" 
                    target="_blank"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    <FileText className="w-5 h-5" />
                    <span>FORMULÁRIO CSGONET</span>
                  </a>
                  <a 
                    href="https://wa.me/5511945149326" 
                    target="_blank"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>SORTEIOS EXCLUSIVOS</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sorteios Ativos */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-12">
            <h2 className="text-4xl font-bold text-white">SORTEIOS ATIVOS!</h2>
            <Ticket className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          {raffles.length === 0 ? (
            <div className="text-center py-12 bg-blue-900/20 rounded-xl border border-blue-600/30">
              <p className="text-gray-300 text-lg">Nenhum sorteio ativo no momento. Fique de olho!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {raffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 border border-blue-600/30 rounded-xl overflow-hidden hover:border-blue-500 transition group"
                >
                  <div className="relative">
                    <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded text-xs font-bold text-white">
                      RIFA
                    </div>
                    <div className="h-64 overflow-hidden">
                      {/* ✅ Ajuste de campo: prize_image -> image_url (SEM mexer no layout) */}
                      {raffle.image_url ? (
                        <img 
                          src={raffle.image_url} 
                          alt={raffle.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                          <span className="text-6xl">🎯</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                      <div className="text-3xl font-black text-white mb-1">
                        {/* ✅ Ajuste de campo: price -> price_per_number (SEM mexer no layout) */}
                        R$ {Number(raffle.price_per_number ?? 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-300">
                        Concorra por apenas 1,95 R$
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-black/60">
                    <h4 className="text-lg font-bold text-white mb-2">
                      {raffle.title}
                    </h4>
                    {raffle.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {raffle.description}
                      </p>
                    )}
                    <Link
                      to={createPageUrl('RaffleDetail') + `?id=${raffle.id}`}
                      className="block text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                    >
                      PARTICIPAR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8 max-w-4xl mx-auto">
            Este é um sistema de entretenimento baseado em sorte. Ao participar, você declara estar ciente de que a compra de cotas não configura investimento e que o valor pago não é reembolsável após a realização do sorteio, independente de decisões decorrentes ou não relacionadas ao evento, vogue por responsabilidade dos participantes menores de 18 anos.
          </p>
        </div>
      </section>

      {/* Feedback dos Clientes */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            FEEDBACK DOS CLIENTES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 border border-blue-600/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">@matheus_felippp</p>
                  <a href="https://instagram.com/luly.skins" target="_blank" className="text-blue-400 text-xs hover:underline">
                    Instagram
                  </a>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Rápido e confiável, recomendo demais!! 🔥
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 border border-blue-600/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">@eliasleysureforee</p>
                  <a href="https://instagram.com/luly.skins" target="_blank" className="text-blue-400 text-xs hover:underline">
                    Instagram
                  </a>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                melhor preço e excelente atendimento 🔥
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 border border-blue-600/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">@marcelopi_</p>
                  <a href="https://instagram.com/luly.skins" target="_blank" className="text-blue-400 text-xs hover:underline">
                    Instagram
                  </a>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Fez no precinho pra mim, podei ir a cara desenhara mt ❤️
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-b from-blue-900/40 to-blue-950/40 border border-blue-600/30 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">@_pablo_</p>
                  <a href="https://instagram.com/luly.skins" target="_blank" className="text-blue-400 text-xs hover:underline">
                    Instagram
                  </a>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Confiável d+ 🔥🔥🔥
              </p>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-20 px-4 bg-cover bg-center relative" style={{
        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/41f4c89c4_image.png)',
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/70 to-[#0a0e27]/80"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Quer Aprender <span className="text-blue-400">Mais?</span>
            </h2>
            <p className="text-gray-300">
              Confira nosso conteúdo exclusivo no YouTube
            </p>
            
            <div className="flex justify-center space-x-6 mt-6">
              <a href="https://twitch.tv" target="_blank" className="text-blue-400 hover:text-blue-300 transition">
                <MessageCircle className="w-6 h-6" />
              </a>
              <a href="https://instagram.com" target="_blank" className="text-blue-400 hover:text-blue-300 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" className="text-blue-400 hover:text-blue-300 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-blue-600/50" style={{ paddingBottom: '56.25%' }}>
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/IgmNHxzazZA?si=SoqeaqYmzah2fyf_" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </div>

            <div className="text-center mt-8">
              <a 
                href="https://www.youtube.com/@lulyjoga" 
                target="_blank"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                <Youtube className="w-5 h-5" />
                <span>INSCREVER-SE NO CANAL</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 bg-[#0d1130] py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2026 Luly Skins. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
