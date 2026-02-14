import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { createPageUrl } from '../components/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Award } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    price_per_number: '',
    total_numbers: ''
  });

  const { data: authData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;
      const isAuthenticated = !!user;
      const isAdmin = !!(user && (
        user.app_metadata?.role === 'admin' ||
        user.user_metadata?.role === 'admin'
      ));
      return { user, isAuthenticated, isAdmin };
    }
  });

  const { data: raffles = [] } = useQuery({
    queryKey: ['admin-raffles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!authData?.isAuthenticated
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingRaffle) {
        const { data, error } = await supabase
          .from('raffles')
          .update(payload)
          .eq('id', editingRaffle.id)
          .select('*')
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('raffles')
          .insert([{ ...payload, active: true }])
          .select('*')
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-raffles']);
      resetForm();
    }
  });

  const deleteRaffleMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-raffles']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      price_per_number: '',
      total_numbers: ''
    });
    setShowCreateForm(false);
    setEditingRaffle(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrUpdateMutation.mutate({
      title: formData.title,
      description: formData.description || null,
      image_url: formData.image_url || null,
      price_per_number: Number(formData.price_per_number),
      total_numbers: Number(formData.total_numbers)
    });
  };

  const handleEdit = (raffle) => {
    setEditingRaffle(raffle);
    setFormData({
      title: raffle.title,
      description: raffle.description || '',
      image_url: raffle.image_url || '',
      price_per_number: String(raffle.price_per_number ?? ''),
      total_numbers: String(raffle.total_numbers ?? '')
    });
    setShowCreateForm(true);
  };

  if (!authData?.isAuthenticated || !authData?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Acesso Negado</h2>
          <p className="text-purple-300 mb-4">Você precisa ser administrador para acessar esta página.</p>
          <Link to={createPageUrl('Home')} className="text-purple-400 hover:text-purple-300">
            ← Voltar para home
          </Link>
        </div>
      </div>
    );
  }

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

          <Link to={createPageUrl('Home')} className="text-purple-300 hover:text-white transition">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-purple-300">Gerencie as rifas do sistema</p>
          </div>

          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Rifa
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingRaffle ? 'Editar Rifa' : 'Criar Nova Rifa'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-purple-300">Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-purple-300">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-purple-300">URL da Imagem</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-300">Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_per_number}
                    onChange={(e) => setFormData({ ...formData, price_per_number: e.target.value })}
                    className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-purple-300">Total de Números</Label>
                  <Input
                    type="number"
                    value={formData.total_numbers}
                    onChange={(e) => setFormData({ ...formData, total_numbers: e.target.value })}
                    className="bg-slate-900/50 border-purple-500/30 text-white mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createOrUpdateMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {createOrUpdateMutation.isPending ? 'Salvando...' : editingRaffle ? 'Atualizar' : 'Criar Rifa'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Raffles List */}
        <div className="space-y-4">
          {raffles.map((raffle) => (
            <div
              key={raffle.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 flex items-center gap-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {raffle.image_url ? (
                  <img src={raffle.image_url} alt={raffle.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">🎯</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{raffle.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    raffle.active
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {raffle.active ? 'Ativa' : 'Finalizada'}
                  </span>
                </div>
                <p className="text-purple-300 text-sm mb-2">{raffle.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-300">Preço: <span className="text-white font-semibold">R$ {Number(raffle.price_per_number || 0).toFixed(2)}</span></span>
                  <span className="text-purple-300">Números: <span className="text-white font-semibold">{raffle.total_numbers}</span></span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(createPageUrl('AdminRaffleDetail') + `?id=${raffle.id}`)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Award className="w-4 h-4 mr-1" />
                  Gerenciar
                </Button>
                {raffle.active && (
                  <>
                    <Button
                      onClick={() => handleEdit(raffle)}
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-slate-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta rifa?')) {
                          deleteRaffleMutation.mutate(raffle.id);
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {raffles.length === 0 && !showCreateForm && (
            <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-purple-500/20">
              <p className="text-purple-300 text-lg">Nenhuma rifa criada ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
