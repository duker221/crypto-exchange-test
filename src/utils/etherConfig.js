import { BrowserProvider } from "ethers";

export const etherConfig = () => {
  if (window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    return provider;
  }
  console.log("Please install MetaMask");
  return null;
};

export const connectWallet = async (setError) => {
  try {
    const provider = etherConfig();
    if (!provider) return null;
    const account = await provider.send("eth_requestAccounts", []);
    return account[0];
  } catch (error) {
    setError(`Ошибка подключения к MetaMask! ${error.message}`);
    return null;
  }
};

export const getSigner = () => {
  const provider = etherConfig();
  return provider ? provider.getSigner() : null;
};
