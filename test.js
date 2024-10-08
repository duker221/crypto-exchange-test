import { Squid } from "@0xsquid/sdk";
import { arbitrum } from "viem/chains";

const INTEGRATOR_ID = "crypto-exchange-27412c9b-8303-4c14-a16f-9f291058e335";
const CHAIN = arbitrum;
const SQUID_API_URL = "https://apiplus.squidrouter.com"; // Добавлен пропущенный "const"

const squid = new Squid({
  chain: CHAIN,
  integratorId: INTEGRATOR_ID,
  baseUrl: SQUID_API_URL
});

// Инициализация Squid
await squid.init();

const routeParams = {
  fromTokenAddress: "0xc2deB19D78F5b180ADC36c370A37Cea52E09137C", // Адрес токена отправления
  toTokenAddress: "0xc2deB19D78F5b180ADC36c370A37Cea52E09137C", // Адрес токена получения
  amount: "200000000000000", // Пример для 0.0002 ETH в wei
  userAddress: "0xc2deB19D78F5b180ADC36c370A37Cea52E09137C" // Адрес пользователя
};

try {
  // Получение маршрута
  const routeResponse = await squid.getRoute(routeParams);
  console.log("Route Response:", routeResponse);

  const executeParams = {
    route: routeResponse.route,
    sender: "0xc2deB19D78F5b180ADC36c370A37Cea52E09137C" // Адрес отправителя
  };

  // Выполнение свопа
  const transactionResponses = await squid.executeRoute(executeParams);
  console.log("Transaction Responses:", transactionResponses);
} catch (error) {
  console.error("Error during swap:", error);
}
