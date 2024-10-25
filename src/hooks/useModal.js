import { useState } from "react";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useAccount } from "wagmi";
import useWalletStore from "../store/useWalletStore";

export default function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSelect, setActiveSelect] = useState(null);
  const { setError } = useWalletStore();
  const { isConnected: walletIsConnected } = useAccount();

  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      const errorMessage =
        "Ethereum wallet not found. Please install a wallet like MetaMask.";

      setError("No Ethereum wallet found");
      toast.error(errorMessage);
      return false;
    }

    if (!walletIsConnected) {
      // Проверяем, подключен ли кошелек
      const errorMessage = "Please connect your wallet first.";
      setError("Wallet not connected");
      toast.error(errorMessage);
      return false;
    }

    return true;
  };
  const handleOpenModal = async (type) => {
    const isWalletConnected = await checkWalletConnection(); // Изменяем имя переменной для большей ясности
    if (!isWalletConnected) {
      return;
    }

    setActiveSelect(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    activeSelect,
    handleOpenModal,
    handleCloseModal
  };
}
