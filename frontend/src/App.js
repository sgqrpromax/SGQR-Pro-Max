import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {useNavigate} from "react-router-dom";
import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import Web3 from "web3";

import './App.css';
import Login from "./components/login/login";
import Profile from "./components/profile/profile";
import PayToQR from "./components/paytoqr/paytoqr";
import Merchant from "./components/merchant/merchant";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contracts/config";
import { ERC20_ABI} from "./contracts/erc20";

export default function App() {
    const [haveMetamask, setHaveMetamask] = useState(true);     // check if the browser has MetaMask installed. 
    const [address, setAddress] = useState(null);               // address of connected MetaMask account. 
    const [network, setNetwork] = useState(null);               // network the account is using. 
    const [balance, setBalance] = useState(0);                  // balance of connected MetaMask account. 
    const [isConnected, setIsConnected] = useState(false);      // check if is connected to MetaMask account. 

    const navigate = useNavigate();
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    useEffect(() => {
        const { ethereum } = window;
        const checkMetamaskAvailability = async () => {
            if (!ethereum) {
                setHaveMetamask(false);
            }
            setHaveMetamask(true);
        };
        checkMetamaskAvailability();
    }, []);

////// connect to MetaMask. 
    const connectWallet = async () => {         // function that connect to METAMASK account, activated when clicking on 'connect'. 
        try {
            if (!ethereum){
                setHaveMetamask(false);
            }
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });
            const chainId = await ethereum.request({
                method: 'eth_chainId',
            });

            let balanceVal = await provider.getBalance(accounts[0]);
            let bal = ethers.utils.formatEther(balanceVal);

            // Since ERC-20 tokens can have different decimals, you need to format the balance
            // If the Zeenus token has 18 decimals, you can use the following to format it
            //let formattedZeenusBalance = ethers.utils.formatUnits(zeenusBalance, 18); // Replace '18' with the actual token decimals if different

            console.log(chainId);
            if (chainId === '0x3'){
                setNetwork('Ropsten Test Network');
            }
            else if (chainId === '0x5'){
                setNetwork('Goerli Test Network');
            }
            else if (chainId === '0xaa36a7'){
                setNetwork('Sepolia Test Network');
            }
            else {
                setNetwork('Other Test Network');
            }
            setAddress(accounts[0]);
            //setBalance(bal);
            setIsConnected(true);

            navigate('/paytoqr');
        }
        catch (error){
            setIsConnected(false);
            console.error("An error occurred: ", error);
        }
    }

    useEffect(() => {
        // A function to fetch UENs which handles its own errors internally.
        const fetchZeenusBalance = async () => {
          try {
            // Assume you have the Zeenus token contract ABI and address
            const tokenAddress = await contract.methods.token_address().call();
            const zeenusTokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);

            console.log("test: ", address);

            // // Fetch the Zeenus token balance for the connected address
            const zeenusBalance = await zeenusTokenContract.methods.balanceOf(address).call();
            console.log("balance: ", zeenusBalance);

            setBalance(zeenusBalance);
          } catch (error) {
            console.error("Error fetching ZEENUS Balance:", error);
            // Handle the error state in the UI as needed...
          }
        };

        if (isConnected && ethereum) {
            fetchZeenusBalance(); // Only fetch UENs if connected and ethereum object is available
        }
      }, [isConnected, ethereum]); // Depend on isConnected and ethereum to refetch when they change



////// display functions. 
    const ProfileDisplay = () => {
        return (
            <Profile 
                web3={web3}
                contract={contract}
                isConnected={isConnected}
                address={address}
                setBalance={setBalance}
                balance={balance}
                networkType={network}
            />
        );
    };

    const PayToQRDisplay = () => {
        return (
            <PayToQR 
                web3={web3}
                isConnected = {isConnected}
                address={address}
                contract={contract}
            />
        )
    }

    const MerchantDisplay = () => {
        return (
            <Merchant 
                web3={web3}
                isConnected = {isConnected}
                address={address}
                contract={contract}
            />
        )
    }
      
    return (
        <div className="App">
          <Routes>
            <Route path="/" element={<Login isHaveMetamask={haveMetamask} connectTo={connectWallet} />} />
            <Route path="/profile" element={<ProfileDisplay />} />
            <Route path="/paytoqr" element={<PayToQRDisplay />} />
            <Route path="/merchant" element={<MerchantDisplay />} />
          </Routes>
        </div>
      );
    }

