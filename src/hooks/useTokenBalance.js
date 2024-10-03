import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useWalletStore from "../store/useWalletStore";
import {
  getTokenBalance,
  getSwapRate,
  checkAllowance,
  approveToken
} from "../services/uniswapService";

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken } =
    useWalletStore.getState();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [hasAllowance, setHasAllowance] = useState(false);

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

  // Обработчик аппрува
  const handleApprove = async () => {
    if (!hasAllowance) {
      console.log("Запрашиваем разрешение на использование токена");

      try {
        await approveToken(fromToken.address, amount);
        const updatedAllowance = await checkAllowance(
          fromToken.address,
          address
        );
        setHasAllowance(updatedAllowance);
        console.log("Токен успешно одобрен");
      } catch (error) {
        console.error("Ошибка при получении аппрува:", error);
      }
    } else {
      console.log("Разрешение уже выдано");
    }
  };

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
    handleApprove,
    handleTokenSelect
  };
}
