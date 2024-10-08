import React from "react";

export default function TokenSelect({ selectedToken, onOpenModal }) {
  return (
    <button
      type="button"
      className="w-full max-w-[452px] h-[88px] flex items-center justify-between rounded-custom-20 px-4 py-4 border-2 border-black-500 box-border cursor-pointer bg-sand-500 hover:bg-sand-600 transition-colors duration-200"
      onClick={onOpenModal}
    >
      <p className="text-[22.5px] font-medium">
        {selectedToken || "Select asset"}
      </p>

      <span className="ml-2">
        <img src="ArrowDown.svg" alt="Arrow down" className="w-5 h-5" />
      </span>
    </button>
  );
}
