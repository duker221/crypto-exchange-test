import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useWalletStore from "../store/useWalletStore";
import { getTokenBalance, approveToken } from "../services/viemService";

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken, tokens } =
    useWalletStore.getState();
  const { address } = useAccount();
  const [balance, setBalance] = useState(null);
  const [hasAllowance, setHasAllowance] = useState(false);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (fromToken && address) {
        const userBalance = await getTokenBalance(
          fromToken.symbol,
          fromToken.address,
          address
        );
        setBalance(userBalance);
      }
    };
    fetchTokenBalance();
  }, [fromToken, address]);

  const checkUserAllowance = async (amount) => {
    console.log(tokens);
    const eth = tokens.find((t) => t.name === "ETH");
    if (fromToken.address === eth.address) {
      setHasAllowance(true);
      return true;
    }
    if (fromToken && address && amount) {
      try {
        const approved = await approveToken(fromToken.address, amount, address);

        setHasAllowance(approved); // Обновляем состояние
        console.log(approved); // Выводим true или false

        // Вместо использования `hasAllowance` сразу после setState
        return approved; // Возвращаем локально проверенное значение
      } catch (error) {
        console.error("Ошибка при проверке allowance:", error);
        console.log("Произошла ошибка при одобрении токена.");
      }
    }
  };

  const handleTokenSelect = (token, closeModal, activeSelect) => {
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
    balance,
    hasAllowance,
    handleTokenSelect,
    checkUserAllowance,
    address
  };
}
