import React from "react";
import "./App.css";
import "./index.css";
import ConnectBtn from "./components/ConnectBtn";
import Logo from "./components/Logo";
import { connectWallet } from "./utils/etherConfig";
import useWalletStore from "./store/useWalletStore";

function App() {
  const { address, setAddress, setError, error } = useWalletStore(); // вызов Zustand хука внутри компонента

  const handleConnectWallet = async () => {
    console.log(123);
    const account = await connectWallet();
    if (account) {
      setAddress(account);
    } else {
      setError("Ошибка подключения!");
    }
  };

  return (
    <div className="app-background">
      <header className="w-full h-[96px] flex justify-between items-center p-4 rounded-tl-[20px] z-10">
        <Logo />
        <ConnectBtn connectWallet={handleConnectWallet} address={address} />
      </header>
      <section className="w-[500px] h-[388px] bg-amber-100 rounded-custom-40 border-4 border-black-500">
        <div className="w-[57px] h-[26px] px-24 py-32">
          <h1 className="font-firs text-[26px] leading-[26.5px] font-bold">
            From
          </h1>
        </div>
      </section>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default App;
