import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Token } from "@uniswap/sdk";
import { ethers } from "ethers";
import useWalletStore from "../store/useWalletStore";
import { getSwapRate, checkAllowance } from "../services/uniswapService";

export default function useTokenBalance() {
  const { fromToken, toToken, setFromToken, setToToken } = useWalletStore();
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [hasAllowance, setHasAllowance] = useState(true);

  const { data: tokenBalance } = useBalance({
    address,
    chainId: 42161,
    token: fromToken ? fromToken.address : undefined,
    watch: true
  });

  const createUniswapToken = (token) => {
    return new Token(
      42161, // Chain ID для Arbitrum
      ethers.getAddress(token.address),
      token.decimals,
      token.symbol,
      token.name
    );
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
    console.log("Выбран токен:", token);
    const uniswapToken = createUniswapToken(token);

    if (activeSelect === "from") {
      setFromToken(uniswapToken);
    } else {
      setToToken(uniswapToken);
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
