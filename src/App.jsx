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
import { getSwapRate, performSwap } from "./services/viemService";
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
    checkUserAllowance,
    address
  } = useTokenBalance();

  const { isModalOpen, activeSelect, handleOpenModal, handleCloseModal } =
    useModal();
  const [amountIn, setAmountIn] = useState(0);
  const { tokens, setError } = useWalletStore();
  const [toAmount, setToAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  const handleFromAmountChange = (value) => {
    if (value < 0) {
      setAmountIn("");
      return;
    }
    if (balance < value) {
      console.log(value);
      setAmountError(true);
      setError("Недостаточно средств");
    } else {
      setAmountError(false);
    }
    setAmountIn(Number(value));
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
          setError(error.message);
          setToAmount("");
        }
      };

      calculateToAmount();
    }
  }, [amountIn, fromToken, toToken]);

  const handleCheckAllowance = async () => {
    if (amountError || !fromToken || !toToken || amountIn <= 0) return;

    const allowanceValid = await checkUserAllowance(amountIn);

    if (!allowanceValid) {
      toast.info("Необходимо подтвердить разрешение (Approve)");
      console.log(hasAllowance);
    } else {
      setIsCheckingAllowance(true);
      toast.info("Разрешение получено. Готово к свопу.");
    }
    setIsCheckingAllowance(false);
  };

  const swapTokens = async () => {
    console.log("Amount to swap:", amountIn);
    if (!amountError && fromToken && toToken && amountIn > 0) {
      console.log("Initiating swap with amount:", amountIn);
      try {
        await performSwap(
          fromToken.address,
          toToken.address,
          amountIn,
          1,
          address
        );
        toast.success("Своп выполнен успешно!");
      } catch (error) {
        setError(error.message);
        console.log(error);
        toast.error("Ошибка при выполнении свопа");
      }
    } else {
      console.error("Swap not initiated, amount error:", amountError);
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

              <section className="w-full max-w-[500px] h-auto py-8 px-6 flex flex-col gap-[12px] rounded-[40px] border-[4px] border-black-500 bg-cream-500 mx-auto">
                <div className="flex flex-col gap-[12px]">
                  <h1 className="font-bold text-[26px] text-center md:text-left">
                    From
                  </h1>
                  {fromToken ? (
                    <SelectedCurrency
                      amount={amountIn}
                      selectedToken={fromToken.name}
                      logoPath={fromToken.iconUrl}
                      onOpenModal={() => handleOpenModal("from")}
                      onAmountChange={handleFromAmountChange}
                      balance={balance ? balance.formatted : "0"}
                      readOnly={false}
                      error={amountError}
                    />
                  ) : (
                    <TokenSelect onOpenModal={() => handleOpenModal("from")} />
                  )}
                </div>
                <h1 className="font-bold text-[26px] text-center md:text-left">
                  To
                </h1>
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
                  className={`w-full h-auto max-h-[71px] py-4 text-[26px] bg-brown-500 text-white rounded-2xl mt-4 font-medium text-center ${
                    fromToken && toToken && !isCheckingAllowance ? "" : "hidden"
                  }`}
                  onClick={hasAllowance ? swapTokens : handleCheckAllowance}
                  disabled={amountError || isCheckingAllowance}
                >
                  {hasAllowance ? "Своп" : "Approve"}
                </button>
              </section>
              <footer className="px-[40px] py-[32px] fixed bottom-0 left-0 right-0 flex justify-center sm:absolute sm:justify-end sm:bottom-0 sm:right-0">
                <div className="w-auto h-auto sm:h-[112px] sm:w-[112px] flex items-center radius-2xl bg-cream-500 p-2 rounded-2xl border-[2px] border-brown-500">
                  <img
                    src={`${process.env.PUBLIC_URL}/ArbitrumLogo.png`}
                    alt="Arbitrum Logo"
                    className="w-[92px] h-[77px]"
                  />
                </div>
              </footer>
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
