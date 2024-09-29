import { JsonRpcProvider } from "ethers"; // Исправляем импорт ethers
import {
  Fetcher,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent
} from "@uniswap/sdk";
import { createPublicClient, http, parseEther } from "viem";
import { arbitrum } from "wagmi/chains";

// Создаем провайдер с помощью ethers.js
const provider = new JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// Функция для получения курса обмена
export async function getSwapRate(fromToken, toToken) {
  // Получаем пару токенов через Fetcher
  const pair = await Fetcher.fetchPairData(fromToken, toToken, provider);

  // Создаем маршрут для обмена токенов
  const route = new Route([pair], fromToken);

  // Получаем цену обмена
  const price = route.midPrice.toSignificant(6);
  console.log(`1 ${fromToken.symbol} = ${price} ${toToken.symbol}`);

  return price;
}

// Функция для выполнения обмена
export async function executeSwap(signer, fromToken, toToken, amountIn) {
  // Получаем данные для маршрута
  const pair = await Fetcher.fetchPairData(fromToken, toToken, provider);
  const route = new Route([pair], fromToken);

  // Создаем торговую сделку через Uniswap SDK
  const trade = new Trade(
    route,
    new TokenAmount(
      fromToken,
      JsonRpcProvider.utils
        .parseUnits(amountIn.toString(), fromToken.decimals) // Используем ethers
        .toString()
    ),
    TradeType.EXACT_INPUT
  );

  // Устанавливаем допустимое проскальзывание 0.50%
  const slippageTolerance = new Percent("50", "10000");

  // Рассчитываем минимальное количество токенов, которые мы получим
  const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString();

  // Устанавливаем адреса токенов для обмена
  const path = [fromToken.address, toToken.address];

  // Получаем адрес пользователя
  const to = await signer.getAddress();

  // Устанавливаем дедлайн для выполнения обмена
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 минут

  // Инициализация контракта Uniswap Router
  const uniswapRouter = new JsonRpcProvider.Contract(
    "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Uniswap V3 Router
    [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ],
    signer
  );

  // Выполнение swap
  const tx = await uniswapRouter.swapExactTokensForTokens(
    JsonRpcProvider.utils.parseUnits(amountIn.toString(), fromToken.decimals),
    amountOutMin,
    path,
    to,
    deadline
  );

  console.log(`Transaction Hash: ${tx.hash}`);
}

// Функция для проверки разрешения на отправку токенов (allowance)
export async function checkAllowance(tokenAddress, owner, spender, amount) {
  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http()
  });

  const allowanceABI = [
    {
      constant: true,
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function"
    }
  ];

  const allowance = await publicClient.readContract({
    address: tokenAddress,
    abi: allowanceABI,
    functionName: "allowance",
    args: [owner, spender]
  });

  return allowance >= parseEther(amount.toString());
}
