import axios from "axios";
import {
  createPublicClient,
  createWalletClient,
  custom,
  erc20Abi,
  parseUnits,
  formatUnits
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

if (window.ethereum) {
  try {
    publicClient = createPublicClient({
      chain: CHAIN,
      transport: custom(window.ethereum)
    });

    console.log("Public client initialized", publicClient);

    walletClient = createWalletClient({
      chain: CHAIN,
      transport: custom(window.ethereum)
    });
    console.log(walletClient, "wallet-client");
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
      console.log(formatUnits(balance, 18));
      return formatUnits(balance, 18);
    }

    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });
    console.log(balance);
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
    console.log(allowance);
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
    console.log(walletClient);

    if (!tokenAddress || !userAddress) {
      throw new Error("Недостаточно данных для выполнения approve");
    }

    const decimals = await getTokenDecimals(tokenAddress);
    if (decimals === undefined || decimals === null) {
      throw new Error(
        "Не удалось получить количество десятичных знаков токена"
      );
    }

    const approvalAmount = parseUnits(amount.toString(), decimals);

    console.log(`Approval Amount (wei): ${approvalAmount}`);

    const txResponse = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [SQUID_ROUTER_ADDRESS, approvalAmount],
      account: userAddress
    });

    console.log(txResponse);

    if (typeof txResponse !== "string") {
      throw new Error("Не удалось получить хэш транзакции");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txResponse,
      timeout: 60000
    });

    console.log("receipt:", receipt.status.trim());

    return true;
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

const getRoute = async (
  fromTokenAddress,
  toTokenAddress,
  amountIn,
  slippage,
  userAddress
) => {
  const integratorId = INTEGRATOR_ID;
  const fromAmount = parseUnits(amountIn.toString(), 6);
  const params = {
    fromAddress: userAddress,
    fromToken: fromTokenAddress,
    toToken: toTokenAddress,
    fromAmount: fromAmount.toString(),
    slippage,
    fromChain: "42161",
    toChain: "42161",
    integratorId,
    toAddress: userAddress
  };

  try {
    const result = await axios.post(
      "https://apiplus.squidrouter.com/v2/route",
      params,
      {
        headers: {
          "x-integrator-id": integratorId,
          "Content-Type": "application/json"
        }
      }
    );

    const requestId = result.headers["x-request-id"];
    return { data: result.data, requestId: requestId };
  } catch (error) {
    console.error("Error with parameters:", params);
    throw error;
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
  try {
    if (!walletClient || !publicClient) {
      throw new Error("Клиенты не инициализированы");
    }

    const routeResponse = await getRoute(
      fromTokenAddress,
      toTokenAddress,
      amountIn,
      slippage,
      userAddress
    );

    if (!routeResponse || !routeResponse.data) {
      throw new Error("Не удалось получить маршрут для свапа");
    }

    const routeData = routeResponse.data;

    const swapTx = await walletClient.sendTransaction({
      to: routeData.route.transactionRequest.target,
      data: routeData.route.transactionRequest.data,
      value: routeData.route.transactionRequest.value,
      gasPrice: BigInt(routeData.route.transactionRequest.gasPrice),
      gasLimit: BigInt(10 * 10 ** 9),
      account: userAddress
    });

    console.log(swapTx);

    if (typeof swapTx !== "string") {
      throw new Error("Не удалось получить хэш транзакции");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: swapTx,
      timeout: 60000
    });

    console.log(receipt);

    return receipt;
  } catch (error) {
    console.error("Ошибка при выполнении свапа:", error);
    throw error;
  }
};
