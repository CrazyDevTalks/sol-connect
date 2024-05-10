import { signMessage } from "./utils/helpers";
import { useWalletConnect } from "./contexts/WalletConnectContext";

const App = () => {
  const { provider, isConnected, disconnect, connect } = useWalletConnect();
  const address =
    provider?.session?.namespaces.solana?.accounts[0].split(":")[2];

  const handleSign = async () => {
    const res = await signMessage(
      `Hello RNS! This is Vadym! ${new Date().toLocaleTimeString()}`,
      provider!,
      address!
    );
    alert(`Successfully Signed! Message: Hello RNS! This is Vadym! ${new Date().toLocaleTimeString()} Signature: ${res.result}`)
  };

  return (
    <div className="App">
      {isConnected ? (
        <>
          <p>
            <b>Public Key: </b>
            {address}
          </p>
          <div className="btn-container">
            <button onClick={handleSign}>Sign</button>
            <button onClick={disconnect}>Disconnect</button>
          </div>
        </>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
};

export default App;
