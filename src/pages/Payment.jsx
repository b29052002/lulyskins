import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Payment() {
  const [params] = useSearchParams();
  const saleId = params.get("sale");

  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (!saleId) return;
    loadPayment();
  }, [saleId]);

  async function loadPayment() {
  console.log("Chamando função com saleId:", saleId);

  const response = await fetch(
    "https://SEU_PROJECT_ID.supabase.co/functions/v1/create_pix_payment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ sale_id: saleId })
    }
  );

  const data = await response.json();

  console.log("Resposta direta fetch:", data);

  setPaymentData(data);
}


  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!saleId) {
    return <div className="text-white text-center mt-20">Pagamento inválido</div>;
  }

  if (!paymentData) {
    return <div className="text-white text-center mt-20">Gerando pagamento...</div>;
  }

  if (paymentData.error) {
    return (
      <div className="text-red-400 text-center mt-20">
        Erro: {paymentData.error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center text-white">
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
