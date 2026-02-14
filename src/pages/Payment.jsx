import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { createPageUrl } from "../components/utils";

export default function Payment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const saleId = params.get("sale");

  const [paymentData, setPaymentData] = useState(null);
  const [approved, setApproved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  // 🔹 Carrega pagamento
  useEffect(() => {
    if (!saleId) return;
    loadPayment();
  }, [saleId]);

  async function loadPayment() {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create_pix_payment",
        { body: { sale_id: saleId } }
      );

      if (error) {
        setPaymentData({ error: error.message });
        return;
      }

      setPaymentData(data);
    } catch (e) {
      setPaymentData({ error: e.message });
    }
  }

  // 🔹 Contador expiração
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🔹 Verifica status pagamento
  useEffect(() => {
    if (!saleId) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("raffle_sales")
        .select("payment_status")
        .eq("id", saleId)
        .single();

      if (data?.payment_status === "paid" || data?.payment_status === "approved") {
        setApproved(true);
        clearInterval(interval);

        setTimeout(() => {
          navigate(createPageUrl("MyRaffles"));
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [saleId]);

  // ================= UI =================

  if (!saleId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Pagamento inválido
      </div>
    );
  }

  if (approved) {
    return (
      <div className="min-h-screen bg-slate-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Pagamento aprovado ✅
          </h1>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Gerando pagamento...
      </div>
    );
  }

  if (paymentData.error) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center">
        Erro: {paymentData.error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">
      <div className="bg-slate-900 p-8 rounded-xl w-[400px] text-center">
        <h1 className="text-xl font-bold mb-4">Pagamento PIX</h1>

        <img
          src={`data:image/png;base64,${paymentData.qr_code_base64}`}
          alt="QR Code"
          className="mx-auto mb-4"
        />

        <textarea
          readOnly
          value={paymentData.qr_code}
          className="w-full bg-slate-800 p-2 rounded mb-4 text-xs"
        />

        <p className="text-red-400">
          Expira em {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
