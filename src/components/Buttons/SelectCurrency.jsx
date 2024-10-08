import React from "react";

export default function SelectCurrency({ currencyName, logoPath, onSelect }) {
  return (
    <button
      type="button"
      className="w-full max-w-[344px] h-[96px] rounded-[20px] px-4 py-2 border-2 border-black-500 flex justify-between items-center mb-4 box-border hover:bg-sand-500 transition-colors duration-200"
      onClick={onSelect}
      aria-label={`Select ${currencyName}`}
      title={`Select ${currencyName}`}
    >
      <span className="font-medium text-[26px] leading-[33.6px] text-left">
        {currencyName}
      </span>
      <img src={logoPath} alt={`${currencyName} icon`} className="w-8 h-8" />
    </button>
  );
}
