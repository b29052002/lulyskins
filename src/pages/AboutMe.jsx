import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../components/utils';
import { ArrowLeft } from 'lucide-react';

export default function AboutMe() {
  return (
    <div className="min-h-screen bg-[#0a0e27]" style={{
      backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/f23eed07b_1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-[#0a0e27]/80"></div>
      
      {/* Header */}
      <header className="bg-[#0d1130] border-b border-blue-900/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center hover:opacity-80 transition">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png" 
                alt="Luly Skins" 
                className="w-12 h-12 object-contain"
              />
            </Link>
            
            <Link 
              to={createPageUrl('Home')} 
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png" 
                alt="Luly Skins" 
                className="w-32 h-32 object-contain"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white text-center mb-8">
              SOBRE MIM
            </h1>
            
            <div className="space-y-6 text-gray-200 text-lg leading-relaxed">
              <p>
                Me chamo Yuri. Jogo e acompanho bastante CS desde 2018, apesar de já ter tido jogatinas casuais de 1.6 lá por 2008.
              </p>
              
              <p>
                Em outubro de 2025, logo após o crash das skins com a atualização dos contratos para facas, descobri uma forma de comprar skins no Buff por conta (o maior site de compra e venda de skins), algo que não existia em nenhum lugar da internet.
              </p>
              
              <p>
                Resolvi postar no YouTube, despretensiosamente — e o vídeo bombou além do que eu jamais imaginei. A partir disso, as pessoas começaram a me pedir para comprar skins para elas a um preço justo, e de lá pra cá muita coisa aconteceu.
              </p>
              
              <p>
                Continuo postando vídeos interessantes no meu canal sobre CS e skins, e de vez em quando faço lives com sorteios.
              </p>
              
              <p>
                Falando em sorteios, sempre estou sorteando facas e kits. Todo mês, sorteio facas para quem deposita com meu código <span className="text-blue-400 font-bold">LULY</span> no <span className="text-red-500 font-bold">CSGONET</span>. Sou a única pessoa na internet que sorteia 100% do que ganha de comissão do site, sem sacar nada.
              </p>
              
              <p>
                Compro suas skins no Pix e faço upgrade nelas por um preço melhor do que qualquer site de troca. Também vendo skins da China a preço de custo.
              </p>
              
              <p className="text-white font-semibold text-xl">
                Se você precisar de skins — seja para negócio ou para aprender — estou disponível. Vai ser um prazer te ajudar! 🚀
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <Link
                to={createPageUrl('Home')}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-lg"
              >
                <span>Voltar para Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 bg-[#0d1130] py-8 relative">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2026 Luly Skins. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}