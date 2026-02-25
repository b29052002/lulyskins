import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Trophy } from "lucide-react";

export default function RaffleDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const raffleId = urlParams.get("id");

  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [error, setError] = useState("");

  // Auth
  const { data: authData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return { user: data?.user || null, isAuthenticated: !!data?.user };
    },
  });

  // Users row (tabela users, não profiles)
  const { data: userRow } = useQuery({
    queryKey: ["users-row", authData?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authData?.user?.id,
  });



  // Raffle
  const { data: raffle, isLoading } = useQuery({
    queryKey: ["raffle", raffleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raffles")
.select(`
  *,
  winner_user:users(name)
`)
.eq("id", raffleId)
.single();

      if (error) throw error;
      return data;
    },
    enabled: !!raffleId,
  });


  
  // Approved sales (para números vendidos)
  const { data: approvedSales = [] } = useQuery({
    queryKey: ["raffle-approved-sales", raffleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raffle_sales")
        .select("id, numbers")
        .eq("raffle_id", raffleId)
        .in("payment_status", ["waiting_payment", "paid", "approved"]);

      if (error) throw error;
      return data || [];
    },
    enabled: !!raffleId,
  });

  const soldNumbers = useMemo(() => {
    const set = new Set();
    approvedSales.forEach((sale) => {
      const nums = Array.isArray(sale.numbers) ? sale.numbers : [];
      nums.forEach((n) => set.add(n));
    });
    return set;
  }, [approvedSales]);

  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      const { data, error } = await supabase.from("raffle_sales").insert(saleData).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["raffle-approved-sales", raffleId]);
    },
  });

  const toggleNumber = (num) => {
    if (soldNumbers.has(num)) return;

    setSelectedNumbers((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      return [...prev, num];
    });
  };

  const handlePurchase = async () => {
    setError("");

    if (!authData?.isAuthenticated) {
      navigate(createPageUrl("Login"));
      return;
    }

    if (!userRow?.whatsapp) {
      setError("Seu cadastro não está completo (WhatsApp). Vá em cadastro e complete seus dados.");
      return;
    }

    if (!raffle?.active) {
      setError("Esta rifa já foi finalizada.");
      return;
    }

    if (selectedNumbers.length === 0) {
      setError("Selecione pelo menos um número");
      return;
    }

    // segurança: não permitir escolher números vendidos (caso alguém comprou enquanto você selecionava)
    for (const n of selectedNumbers) {
      if (soldNumbers.has(n)) {
        setError("Alguns números selecionados já foram vendidos. Selecione novamente.");
        return;
      }
    }

    const totalAmount = selectedNumbers.length * (raffle.price_per_number || 0);

    try {
   const sale = await createSaleMutation.mutateAsync({
  raffle_id: raffleId,
  user_id: authData.user.id,
  buyer_phone: userRow.whatsapp,
  buyer_name: userRow.name || userRow.username || authData.user.email,
  buyer_email: authData.user.email,
  numbers: selectedNumbers,
  payment_amount: totalAmount,
  payment_status: "pending",
});

if (!sale?.id) {
  console.error("Sale inválida:", sale);
  setError("Erro ao gerar pagamento.");
  return;
}

navigate(`${createPageUrl("Payment")}?sale=${sale.id}`);
    } catch (err) {
      setError(err.message || "Erro ao processar compra");
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Not found
  if (!raffle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Rifa não encontrada</h2>
          <Link to="/raffles" className="text-purple-400 hover:text-purple-300">
            ← Voltar para rifas
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = selectedNumbers.length * (raffle.price_per_number || 0);
  const isCompleted = raffle.active === false;

  return (
    <div
      className="min-h-screen bg-[#0a0e27]"
      style={{
        backgroundImage:
          "url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/f23eed07b_1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[#0a0e27]/85"></div>

      {/* Header */}
      <header className="bg-[#0d1130] border-b border-blue-900/30 sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={createPageUrl("Home")} className="flex items-center hover:opacity-80 transition">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698b84049babe55f1018ad78/0dd8a8c66_logo-transparente.png"
              alt="Luly Skins"
              className="w-12 h-12 object-contain"
            />
          </Link>

          <Link to="/raffles" className="text-blue-300 hover:text-white transition font-semibold">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Raffle Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl p-6 sticky top-24">
              <div className="h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
                {raffle.image_url ? (
                  <img src={raffle.image_url} alt={raffle.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl">🎯</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{raffle.title}</h1>
              {raffle.description && <p className="text-purple-300 mb-6">{raffle.description}</p>}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Preço por número:</span>
                  <span className="text-white font-semibold">R$ {(raffle.price_per_number || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Total de números:</span>
                  <span className="text-white font-semibold">{raffle.total_numbers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Vendidos:</span>
                  <span className="text-white font-semibold">{soldNumbers.size}</span>
                </div>
              </div>

              {/* Se rifa finalizada, não exibe compra */}
              {!isCompleted && selectedNumbers.length > 0 && (
                <>
                  <div className="border-t border-purple-500/30 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-purple-300">Números selecionados:</span>
                      <span className="text-white font-semibold">{selectedNumbers.length}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-white">R$ {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <Alert className="mb-4 bg-red-500/20 border-red-500">
                      <AlertDescription className="text-red-300">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={createSaleMutation.isPending}
                  >
                    {createSaleMutation.isPending ? "Processando..." : "Finalizar Compra"}
                  </Button>
                </>
              )}

              {/* erro mesmo sem seleção */}
              {error && selectedNumbers.length === 0 && (
                <Alert className="mt-4 bg-red-500/20 border-red-500">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {isCompleted ? (
              <div className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Rifa Finalizada</h2>

                <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-7 h-7 text-yellow-400" />
                    <p className="text-white font-semibold text-lg">Resultado</p>
                  </div>

                  {raffle.winner_number != null ? (
                    <>
                      <p className="text-green-300 text-sm font-semibold">Vencedor</p>
                      <p className="text-white text-xl mb-2">
  {raffle.winner_user?.name || "Não informado"}
</p>

<p className="text-green-300 text-sm">
  Número sorteado: <span className="text-white font-semibold">{raffle.winner_number}</span>
</p>
                    </>
                  ) : (
                    <p className="text-gray-200">
                      Esta rifa foi marcada como finalizada, mas o resultado ainda não foi informado pelo admin.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Link to="/raffles"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                  >
                    Voltar para Rifas
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-900/60 to-blue-950/60 backdrop-blur-md border border-blue-600/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Escolha seus números</h2>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {Array.from({ length: raffle.total_numbers }, (_, i) => i + 1).map((num) => {
                    const isSold = soldNumbers.has(num);
                    const isSelected = selectedNumbers.includes(num);

                    return (
                      <button
                        key={num}
                        onClick={() => toggleNumber(num)}
                        disabled={isSold}
                        className={`
                          aspect-square rounded-lg font-semibold text-sm transition
                          ${
                            isSold
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : isSelected
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                              : "bg-slate-700/50 text-white hover:bg-slate-600 hover:scale-105"
                          }
                        `}
                      >
                        {isSold ? <CheckCircle2 className="w-4 h-4 mx-auto" /> : num}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700/50 rounded"></div>
                    <span className="text-purple-300">Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded"></div>
                    <span className="text-purple-300">Selecionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-purple-300">Vendido</span>
                  </div>
                </div>

                {/* botão aparece mesmo sem seleção? você prefere só quando seleciona (como já estava) */}
                {selectedNumbers.length === 0 && (
                  <div className="mt-6">
                    <Button
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled
                    >
                      Selecione números para comprar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
