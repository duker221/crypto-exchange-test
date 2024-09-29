import { useState } from "react";

export default function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSelect, setActiveSelect] = useState(null);

  const handleOpenModal = (type) => {
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
