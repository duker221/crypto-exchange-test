import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account;
        return (
          <div
            aria-hidden={!ready ? "true" : "false"}
            style={
              !ready
                ? { opacity: 0, pointerEvents: "none", userSelect: "none" }
                : {}
            }
          >
            {connected ? (
              <button
                type="button"
                onClick={openAccountModal}
                className="bg-brown-500 text-cream-500 w-[230px] h-[56px] sm:w-auto px-6 py-4 rounded-2xl text-center font-firs text-[20px] font-medium leading-[31.2px] tracking-tighter flex items-center gap-2 "
              >
                {account.iconUrl ? (
                  <img
                    src={account.iconUrl}
                    alt="Wallet Icon"
                    className="w-8 h-8 mr-2"
                  />
                ) : (
                  <img
                    src="/MetaMaskLogo.svg"
                    alt="Default Wallet Icon"
                    className="w-[24px] h-[24px] mr-2"
                  />
                )}
                {account.displayName}
                <span className="ml-2">▼</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openConnectModal}
                className="bg-brown-500 text-cream-500 w-[234px] h-[63px] sm:w-auto px-6 py-4 rounded-2xl text-center font-firs text-[26px] font-medium leading-[31.2px] tracking-tighter box-border"
              >
                Connect wallet
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
