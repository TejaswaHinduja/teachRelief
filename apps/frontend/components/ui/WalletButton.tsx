"use client";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletButton() {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnect = () => {
        // Connect to the first available connector (usually Injected/MetaMask)
        const connector = connectors[0];
        if (connector) {
            connect({ connector });
        }
    };

    // Truncate wallet address for display
    const truncatedAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : null;

    return (
        <Button
            onClick={isConnected ? () => disconnect() : handleConnect}
            variant={isConnected ? "outline" : "default"}
            className="gap-2"
        >
            {isConnected ? (
                <>
                    <Wallet className="h-4 w-4" />
                    {truncatedAddress}
                    <LogOut className="h-3 w-3 ml-1" />
                </>
            ) : (
                <>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </>
            )}
        </Button>
    );
}
