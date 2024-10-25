import React from "react";

export default function SuccessScreen({
  receivedTokens,
  receivedAmount,
  closeFinalScreen,
  swapError,
  errorMessage
}) {
  return (
    <div className={`flex flex-col items-center `}>
      <h1 className="font-bold text-4xl text-center font-firs mb-4">
        {swapError ? "Failed!" : "Success!"}
      </h1>
      <img
        src={`${process.env.PUBLIC_URL}/${swapError ? "swapError.png" : "successSwap.png"}`}
        alt=""
        className="w-auto max-w-[250px] object-contain h-auto"
      />
      <p
        className={`font-firs font-medium text-[32px] text-center ${swapError ? "text-error-500" : ""}`}
      >
        {swapError ? `Reason: ${errorMessage}` : "You received "}
      </p>

      {!swapError && receivedTokens && (
        <div className="flex text-center gap-2 justify-center items-center">
          <span className="font-firs font-medium text-[32px]">
            {receivedAmount}
          </span>
          <img
            src={`${receivedTokens.iconUrl}`}
            alt=""
            className="max-w-[36px] max-h-[36px]"
          />
        </div>
      )}

      <button
        type="button"
        className="w-full h-auto max-h-[71px] py-4 text-[26px] bg-brown-500 text-white rounded-2xl mt-4 font-medium text-center"
        onClick={closeFinalScreen}
      >
        Close
      </button>
    </div>
  );
}
