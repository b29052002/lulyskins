type PageKey =
  | "Home"
  | "Raffles"
  | "RaffleDetail"
  | "MyRaffles"
  | "Admin"
  | "AdminRaffleDetail"
  | "Register"
  | "Login"
  | "AboutMe"
  | "Payment";

export function createPageUrl(page: PageKey): string {
  const map: Record<PageKey, string> = {
    Home: "/",
    Raffles: "/raffles",
    RaffleDetail: "/raffledetail",
    MyRaffles: "/myraffles",
    Admin: "/admin",
    AdminRaffleDetail: "/adminraffledetail",
    Register: "/register",
    Login: "/login",
    AboutMe: "/aboutme",
    Payment: "/payment"
  };

  return map[page] || "/";
}
