import axios from "axios";
import { createPublicClient, custom, erc20Abi, formatEther } from "viem";
import { config } from "dotenv";

config({ path: ".env" });

const INTEGRATOR_ID = process.env.REACT_APP_INTEGRATOR_ID;
const VITE_CHAIN = process.env.REACT_APP_VITE_CHAIN;
const VITE_SQUID_API_URL = process.env.REACT_APP_SQUID_API_URL;

const client = createPublicClient({
  chain: VITE_CHAIN,
  transport: custom(window.ethereum)
});

const integratorId = INTEGRATOR_ID;

export const getTokenBalance = async (tokenName, tokenAddress, userAddress) => {
  try {
    if (tokenName === "ETH") {
      const balance = await client.getBalance({ address: userAddress });
      return formatEther(balance);
    }
    const balance = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });

    return balance;
  } catch (error) {
    console.error("Ошибка получения баланса токена:", error);
    return null;
  }
};

export const getTokenAllowance = async (
  tokenAddress,
  userAddress,
  spenderAddress
) => {
  try {
    const allowance = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [userAddress, spenderAddress]
    });
    return allowance;
  } catch (error) {
    console.error("Ошибка проверки разрешений:", error);
    return null;
  }
};

const getTokens = async () => {
  try {
    const result = await axios.get(VITE_SQUID_API_URL, {
      headers: {
        "x-integrator-id": integratorId
      }
    });
    return result.data.tokens;
  } catch (error) {
    console.error("Ошибка получения данных токенов:", error);
    return [];
  }
};

const findToken = (tokens, address, chainId) => {
  if (!Array.isArray(tokens)) {
    console.error("Неверная структура данных токенов");
    return null;
  }

  const result = tokens.find(
    (t) =>
      t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId
  );
  return result;
};

export const getSwapRate = async (
  fromAmount,
  fromTokenAddress,
  toTokenAddress
) => {
  try {
    const tokens = await getTokens();
    const fromToken = findToken(tokens, fromTokenAddress, "42161");
    const toToken = findToken(tokens, toTokenAddress, "42161");

    if (!fromToken || !toToken) {
      console.error("Токены не найдены");
      return 0;
    }

    const fromAmountInUSD = fromToken.usdPrice;
    const toAmount = toToken.usdPrice;

    const fromAmountInUSDToAmount = fromAmount * fromAmountInUSD;
    const exchangeRate = fromAmountInUSDToAmount / toAmount;

    return exchangeRate.toFixed(4);
  } catch (error) {
    console.error("Ошибка при расчете курса:", error);
    return 0;
  }
};
