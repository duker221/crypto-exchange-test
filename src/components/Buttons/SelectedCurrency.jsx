import React from "react";

export default function SelectedCurrency({
  amount,
  selectedToken,
  logoPath,
  onOpenModal,
  onAmountChange,
  readOnly // Добавьте этот пропс
}) {
  return (
    <div
      className={`w-[452px] h-[88px] rounded-custom-20 px-[30px] py-4 flex items-center justify-between border-2 border-black-500 box-border bg-sand-500`}
    >
      <input
        type="number"
        value={amount}
        onChange={(e) => !readOnly && onAmountChange(e.target.value)} // Не вызывать onAmountChange, если readOnly
        className="w-auto max-w-36 text-[22px] leading-[26.5px] text-black-500 font-bold mr-4 text-[32px] bg-transparent focus:outline-none"
        placeholder="0"
        readOnly={readOnly} // Устанавливаем атрибут readOnly
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenModal}
          className="flex items-center bg-cream-500 py-[4px] px-3 gap-2 rounded-[10px] w-auto h-auto"
        >
          <span className="text-[22px] leading-[26.5px] text-[28px] font-medium">
            {selectedToken}
          </span>
          <img src={logoPath} alt={selectedToken} className="w-9 h-9" />
          <img src="ArrowDown.svg" alt="arrow down" className="" />
        </button>
      </div>
    </div>
  );
}
