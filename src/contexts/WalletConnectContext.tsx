import React, { createContext, useState, useEffect, useContext } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { SolanaChains } from "../utils/helpers";

type WalletConnectContextType = {
  provider: UniversalProvider | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

const defaultContextValue: WalletConnectContextType = {
  provider: null,
  isConnected: false,
  connect: async () => {},
  disconnect: async () => {},
};
const WalletConnectContext =
  createContext<WalletConnectContextType>(defaultContextValue);
const projectId = import.meta.env.VITE_PROJECT_ID;
const events: string[] = [];
const methods = ["solana_signMessage"];
const chains = [`solana:${SolanaChains.MainnetBeta}`];
const modal = new WalletConnectModal({
  projectId,
  chains,
});

export const WalletConnectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [provider, setProvider] = useState<UniversalProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      const session = localStorage.getItem("walletconnect");
      const provider = await UniversalProvider.init({
        logger: "error",
        projectId: projectId,
        metadata: {
          name: "WalletConnect x Solana",
          description:
            "Solana integration with WalletConnect's Universal Provider",
          url: "https://walletconnect.com/",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      });

      if (session) {
        provider.session = JSON.parse(session);
      }

      setIsConnected(!!session);

      provider.on("display_uri", async (uri: string) => {
        console.log("uri", uri);
        await modal.openModal({
          uri,
        });
      });

      setProvider(provider);
    };

    initProvider();
  }, []);

  const connect = async () => {
    if (provider) {
      try {
        await provider.connect({
          namespaces: {
            solana: {
              methods,
              chains,
              events,
            },
          },
        });
        setIsConnected(true);
        localStorage.setItem("walletconnect", JSON.stringify(provider.session));
      } catch {
        console.log("Something went wrong, request cancelled");
      }
      modal.closeModal();
    }
  };
  const disconnect = async () => {
    if (provider) {
      await provider.disconnect();
      setIsConnected(false);
      localStorage.removeItem("walletconnect");
    }
  };
  return (
    <WalletConnectContext.Provider
      value={{ provider, isConnected, connect, disconnect }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = () => useContext(WalletConnectContext);
