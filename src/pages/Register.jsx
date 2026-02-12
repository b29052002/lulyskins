import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPageUrl } from '../components/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      // ✅ Criar usuário no Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (!data.user) throw new Error("Erro ao criar usuário");
const user = data.user;

      // ✅ Salvar dados extras na tabela users
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          username,
          whatsapp,
          name,
        });

      if (userError) throw userError;

      navigate(createPageUrl('Home'));

    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen bg-[#0a0e27]" style={{
    backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/f23eed07b_1.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
    <div className="absolute inset-0 bg-[#0a0e27]/85"></div>

    <header className="bg-[#0d1130] border-b border-blue-900/30 relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-center">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png" 
          alt="Luly Skins"
          className="w-12 h-12"
        />
      </div>
    </header>

    <div className="relative flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">

      <div className="w-full max-w-md bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl p-8">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Criar Conta
        </h1>


          {error && (
            <Alert className="mb-4 bg-red-500/20 border-red-500">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            <div>
              <Label className="text-purple-300">Nome Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-purple-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-purple-300">Nome de Usuário</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-purple-300">WhatsApp</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-purple-300">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {loading ? 'Criando conta...' : 'Cadastrar'}
            </Button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-300">
              Já tem uma conta?{" "}
              <Link
                to={createPageUrl('Login')}
                className="text-purple-400 font-semibold"
              >
                Entrar
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to={createPageUrl('Home')}
              className="text-purple-400 text-sm"
            >
              ← Voltar para home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
