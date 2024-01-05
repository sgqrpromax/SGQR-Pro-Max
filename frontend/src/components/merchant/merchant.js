import React, { useState } from 'react';
import { Navigate } from "react-router-dom";
import "./merchant.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";

export default function Merchant({ contract, isConnected, web3, address }) {
    const [payeeAddress, setPayeeAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [balanceUEN, setBalanceUEN] = useState('');
    const [uenBalance, setUenBalance] = useState('');
    const [transferResult, setTransferResult] = useState('');

    const handleTransfer = async (event) => {
        event.preventDefault();
        try {
            // No need to convert amount as Zeenus uses its own denomination
            const success = await contract.methods.transfer(payeeAddress, transferAmount).send({ from: payeeAddress });
            if (success) {
                setTransferResult('Transfer successful');
            }
        } catch (error) {
            console.error("Transfer failed:", error);
            setTransferResult('Transfer failed');
        }
    };

    const checkUENBalance = async (event) => {
        event.preventDefault();
        try {
            const balance = await contract.methods.balance_of_uen(balanceUEN).call();
            setUenBalance(balance); // Assuming Zeenus uses a denomination that doesn't require conversion
        } catch (error) {
            console.error("Failed to get UEN balance:", error);
            setUenBalance('Error fetching balance');
        }
    };

    const MerchantPage = () => {
        return (
            <div className="merchant-background">
                <div className="merchant">
                    <h1>Merchant Dashboard</h1>
                    
                    {/* Form for transferring Zeenus tokens */}
                    <form onSubmit={handleTransfer} className="merchant-form">
                        <div className="form-group">
                            <label htmlFor="payeeAddress">Withdraw to Address:</label>
                            <input
                                type="text"
                                id="payeeAddress"
                                value={payeeAddress}
                                onChange={(e) => setPayeeAddress(e.target.value)}
                                placeholder="Enter payee address"
                            />
                            <input
                                type="text"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="Enter amount to transfer"
                            />
                            <button type="submit">Transfer</button>
                        </div>
                    </form>

                    {/* Result of transfer attempt */}
                    {transferResult && <p>{transferResult}</p>}

                    {/* Form for checking UEN balance */}
                    <form onSubmit={checkUENBalance} className="merchant-form">
                        <div className="form-group">
                            <label htmlFor="uenToCheck">Check Balance for your UEN:</label>
                            <input
                                type="text"
                                id="uenToCheck"
                                value={balanceUEN}
                                onChange={(e) => setBalanceUEN(e.target.value)}
                                placeholder="Enter UEN"
                            />
                            <button type="submit">Check Balance</button>
                        </div>
                    </form>

                    {/* Display the balance of a UEN */}
                    {uenBalance !== '' && (
                        <div className="balance-display">
                            <p>Balance for UEN {balanceUEN}: {uenBalance}</p>
                        </div>
                    )}

                </div>

                <GlobalToolBar/>
            </div>
        );
    };

    return (
        <div>
            {isConnected ? <MerchantPage /> : <Navigate to='/InterfaceDemo' />}
        </div>
    );
}
