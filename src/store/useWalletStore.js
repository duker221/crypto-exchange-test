import { create } from "zustand";

const useWalletStore = create((set) => ({
  fromToken: null,
  toToken: null,
  tokens: [
    {
      name: "USDT",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      iconUrl: `${process.env.PUBLIC_URL}/currency/USDT.png`,
      decimals: 6
    },
    {
      name: "USDC",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      symbol: "USDC",
      iconUrl: `${process.env.PUBLIC_URL}/currency/USDC.png`,
      decimals: 6
    },
    {
      name: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      symbol: "ETH",
      iconUrl: `${process.env.PUBLIC_URL}/currency/ETH.png`,
      decimals: 18
    }
  ],
  errors: [],
  swapStatus: "idle",
  setSwapStatus: (status) => set({ swapStatus: status }),
  setError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token })
}));

export default useWalletStore;
