import React from "react";

export default function SelectedCurrency({
  amount,
  selectedToken,
  logoPath,
  onOpenModal,
  onAmountChange,
  readOnly,
  error
}) {
  return (
    <>
      <div
        className={`w-full max-w-[452px] h-[88px] rounded-custom-20 px-4 py-4 flex items-center justify-between border-2 border-black-500 box-border ${error ? "bg-pink-500" : "bg-sand-500"} `}
      >
        <input
          type="number"
          value={amount}
          onChange={(e) => !readOnly && onAmountChange(e.target.value)}
          className={`w-full max-w-[150px] text-[32px] leading-[26.5px] font-bold mr-4 bg-transparent focus:outline-none ${error ? "text-error-500" : "text-black-500 "}`}
          placeholder="0"
          readOnly={readOnly}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="flex items-center bg-cream-500 py-2 px-4 gap-2 pr-16 md:pr-4 rounded-[10px] flex-grow h-auto"
            aria-label={`Select ${selectedToken || "Token"}`}
          >
            <span className="text-[22px] md:text-[28px] leading-[26.5px] font-medium">
              {selectedToken || "Select asset"}
            </span>
            <img src={logoPath} alt={selectedToken} className="w-9 h-9" />
            <img
              src={`${process.env.PUBLIC_URL}/ArrowDown.svg`}
              alt="arrow down"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
      {error && (
        <p className="text-error-500 text-[22px] font-medium mt-2">
          Error: Exceeds balance
        </p>
      )}
    </>
  );
}
