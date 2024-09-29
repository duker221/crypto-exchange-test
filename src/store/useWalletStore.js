import { create } from "zustand";

const useWalletStore = create((set) => ({
  fromToken: null,
  toToken: null,
  tokens: [
    {
      name: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      iconUrl: "/currency/USDT.png",
      decimals: 6
    },
    {
      name: "USDC",
      address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      symbol: "USDC",
      iconUrl: "/currency/USDC.png",
      decimals: 6
    },
    {
      name: "ETH",
      address: undefined,
      symbol: "ETH",
      iconUrl: "/currency/ETH.png",
      decimals: 18
    }
  ],
  setFromToken: (token) => set({ fromToken: token }),
  setToToken: (token) => set({ toToken: token })
}));

export default useWalletStore;
