// hooks/useEthersSigner.ts
import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useConnectorClient } from "wagmi";

export function useEthersSigner(): JsonRpcSigner | undefined {
  const { data: client } = useConnectorClient();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  useEffect(() => {
    if (client) {
      const provider = new BrowserProvider(client);
      provider.getSigner().then(setSigner);
    }
  }, [client]);

  return signer;
}
