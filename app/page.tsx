import { Navbar } from "./components/Navbar";
import { WalletPage } from "./components/Walletpage";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]">
      <Navbar />
      <WalletPage />
    </div>
  );
}
