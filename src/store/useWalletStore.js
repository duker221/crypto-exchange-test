import { create } from "zustand";

const useWalletStore = create((set) => ({
  address: null,
  error: null,
  setAddress: (newAddress) => set({ address: newAddress }),
  disconnectWallet: () => set({ address: null }),
  setError: (newError) => set({ error: newError })
}));

export default useWalletStore;
