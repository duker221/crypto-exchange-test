const axios = require("axios");

// Load environment variables from .env file
const integratorId = "crypto-exchange-27412c9b-8303-4c14-a16f-9f291058e335"; // Make sure you set this in your .env file

// Define chain and token addresses
const fromChainId = "42161"; // Arbitrum
const toChainId = "42161"; // Arbitrum

// Define token addresses
const WETH_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // WETH on Arbitrum
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // USDC on Arbitrum

// Function to get token information from Squid API
const getTokens = async () => {
  try {
    const result = await axios.get(
      "https://apiplus.squidrouter.com/v2/sdk-info",
      {
        headers: {
          "x-integrator-id": integratorId
        }
      }
    );
    return result.data.tokens;
  } catch (error) {
    console.error("Error fetching token data:", error);
    return [];
  }
};

// Function to find a specific token in the token list
const findToken = (tokens, address, chainId) => {
  if (!Array.isArray(tokens)) {
    console.error("Invalid tokens data structure");
    return null;
  }

  return tokens.find(
    (t) =>
      t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId
  );
};

// Function to calculate the exchange amount
const calculateExchangeAmount = async (
  fromAmount,
  fromTokenAddress,
  toTokenAddress
) => {
  try {
    // Get token information
    const tokens = await getTokens();

    // Find the specific tokens
    const fromToken = findToken(tokens, fromTokenAddress, fromChainId);
    const toToken = findToken(tokens, toTokenAddress, toChainId);

    if (!fromToken || !toToken) {
      console.error("Tokens not found");
      return;
    }

    // Log token prices for debugging
    console.log(
      `From Token (${fromToken.symbol}) Price: $${fromToken.usdPrice}`
    );
    console.log(`To Token (${toToken.symbol}) Price: $${toToken.usdPrice}`);

    // Calculate how much you will get for the exchanged tokens
    const fromTokenPrice = fromToken.usdPrice;
    const toTokenPrice = toToken.usdPrice;

    // Calculate the dollar value of the exchanged tokens
    const fromAmountInUSD =
      (Number(fromAmount) / 10 ** fromToken.decimals) * fromTokenPrice;

    // Calculate how much you will get in toToken
    const toAmount = (fromAmountInUSD / toTokenPrice) * 10 ** toToken.decimals;

    console.log(
      `You will receive approximately ${toAmount.toFixed(6)} ${toToken.symbol} for ${fromAmount} ${fromToken.symbol}`
    );
  } catch (error) {
    console.error("Error calculating exchange amount:", error);
  }
};

// Example call to the function
const fromAmount = "1000000000000000000"; // 1 WETH in wei
calculateExchangeAmount(fromAmount, WETH_ADDRESS, USDC_ADDRESS);
