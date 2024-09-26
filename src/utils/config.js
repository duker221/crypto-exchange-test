import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum } from "wagmi/chains";
import { http } from "wagmi";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "0a0cdc35e17715564583df0d3a0706ae",
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http()
  }
});

export default config;
