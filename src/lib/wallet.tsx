import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193;
    /** Set this to true inside noir.js so FoxFi never runs its fallback connect. */
    __noirReady?: boolean;
    /** Call from noir.js after your modal connects: window.foxfiSetWallet(address, "0x1") */
    foxfiSetWallet?: (address: string, chainId?: string) => void;
    /** Call from noir.js when your modal disconnects. */
    foxfiClearWallet?: () => void;
  }
}

const STORAGE_KEY = "foxx.wallet";

const CHAINS: Record<string, string> = {
  "0x1": "Ethereum",
  "0x89": "Polygon",
  "0xa": "Optimism",
  "0xa4b1": "Arbitrum",
  "0x2105": "Base",
};

function chainLabel(chainId?: string | null) {
  if (!chainId) return "Ethereum";
  return CHAINS[chainId] ?? `Chain ${parseInt(chainId, 16) || chainId}`;
}

type WalletState = {
  address: string | null;
  chain: string;
  connecting: boolean;
  error: string | null;
  isDemo: boolean;
};

type WalletContextValue = WalletState & {
  connect: () => Promise<void>;
  disconnect: () => void;
  short: string | null;
  hasInjected: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);


export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chain: "Ethereum",
    connecting: false,
    error: null,
    isDemo: false,
  });
  const [hasInjected, setHasInjected] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback((address: string, chain: string, isDemo: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, chain, isDemo }));
    } catch {
      /* ignore */
    }
  }, []);

  const adopt = useCallback(
    (address: string, chainId?: string | null, isDemo = false) => {
      const chain = chainLabel(chainId);
      persist(address, chain, isDemo);
      setState({ address, chain, connecting: false, error: null, isDemo });
    },
    [persist],
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ address: null, chain: "Ethereum", connecting: false, error: null, isDemo: false });
  }, []);

  // Restore any previous session.
  useEffect(() => {
    setHasInjected(typeof window !== "undefined" && !!window.ethereum);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { address: string; chain: string; isDemo: boolean };
        if (saved?.address) setState((s) => ({ ...s, ...saved }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Bridge for an external wallet modal (noir.js): globals + custom events +
  // plain EIP-1193 account/chain changes. Any of these updates the whole site.
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.foxfiSetWallet = (address: string, chainId?: string) => adopt(address, chainId);
    window.foxfiClearWallet = () => clear();

    const onConnected = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { address?: string; account?: string; chainId?: string }
        | undefined;
      const address = detail?.address ?? detail?.account;
      if (address) adopt(address, detail?.chainId);
    };
    const onDisconnected = () => clear();
    window.addEventListener("noir:connected", onConnected as EventListener);
    window.addEventListener("wallet:connected", onConnected as EventListener);
    window.addEventListener("noir:disconnected", onDisconnected);
    window.addEventListener("wallet:disconnected", onDisconnected);

    // Passive listeners only — FoxFi never asks a wallet for accounts itself.
    const provider = window.ethereum;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      const address = accounts?.[0];
      if (address) {
        if (stateRef.current.address) adopt(address, null);
      } else if (stateRef.current.address) {
        clear();
      }
    };
    const onChain = (...args: unknown[]) => {
      const chainId = args[0] as string | undefined;
      setState((s) => (s.address ? { ...s, chain: chainLabel(chainId) } : s));
    };

    provider?.on?.("accountsChanged", onAccounts);
    provider?.on?.("chainChanged", onChain);

    return () => {
      delete window.foxfiSetWallet;
      delete window.foxfiClearWallet;
      window.removeEventListener("noir:connected", onConnected as EventListener);
      window.removeEventListener("wallet:connected", onConnected as EventListener);
      window.removeEventListener("noir:disconnected", onDisconnected);
      window.removeEventListener("wallet:disconnected", onDisconnected);
      provider?.removeListener?.("accountsChanged", onAccounts);
      provider?.removeListener?.("chainChanged", onChain);
    };
  }, [adopt, clear]);

  // noir.js owns the modal entirely; FoxFi never triggers a wallet prompt.
  const connect = useCallback(async () => {}, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      connect,
      disconnect: clear,
      short: state.address ? `${state.address.slice(0, 6)}…${state.address.slice(-4)}` : null,
      hasInjected,
    }),
    [state, connect, clear, hasInjected],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
