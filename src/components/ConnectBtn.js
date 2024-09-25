import React from "react";

export default function ConnectBtn({ address, connectWallet }) {
  return (
    <button
      className="bg-brown-500 text-cream-500 w-[259px] h-[63px] sm:w-auto px-6 py-3 rounded-2xl text-center font-firs text-[26px] font-medium leading-[31.2px] tracking-tighter text-sm sm:text-lg md:text-xl"
      type="button"
      onClick={connectWallet}
    >
      {address ? `${address}` : "connect wallet"}
    </button>
  );
}
