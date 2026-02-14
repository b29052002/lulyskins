import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClientInstance } from "@/lib/query-client";

import PageNotFound from "./lib/PageNotFound";

import Home from "./pages/Home";
import Raffles from "./pages/Raffles";
import RaffleDetail from "./pages/RaffleDetail";
import MyRaffles from "./pages/MyRaffles";
import Admin from "./pages/Admin";
import AdminRaffleDetail from "./pages/AdminRaffleDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AboutMe from "./pages/AboutMe";
import Payment from "./pages/Payment"; // ✅ IMPORTANTE

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/raffles" element={<Raffles />} />
          <Route path="/raffledetail" element={<RaffleDetail />} />
          <Route path="/myraffles" element={<MyRaffles />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/adminraffledetail" element={<AdminRaffleDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/aboutme" element={<AboutMe />} />

          {/* ✅ ESTA É A FALTA */}
          <Route path="/Payment" element={<Payment />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>

      <Toaster />
    </QueryClientProvider>
  );
}
