import React, { useEffect } from "react";
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

  useEffect(() => {
    console.log("Текущее состояние стора:", { address, error });
  }, [error, address]);

  return (
    <div className="app-background">
      <header className="w-full h-[96px] flex justify-between items-center p-4 rounded-tl-[20px] z-10">
        <Logo />
        <ConnectBtn connectWallet={handleConnectWallet} address={address} />
      </header>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default App;
