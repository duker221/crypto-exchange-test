import React from "react";
import "./App.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import CustomConnectButton from "./components/ConnectBtn";
import config from "./utils/config";
import Logo from "./components/Logo";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={config.chains}>
          <div className="app-background">
            <header className="w-full h-[96px] flex justify-between items-center p-4 rounded-tl-[20px] z-10">
              <Logo />
              <CustomConnectButton />
            </header>

            <section className="w-[500px] h-[388px] bg-amber-100 rounded-custom-40 border-4 border-black-500">
              <div className="w-[57px] h-[26px] px-24 py-32">
                <h1 className="font-firs text-[26px] leading-[26.5px] font-bold">
                  From
                </h1>
              </div>
            </section>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
