import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useWalletStore from "../store/useWalletStore";
import { getTokenBalance, approveToken } from "../services/viemService";

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken } =
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
    if (fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      setHasAllowance(true);
      return true;
    }
    if (fromToken && address && amount) {
      try {
        const approved = await approveToken(fromToken.address, amount, address);
        if (approved) {
          console.log("Токен успешно одобрен.");
          setHasAllowance(true);
        }
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
