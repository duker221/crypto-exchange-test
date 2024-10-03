import axios from "axios";
import {
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  formatEther,
  getContract,
  http
} from "viem";
import { arbitrum } from "viem/chains";
import { config } from "dotenv";
import { Squid } from "@0xsquid/sdk";
import useWalletStore from "../store/useWalletStore";

config({ path: ".env" });

const INTEGRATOR_ID = "crypto-exchange-27412c9b-8303-4c14-a16f-9f291058e335";
const CHAIN = "arbitrum";
const SQUID_API_URL = "https://apiplus.squidrouter.com/v2/sdk-info";
const SQUID_ROUTER_ADDRESS = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";

let client;

if (typeof window !== "undefined" && window.ethereum) {
  try {
    client = createPublicClient({
      chain: CHAIN, // Убедитесь, что CHAIN правильно определен
      transport: custom(window.ethereum)
    });
    console.log("Клиент успешно создан:", client);
  } catch (error) {
    console.error("Ошибка при создании клиента:", error);
  }
} else {
  useWalletStore.getState().setError("Metamask не установлен");
  console.log(useWalletStore.getState());
}

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
    console.log(balance);
    return balance;
  } catch (error) {
    console.error("Ошибка получения баланса токена:", error);
    return null;
  }
};

export const checkAllowance = async (
  tokenAddress,
  userAddress,
  spenderAddress = SQUID_ROUTER_ADDRESS
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
    console.error("Ошибка при проверке allowance:", error);
    return null;
  }
};

export const approveToken = async (
  tokenAddress,
  amount,
  spenderAddress = SQUID_ROUTER_ADDRESS
) => {
  try {
    console.log(client);
    const tokenContract = getContract({
      address: tokenAddress,
      abi: erc20Abi,
      client
    });

    // Вызываем функцию approve
    const approveTx = await tokenContract.write("approve", {
      args: [spenderAddress, amount]
    });

    // Ждем подтверждения транзакции
    await approveTx.wait();
    console.log("Токен одобрен");
  } catch (error) {
    console.error("Ошибка при выполнении approve:", error);
    throw error; // Пробросьте ошибку для обработки в обработчике
  }
};

const getTokens = async () => {
  try {
    const result = await axios.get(SQUID_API_URL, {
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

export const performSwap = async (
  amountIn,
  fromToken,
  toToken,
  userAddress
) => {
  const { setError } = useWalletStore();

  try {
    // Проверяем allowance
    const allowance = await checkAllowance(
      fromToken.address,
      userAddress,
      SQUID_ROUTER_ADDRESS
    );

    const formattedAmount = BigInt(amountIn * 10 ** fromToken.decimals);

    // Если allowance недостаточно, получаем одобрение
    if (allowance < formattedAmount) {
      const tokenContract = getContract({
        address: fromToken.address,
        abi: erc20Abi,
        client // Используйте ваш publicClient
      });

      const approveTx = await tokenContract.write("approve", {
        args: [SQUID_ROUTER_ADDRESS, formattedAmount]
      });
      await approveTx.wait(); // Ждем подтверждения транзакции
      console.log("Токен одобрен");
    }

    // Получаем предварительный курс свопа
    const rate = await getSwapRate(
      amountIn,
      fromToken.address,
      toToken.address
    );
    console.log("Предварительный курс свопа:", rate);

    // Выполняем своп через Squid Router
    const squid = new Squid({ chain: CHAIN });
    const swapTx = await squid.swap({
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount: formattedAmount,
      userAddress
    });

    await swapTx.wait();
    console.log("Своп выполнен успешно!");
  } catch (error) {
    console.error("Ошибка при выполнении свопа:", error);
    if (error.message) {
      setError(`Ошибка: ${error.message}`); // Отображаем сообщение об ошибке
    } else {
      setError("Ошибка при выполнении свопа");
    }
  }
};
