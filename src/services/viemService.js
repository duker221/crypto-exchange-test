import axios from "axios";
import {
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  formatEther,
  parseUnits
} from "viem";
import { arbitrum } from "viem/chains";
import { config } from "dotenv";

import useWalletStore from "../store/useWalletStore";

config({ path: ".env" });

const INTEGRATOR_ID = process.env.REACT_APP_INTEGRATOR_ID;
const CHAIN = arbitrum;
const SQUID_API_URL = process.env.REACT_APP_SQUID_API_URL;
const SQUID_ROUTER_ADDRESS = process.env.REACT_APP_SQUID_ROUTER_ADDRESS;

let publicClient;
let walletClient;

const SQUID_ROUTER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "fromToken", type: "address" },
      { internalType: "address", name: "toToken", type: "address" },
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "slippage", type: "uint256" },
      { internalType: "address", name: "userAddress", type: "address" }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  }
];

if (window.ethereum) {
  try {
    publicClient = createPublicClient({
      chain: CHAIN,
      transport: custom(window.ethereum)
    });

    walletClient = createWalletClient({
      chain: CHAIN,
      transport: custom(window.ethereum)
    });
  } catch (error) {
    useWalletStore.getState().setError("Metamask не установлен");
  }
}

export const getTokenDecimals = async (tokenAddress) => {
  if (
    tokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  ) {
    return 18;
  }

  try {
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
      args: []
    });
    return decimals;
  } catch (error) {
    return null;
  }
};

export const getTokenBalance = async (tokenName, tokenAddress, userAddress) => {
  try {
    if (!publicClient) {
      throw new Error("Клиент не инициализирован");
    }

    if (tokenName === "ETH") {
      const balance = await publicClient.getBalance({ address: userAddress });
      return formatEther(balance);
    }

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });
    return balance;
  } catch (error) {
    return null;
  }
};

export const checkAllowance = async (
  tokenAddress,
  userAddress,
  spenderAddress = SQUID_ROUTER_ADDRESS
) => {
  try {
    if (!publicClient) {
      throw new Error("Клиент не инициализирован");
    }

    if (
      tokenAddress.toLowerCase() ===
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      console.log("Native token");
      return BigInt(2 ** 256 - 1);
    }

    const allowance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [userAddress, spenderAddress]
    });
    return BigInt(allowance.toString());
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

export const approveToken = async (tokenAddress, amount, userAddress) => {
  try {
    if (!walletClient) {
      throw new Error("Клиент не инициализирован");
    }

    if (!tokenAddress || !userAddress) {
      throw new Error("Недостаточно данных для выполнения approve");
    }

    const decimals = await getTokenDecimals(tokenAddress);
    if (decimals === undefined || decimals === null) {
      throw new Error(
        "Не удалось получить количество десятичных знаков токена"
      );
    }

    const approvalAmount = amount
      ? parseUnits(amount.toString(), decimals)
      : "100000000000000000000";

    console.log(`Approval Amount (wei): ${approvalAmount}`);

    const txResponse = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [SQUID_ROUTER_ADDRESS, approvalAmount],
      account: userAddress
    });

    // Извлечение хэша транзакции
    const txHash = txResponse.hash;

    if (typeof txHash !== "string") {
      throw new Error("Не удалось получить хэш транзакции");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60000
    });

    if (receipt.status === 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Ошибка при одобрении токена:", error);
    throw error;
  }
};
const getTokens = async () => {
  try {
    const result = await axios.get(SQUID_API_URL, {
      headers: {
        "x-integrator-id": INTEGRATOR_ID
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
    const fromToken = findToken(tokens, fromTokenAddress, CHAIN.id.toString());
    const toToken = findToken(tokens, toTokenAddress, CHAIN.id.toString());

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
  fromTokenAddress,
  toTokenAddress,
  amountIn,
  slippage,
  userAddress
) => {
  console.log(amountIn);
  try {
    if (!walletClient || !publicClient) {
      throw new Error("Клиенты не инициализированы");
    }

    const { fromToken } = useWalletStore.getState();

    if (!fromToken || fromToken.decimals === undefined) {
      throw new Error("Необходимо выбрать токен для свапа");
    }

    const amountInBigInt = BigInt(Math.round(Number(amountIn)));
    if (
      fromTokenAddress.toLowerCase() !==
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    ) {
      const allowance = await checkAllowance(
        fromTokenAddress,
        userAddress,
        SQUID_ROUTER_ADDRESS
      );

      if (allowance === null) {
        throw new Error("Не удалось проверить allowance");
      }

      if (allowance < amountInBigInt) {
        const approved = await approveToken(
          fromTokenAddress,
          amountInBigInt.toString(),
          userAddress
        );
        if (!approved) {
          throw new Error("Одобрение токена не удалось");
        }
      } else {
        console.log("Allowance достаточен");
      }
    } else {
      console.log("ETH не требует approve, переходим к свапу");
    }

    const swapData = {
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      amountIn: amountInBigInt,
      slippage,
      userAddress
    };

    const swapTx = await walletClient.writeContract({
      address: SQUID_ROUTER_ADDRESS,
      abi: SQUID_ROUTER_ABI,
      functionName: "swap",
      args: [
        swapData.fromToken,
        swapData.toToken,
        swapData.amountIn,
        swapData.slippage,
        swapData.userAddress
      ],
      account: userAddress,
      gasLimit: 200000,
      gasPrice: 20 * 10 ** 9
    });

    const swapTxHash = swapTx.hash;

    if (typeof swapTxHash !== "string") {
      throw new Error("Не удалось получить хэш транзакции");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: swapTxHash,
      timeout: 60000
    });

    if (receipt.status === 1) {
      return receipt;
    }
    throw new Error("Свап транзакция не удалась");
  } catch (error) {
    console.error("Ошибка при выполнении свапа:", error);
    throw error;
  }
};
