import { JsonRpcProvider } from "ethers";
import { Fetcher, Token } from "@uniswap/sdk";

// Функция для тестирования
async function testUniswapFetcher() {
  // Используем JsonRpcProvider для подключения к сети Arbitrum
  const provider = new JsonRpcProvider("https://arb1.arbitrum.io/rpc", 42161);

  try {
    // Получаем информацию о сети
    const network = await provider.getNetwork();
    console.log("Провайдер подключен к сети:", network);

    // Определяем два токена: USDT и USDC
    const USDT = new Token(
      42161,
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      6,
      "USDT",
      "Tether USD"
    );
    const USDC = new Token(
      42161,
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      6,
      "USDC",
      "USD Coin"
    );
    console.log("test" + (await provider.getSigner()));
    // Попробуем получить данные пары через Fetcher
    const pair = await Fetcher.fetchPairData(USDT, USDC, provider);

    console.log("Пара токенов получена:", pair);
  } catch (error) {
    console.error("Ошибка при получении данных пары токенов:", error);
  }
}

// Запуск теста
testUniswapFetcher();
