import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ToastContainer, toast } from "react-toastify";
import CustomConnectButton from "./components/Buttons/ConnectBtn";
import config from "./services/config";
import Logo from "./components/Logo";
import { getSwapRate } from "./services/uniswapService";
import TokenSelect from "./components/Buttons/TokenSelect";
import SelectedCurrency from "./components/Buttons/SelectedCurrency";
import TokenModal from "./components/Modals/TokenModal";
import useTokenBalance from "./hooks/useTokenBalance";
import useModal from "./hooks/useModal";
import useWalletStore from "./store/useWalletStore";

const queryClient = new QueryClient();

function App() {
  const {
    fromToken,
    toToken,
    balance,
    handleTokenSelect,
    hasAllowance,
    handleApprove
  } = useTokenBalance();

  const { isModalOpen, activeSelect, handleOpenModal, handleCloseModal } =
    useModal();
  const [amountIn, setAmountIn] = useState(0);
  const { tokens, setError } = useWalletStore();
  const [toAmount, setToAmount] = useState("");

  const handleFromAmountChange = async (value) => {
    if (value < 0) {
      setAmountIn("");
      return;
    }
    if (balance < value) {
      setError("Недостаточно средств");
    }
    console.log(balance);
    setAmountIn(value);
  };
  useEffect(() => {
    if (fromToken && toToken && amountIn > 0) {
      const calculateToAmount = async () => {
        try {
          const calculatedToAmount = await getSwapRate(
            amountIn,
            fromToken.address,
            toToken.address
          );
          setToAmount(calculatedToAmount);
        } catch (error) {
          console.error("Ошибка при расчете курса:", error);
          setError(error.message);
          setToAmount("");
        }
      };

      calculateToAmount();
    }
  }, [amountIn, fromToken, toToken]);

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

              <section className="w-[500px] h-auto py-8 px-6 flex flex-col gap-[12px] rounded-[40px] border-[4px] border-black-500 bg-cream-500">
                <div className="flex flex-col gap-[12px]">
                  <h1 className="font-bold text-[26px]">From</h1>
                  {fromToken ? (
                    <SelectedCurrency
                      amount={amountIn}
                      selectedToken={fromToken.name}
                      logoPath={fromToken.iconUrl}
                      onOpenModal={() => handleOpenModal("from")}
                      onAmountChange={handleFromAmountChange}
                      balance={balance ? balance.formatted : "0"}
                      readOnly={false}
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
                    readOnly
                  />
                ) : (
                  <TokenSelect onOpenModal={() => handleOpenModal("to")} />
                )}

                <button
                  type="button"
                  className={`w-full h-auto max-h-[71px] py-4 text-[26px] bg-brown-500 text-white rounded-2xl mt-4 font-medium text-center ${fromToken && toToken ? "" : "hidden"}`}
                  onClick={handleApprove}
                >
                  {hasAllowance ? "Своп" : "Approve"}
                </button>
              </section>
            </div>
            <ToastContainer />
            {isModalOpen && (
              <div className="absolute inset-0 z-50">
                <TokenModal
                  toast={toast}
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
