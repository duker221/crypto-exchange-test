import React from "react";

export default function SelectCurrency({ currencyName, logoPath, onSelect }) {
  return (
    <button
      type="button"
      className="w-[344px] h-[96px] rounded-[20px] px-[20px] py-[16px] border-[2px] border-black-500 flex justify-between items-center mb-4 box-border"
      onClick={onSelect}
    >
      <span className="font-medium text-[26px] leading-[33.6px] text-left">
        {currencyName}
      </span>
      <img src={logoPath} alt={`${currencyName} icon`} className="w-8 h-8" />
    </button>
  );
}
