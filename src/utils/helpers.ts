import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import UniversalProvider from "@walletconnect/universal-provider/dist/types/UniversalProvider";
import bs58 from "bs58";
import nacl from "tweetnacl";

export enum SolanaChains {
  MainnetBeta = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  Devnet = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
}

export function verifyTransactionSignature(
  address: string,
  signature: string,
  tx: Transaction
) {
  return nacl.sign.detached.verify(
    tx.serializeMessage(),
    bs58.decode(signature),
    bs58.decode(address)
  );
}

export function verifyMessageSignature(
  address: string,
  signature: string,
  message: string
) {
  return nacl.sign.detached.verify(
    bs58.decode(message),
    bs58.decode(signature),
    bs58.decode(address)
  );
}

export const getProviderUrl = (chainId: string) => {
  return `https://rpc.walletconnect.com/v1/?chainId=${chainId}&projectId=${
    import.meta.env.VITE_PROJECT_ID
  }`;
};

export const signMessage = async (
  msg: string,
  provider: UniversalProvider,
  address: string
) => {
  const senderPublicKey = new PublicKey(address);

  const message = bs58.encode(new TextEncoder().encode(msg));

  try {
    const result = await provider!.request<{ signature: string }>({
      method: "solana_signMessage",
      params: {
        pubkey: senderPublicKey.toBase58(),
        message,
      },
    });

    const valid = verifyMessageSignature(
      senderPublicKey.toBase58(),
      result.signature,
      message
    );
    
    return {
      method: "solana_signMessage",
      address,
      valid,
      result: result.signature,
    };
    //eslint-disable-next-line
  } catch (error: any) {
    throw new Error(error);
  }
};