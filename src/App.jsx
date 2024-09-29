import React, { useState } from "react";
import "./App.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { BrowserProvider, Contract } from "ethers";
import CustomConnectButton from "./components/Buttons/ConnectBtn";
import config from "./services/config";
import Logo from "./components/Logo";
import { getSwapRate, executeSwap, ERC20_ABI } from "./services/uniswapService";
import TokenSelect from "./components/Buttons/TokenSelect";
import SelectedCurrency from "./components/Buttons/SelectedCurrency";
import TokenModal from "./components/Modals/TokenModal";
import useTokenBalance from "./hooks/useTokenBalance";
import useModal from "./hooks/useModal";
import useWalletStore from "./store/useWalletStore";

const queryClient = new QueryClient();

function App() {
  const { fromToken, toToken, balance, handleTokenSelect } = useTokenBalance();
  const { isModalOpen, activeSelect, handleOpenModal, handleCloseModal } =
    useModal();
  const { tokens } = useWalletStore();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  const handleFromAmountChange = async (value) => {
    setFromAmount(value);

    if (fromToken && toToken) {
      console.log(fromToken, toToken);
      try {
        const calculatedToAmount = await getSwapRate(fromToken, toToken);
        setToAmount(calculatedToAmount);
      } catch (error) {
        console.error("Ошибка при расчете курса:", error);
      }
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    try {
      setIsSwapping(true);

      if (!window.ethereum) {
        alert("Пожалуйста, установите MetaMask.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const tokenContract = new Contract(fromToken.address, ERC20_ABI, signer);
      const tokenBalance = await tokenContract.balanceOf(
        await signer.getAddress()
      );
      console.log(`Баланс токена ${fromToken.address}: ${tokenBalance}`);

      if (balance.lt(fromAmount)) {
        alert("Недостаточно баланса для обмена");
        return;
      }

      await executeSwap(signer, fromToken, toToken, fromAmount);

      alert("Обмен выполнен успешно!");
    } catch (error) {
      console.error("Ошибка при обмене:", error);
      alert("Ошибка при выполнении обмена");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={config.chains}>
          <div className="relative">
            <div className={`app-background ${isModalOpen ? "blur-2xl" : ""}`}>
              <header className="w-full h-[96px] flex justify-between items-center p-4 rounded-tl-[20px]">
                <Logo />
                <CustomConnectButton />
              </header>

              <section className="w-[500px] h-auto py-8 px-6 flex flex-col gap-[32px] rounded-[40px] border-[4px] border-black-500 bg-cream-500">
                <div className="flex flex-col gap-[32px]">
                  <h1 className="font-bold text-[26px]">From</h1>
                  {fromToken ? (
                    <SelectedCurrency
                      amount={fromAmount}
                      selectedToken={fromToken.name}
                      logoPath={fromToken.iconUrl}
                      onOpenModal={() => handleOpenModal("from")}
                      onAmountChange={handleFromAmountChange}
                      balance={balance ? balance.formatted : "0"}
                    />
                  ) : (
                    <TokenSelect onOpenModal={() => handleOpenModal("from")} />
                  )}
                </div>
                <h1 className="font-bold text-[26px]">To</h1>
                {toToken ? (
                  <SelectedCurrency
                    amount={toAmount}
                    selectedToken={toToken.name}
                    logoPath={toToken.iconUrl}
                    onOpenModal={() => handleOpenModal("to")}
                  />
                ) : (
                  <TokenSelect onOpenModal={() => handleOpenModal("to")} />
                )}
                <button
                  type="button"
                  className="w-full py-4 bg-blue-500 text-white font-bold rounded mt-4"
                  onClick={handleSwap}
                  disabled={isSwapping}
                >
                  {isSwapping ? "Swapping..." : "Swap Tokens"}
                </button>
              </section>
            </div>
            {isModalOpen && (
              <div className="absolute inset-0 z-50">
                <TokenModal
                  onSelect={(token) =>
                    handleTokenSelect(token, handleCloseModal, activeSelect)
                  }
                  onClose={handleCloseModal}
                  tokens={tokens}
                />
              </div>
            )}
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
