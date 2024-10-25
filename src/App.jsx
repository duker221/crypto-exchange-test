import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import toast, { Toaster } from "react-hot-toast";
import CustomConnectButton from "./components/Buttons/ConnectBtn";
import config from "./services/config";
import Logo from "./components/Logo";
import { getSwapRate, performSwap } from "./services/viemService";
import TokenSelect from "./components/Buttons/TokenSelect";
import SelectedCurrency from "./components/Buttons/SelectedCurrency";
import TokenModal from "./components/Modals/TokenModal";
import SuccessScreen from "./components/SwapResult/SuccessScreen";
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
    checkUserAllowance,
    address
  } = useTokenBalance();

  const { isModalOpen, activeSelect, handleOpenModal, handleCloseModal } =
    useModal();
  const [amountIn, setAmountIn] = useState("");
  const {
    tokens,
    setError,
    setSwapStatus,
    swapStatus,
    setFromToken,
    setToToken
  } = useWalletStore();
  const [toAmount, setToAmount] = useState("");
  const [amountError, setAmountError] = useState(false);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [swapErrorMessage, setSwapErrorMessage] = useState(null);
  const [receivedTokens, setReceivedTokens] = useState(null);

  const handleFromAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "");

    if (sanitizedValue === "") {
      setAmountIn("");
      setAmountError(false);
      return;
    }

    const numericValue = Number(sanitizedValue);

    if (numericValue < 0) {
      return;
    }

    if (balance < numericValue) {
      setAmountError(true);
      setError("Insufficient funds");
    } else {
      setAmountError(false);
    }

    setAmountIn(sanitizedValue);
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
    try {
      const allowanceValid = await checkUserAllowance(amountIn);
      setIsCheckingAllowance(allowanceValid);
      if (allowanceValid) {
        toast.success("Approval granted. Ready to swap.");
      }
    } catch (error) {
      setIsCheckingAllowance(false);
      setError(error.message);
    }
  };

  const closeFinalScreen = () => {
    setSwapStatus("idle");
    setAmountIn("");
    setToAmount("");
    setAmountError(false);
    setIsCheckingAllowance(false);
    setReceivedTokens(null);
    setSwapErrorMessage(null);
    setFromToken(null);
    setToToken(null);
  };

  const swapTokens = async () => {
    if (!amountError && fromToken && toToken && amountIn > 0) {
      setSwapStatus("loading");

      try {
        await performSwap(
          fromToken.address,
          toToken.address,
          amountIn,
          1,
          address
        );
        setSwapStatus("success");
        setReceivedTokens({ amount: toAmount, iconUrl: toToken.iconUrl });
        toast.success("Swap completed successfully!");
      } catch (error) {
        const errorMessage =
          error.details || "An error occurred during the swap";
        toast.error(errorMessage);
        setSwapErrorMessage(errorMessage);
        setSwapStatus("failed");
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

              <section
                className={`w-full max-w-[500px] h-auto py-8 px-6 flex flex-col gap-[12px] rounded-[40px] border-[4px] border-black-500 mx-auto ${
                  swapStatus === "failed" ? "bg-pink-500" : "bg-cream-500"
                }`}
              >
                {swapStatus === "idle" || swapStatus === "loading" ? (
                  <div>
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
                        <TokenSelect
                          onOpenModal={() => handleOpenModal("from")}
                        />
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
                      className={`w-full h-auto max-h-[71px] py-4 text-[26px]  text-white rounded-2xl mt-4 font-medium text-center ${
                        fromToken && toToken ? "" : "hidden"
                      } ${swapStatus === "loading" ? "bg-disabled-500" : "bg-brown-500"}`}
                      onClick={
                        isCheckingAllowance ? swapTokens : handleCheckAllowance
                      }
                      disabled={amountError || swapStatus === "loading"}
                    >
                      {swapStatus === "loading" && "Swap in progress..."}
                      {swapStatus !== "loading" &&
                        isCheckingAllowance &&
                        "Swap"}
                      {swapStatus !== "loading" &&
                        !isCheckingAllowance &&
                        "Approve"}
                    </button>
                  </div>
                ) : (
                  <SuccessScreen
                    receivedTokens={receivedTokens}
                    receivedAmount={toAmount}
                    closeFinalScreen={closeFinalScreen}
                    swapError={swapStatus === "failed"}
                    errorMessage={swapErrorMessage}
                  />
                )}
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

            <Toaster />
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
