import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { Token } from "@uniswap/sdk";
import useWalletStore from "../store/useWalletStore";
import { getSwapRate, checkAllowance } from "../services/uniswapService"; // Правильный импорт

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken } = useWalletStore();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [hasAllowance, setHasAllowance] = useState(true);

  const { data: tokenBalance } = useBalance({
    address,
    chainId: arbitrum.id,
    token: fromToken ? fromToken.address : undefined,
    watch: true
  });

  // Создаем экземпляры токенов для Uniswap
  const createUniswapToken = (token) => {
    const uniswapToken = new Token(
      arbitrum.id,
      token.address,
      token.decimals,
      token.symbol,
      token.name
    );
    console.log("Создан экземпляр Uniswap Token:", uniswapToken);
    return uniswapToken;
  };

  useEffect(() => {
    if (fromToken && tokenBalance) {
      setBalance(tokenBalance);
      console.log(tokenBalance);
    }
  }, [fromToken, tokenBalance]);

  useEffect(() => {
    const updateSwapRate = async () => {
      if (fromToken && toToken && amount) {
        console.log(fromToken, toToken, amount);
        const fromUniswapToken = createUniswapToken(fromToken);
        const toUniswapToken = createUniswapToken(toToken);

        const rate = await getSwapRate(
          fromUniswapToken,
          toUniswapToken,
          amount
        );
        setAmountReceived(rate);
      }
    };
    updateSwapRate();
  }, [fromToken, toToken, amount]);

  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (fromToken && address && amount) {
        const isAllowed = await checkAllowance(
          fromToken.address,
          address,
          "0xE592427A0AEce92De3Edee1F18E0157C05861564",
          amount
        );
        setHasAllowance(isAllowed);
      }
    };
    checkTokenAllowance();
  }, [fromToken, address, amount]);

  const handleTokenSelect = (token, closeModal, activeSelect) => {
    console.log("Выбран токен:", token); // Логируем выбор токена
    if (activeSelect === "from") {
      createUniswapToken(token);
      setFromToken(token);
    } else {
      createUniswapToken(token);
      setToToken(token);
    }
    closeModal(); // Закрываем модальное окно после выбора токена
  };

  return {
    fromToken,
    toToken,
    amount,
    setAmount,
    balance,
    amountReceived,
    hasAllowance,
    handleTokenSelect
  };
}
