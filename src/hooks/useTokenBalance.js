import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useWalletStore from "../store/useWalletStore";
import {
  getTokenBalance,
  getSwapRate,
  getTokenAllowance
} from "../services/uniswapService";

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken } =
    useWalletStore.getState();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [hasAllowance, setHasAllowance] = useState(true);

  // Получение баланса токена
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (fromToken && address) {
        const userBalance = await getTokenBalance(
          fromToken.symbol,
          fromToken.address,
          address
        );
        setBalance(userBalance); // Обновляем баланс
        console.log("Баланс токена:", userBalance);
      }
    };
    fetchTokenBalance();
  }, [fromToken, address]);

  // Обновление курса обмена
  useEffect(() => {
    const updateSwapRate = async () => {
      if (fromToken && toToken && amount) {
        console.log("Текущие токены и сумма:", fromToken, toToken, amount);
        const rate = await getSwapRate(
          amount,
          fromToken.address,
          toToken.address
        );
        setAmountReceived(rate);
      }
    };
    updateSwapRate();
  }, [fromToken, toToken, amount]);

  // Проверка разрешений (allowance)
  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (fromToken && address && amount) {
        const isAllowed = await getTokenAllowance(
          fromToken.address,
          address,
          "0xE592427A0AEce92De3Edee1F18E0157C05861564" // Адрес контракта-спендера
        );
        setHasAllowance(isAllowed);
      }
    };
    checkTokenAllowance();
  }, [fromToken, address, amount]);

  // Обработчик выбора токена
  const handleTokenSelect = (token, closeModal, activeSelect) => {
    console.log("Выбран токен:", token);

    if (activeSelect === "from") {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    closeModal();
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
