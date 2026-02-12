export function createPageUrl(page) {
  const map = {
    Home: "/",
    Raffles: "/raffles",
    RaffleDetail: "/raffledetail",
    MyRaffles: "/myraffles",
    Admin: "/admin",
    AdminRaffleDetail: "/adminraffledetail",
    Register: "/register",
    Login: "/login",
    AboutMe: "/aboutme",
  };

  return map[page] || "/";
}
