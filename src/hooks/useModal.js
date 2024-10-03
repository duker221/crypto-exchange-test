import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useWalletStore from "../store/useWalletStore";

export default function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSelect, setActiveSelect] = useState(null);
  const { setError } = useWalletStore();

  const checkWalletConnection = async () => {
    if (!window.ethereum) {
      const errorMessage =
        "Ethereum wallet not found. Please install a wallet like MetaMask.";

      setError("No Ethereum wallet found");
      toast.error(errorMessage);
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });

      if (accounts.length === 0) {
        const errorMessage = "Wallet is not connected.";
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = "Ошибка при получении аккаунтов.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const handleOpenModal = async (type) => {
    const isConnected = await checkWalletConnection();
    if (!isConnected) {
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
