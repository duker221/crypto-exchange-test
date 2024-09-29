import { Contract, parseUnits, JsonRpcApiProvider } from "ethers";
import {
  Fetcher,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
  Token
} from "@uniswap/sdk";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const ERC20_ABI = [
  "function allowance(address owner, address spender) external view returns (uint256)"
];

export async function getSwapRate(fromToken, toToken) {
  if (!window.ethereum) {
    throw new Error("MetaMask не найден");
  }

  // Инициализация BrowserProvider через MetaMask
  const provider = new JsonRpcApiProvider(
    "https://arb1.arbitrum.io/rpc",
    42161
  );
  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();
  console.log("Подключен к сети:", network);

  // Проверяем корректность токенов
  if (!fromToken || !toToken || !fromToken.address || !toToken.address) {
    throw new Error("Токены не определены или имеют некорректные данные");
  }

  const tokenA = new Token(
    42161,
    fromToken.address,
    fromToken.decimals,
    fromToken.symbol,
    fromToken.name
  );
  const tokenB = new Token(
    42161,
    toToken.address,
    toToken.decimals,
    toToken.symbol,
    toToken.name
  );

  console.log("Token A:", tokenA);
  console.log("Token B:", tokenB);
  console.log(provider);

  try {
    const pair = await Fetcher.fetchPairData(tokenA, tokenB, provider);

    if (!pair) {
      throw new Error("Пара токенов не найдена");
    }

    const route = new Route([pair], tokenB);
    const price = route.midPrice.toSignificant(6);

    console.log(`1 ${fromToken.symbol} = ${price} ${toToken.symbol}`);
    return price;
  } catch (error) {
    console.error("Ошибка при получении данных пары токенов:", error);
    throw error;
  }
}

export async function executeSwap(signer, fromToken, toToken, amountIn) {
  const tokenA = new Token(
    42161, // Chain ID для Arbitrum
    fromToken.address,
    fromToken.decimals,
    fromToken.symbol,
    fromToken.name
  );
  const tokenB = new Token(
    42161, // Chain ID для Arbitrum
    toToken.address,
    toToken.decimals,
    toToken.symbol,
    toToken.name
  );

  const pair = await Fetcher.fetchPairData(tokenA, tokenB, signer.provider);
  const route = new Route([pair], tokenA);

  const trade = new Trade(
    route,
    new TokenAmount(
      tokenA,
      parseUnits(amountIn.toString(), fromToken.decimals)
    ),
    TradeType.EXACT_INPUT
  );

  const slippageTolerance = new Percent("50", "10000");
  const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString();
  const path = [fromToken.address, toToken.address];
  const to = await signer.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const uniswapRouter = new Contract(
    UNISWAP_ROUTER_ADDRESS,
    [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
    ],
    signer
  );

  const tx = await uniswapRouter.swapExactTokensForTokens(
    parseUnits(amountIn.toString(), fromToken.decimals),
    amountOutMin,
    path,
    to,
    deadline
  );

  console.log(`Transaction Hash: ${tx.hash}`);
}

// Функция для проверки разрешения на отправку токенов (allowance)
export async function checkAllowance(
  signer,
  tokenAddress,
  spenderAddress,
  amount
) {
  const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
  const ownerAddress = await signer.getAddress();
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  const isAllowed = parseUnits(amount.toString(), 18).lte(allowance);

  return isAllowed;
}
