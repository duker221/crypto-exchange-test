import React from "react";
import SelectCurrency from "../Buttons/SelectCurrency";

export default function TokenModal({ onSelect, onClose, tokens }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4">
      <div className="bg-cream-500 w-[412px] p-[30px] rounded-[40px] border-[4px] border-black-500">
        {tokens.map((token) => (
          <SelectCurrency
            key={token.name}
            currencyName={token.name}
            logoPath={token.iconUrl}
            onSelect={() => onSelect(token)}
          />
        ))}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 h-[71px] py-3 bg-brown-500 text-cream-500 rounded-2xl text-[26px]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
