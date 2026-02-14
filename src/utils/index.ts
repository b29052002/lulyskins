type PageKey =
  | "Home"
  | "Raffles"
  | "RaffleDetail"
  | "MyRaffles"
  | "Admin"
  | "AdminRaffleDetail"
  | "Register"
  | "Login"
  | "Payment";

export function createPageUrl(page: PageKey): string {
  const map: Record<PageKey, string> = {
    Home: "/",
    Raffles: "/Raffles",
    RaffleDetail: "/RaffleDetail",
    MyRaffles: "/MyRaffles",
    Admin: "/Admin",
    AdminRaffleDetail: "/AdminRaffleDetail",
    Register: "/Register",
    Login: "/Login",
    Payment: "/Payment"
  };

  return map[page];
}
