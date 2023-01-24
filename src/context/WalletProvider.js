import React from 'react';
import { providers } from "ethers";
import Web3 from "web3";
import { textMasking } from '../helper/utils';

export const WalletContext = React.createContext(null);
export const useWallet = () => React.useContext(WalletContext);

export function withWallet(Component) {
    const WalletComponent = (props) => (
        <WalletContext.Consumer>
            {(contexts) => <Component {...props} {...contexts} />}
        </WalletContext.Consumer>
    );
    return WalletComponent;
}

export const EthereumEvents = Object.freeze({
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CHAIN_CHANGED: 'chainChanged',
    ACCOUNTS_CHANGED: 'accountsChanged',
});

export const getNormalizeAddress = (accounts) => {
    return accounts[0] ? accounts[0].toLowerCase() : null
}

const WalletProvider = React.memo((args) => {
    const [type, setType] = React.useState('');
    const [chainId, setChainId] = React.useState(null);
    const [account, setAccount] = React.useState(null);
    const [web3, setWeb3] = React.useState(null);
    const [isAuthenticated, setAuthenticated] = React.useState(false);
    const [appLoading, setAppLoading] = React.useState(false);

    //console.log({ chainId, account, web3, isAuthenticated });

    React.useEffect(() => {
        connectEagerly();
        return () => {
            const provider = getProvider();
            unsubscribeToEvents(provider);
        }
    }, []);

    const subscribeToEvents = (provider) => {
        if (provider && provider.on) {
            provider.on(EthereumEvents.CHAIN_CHANGED, handleChainChanged);
            provider.on(EthereumEvents.ACCOUNTS_CHANGED, handleAccountsChanged);
            provider.on(EthereumEvents.CONNECT, handleConnect);
            provider.on(EthereumEvents.DISCONNECT, handleDisconnect);
        }
    }

    const unsubscribeToEvents = (provider) => {
        if (provider && provider.removeListener) {
            provider.removeListener(EthereumEvents.CHAIN_CHANGED, handleChainChanged);
            provider.removeListener(EthereumEvents.ACCOUNTS_CHANGED, handleAccountsChanged);
            provider.removeListener(EthereumEvents.CONNECT, handleConnect);
            provider.removeListener(EthereumEvents.DISCONNECT, handleDisconnect);
        }
    }

    const connectEagerly = async () => {
        await connectWallet();
    }

    const getProvider = () => {
        if (window.ethereum) {
            const provider = new providers.Web3Provider(window.ethereum, "any");
            setWeb3(provider);
            return window.ethereum;
        } else {
            const provider = new providers.Web3Provider(window.currentProvider, "any");
            setWeb3(provider);
            return provider;
        }
    }

    const getAccounts = async (provider) => {
        if (provider) {
            const [accounts, chainId] = await Promise.all([
                provider.request({
                    method: 'eth_requestAccounts',
                }),
                provider.request({ method: 'eth_chainId' }),
            ]);
            return [accounts, chainId];
        }
        return false;
    }

    const getChainId = () => {
        return chainId !== null ? Web3.utils.hexToNumber(chainId) : chainId;
    }

    const getMaskedAccountAddress = () => {
        return account !== null ? textMasking(account, '.', 4, 5, 4) : account;
    }

    const connectWallet = async () => {
        let connected = false;
        try {
            const provider = getProvider();

            const [accounts, chainId] = await getAccounts(provider);
            if (accounts && chainId) {
                setAppLoading(true);
                const account = getNormalizeAddress(accounts);
                setAccount(account);
                setChainId(chainId);
                setAuthenticated(true);
                setType('METAMASK');
                connected = true;
                subscribeToEvents(provider)
            }
        } catch (e) {
            connected = false;
            console.error({
                connectWalletError: e
            });
        } finally {
            setAppLoading(false);
        }

        return connected;
    }

    const disconnectWallet = () => {
        try {
            setAccount(null);
            setChainId(null);
            setAuthenticated(false);
            setWeb3(null);
        } catch (e) {
            console.error({
                disconnectWalletError: e
            });
        }
    }

    const handleAccountsChanged = (accounts) => {
        const account = getNormalizeAddress(accounts);
        setAccount(account);
        if(account === null){
            setChainId(null);
            setAuthenticated(false);
            setWeb3(null)
        }
        console.log("[account changes]: ", getNormalizeAddress(accounts))
    }

    const handleChainChanged = (chainId) => {
        getProvider();
        setChainId(chainId);
        console.log("[chainId changes]: ", chainId)
    }

    const handleConnect = () => {
        setAuthenticated(true);
        //connectWallet();
        console.log("[connected]")
    }

    const handleDisconnect = () => {
        console.log("[disconnected]")
        disconnectWallet();
    }

    return (
        <WalletContext.Provider
            value={{
                type: type,
                isAuthenticated,
                appLoading,
                chainId: chainId,
                chainIdNumber: getChainId(),
                account: account,
                maskedAccount: getMaskedAccountAddress(),
                web3: web3,
                disconnectWallet,
                connectWallet,
            }}
        >
            {args.children}
        </WalletContext.Provider>
    )
});

export default WalletProvider;