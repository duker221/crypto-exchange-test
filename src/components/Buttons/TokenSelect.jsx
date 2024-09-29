import React from "react";

export default function TokenSelect({ selectedToken, onOpenModal }) {
  return (
    <button
      type="button"
      className="w-[452px] h-[88px] justify-between rounded-custom-20 px-[30px] py-4 py-4 flex items-center justify-between border-2 border-black-500 box-border cursor-pointer"
      onClick={onOpenModal}
    >
      <p className="text-[22.5px] font-medium">
        {selectedToken || "Select asset"}
      </p>

      <span className="ml-2">
        <img src="ArrowDown.svg" alt="" />
      </span>
    </button>
  );
}
