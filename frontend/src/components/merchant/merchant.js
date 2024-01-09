import React, { useRef, useState } from 'react';
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

    const payeeAddressRef = useRef('')
    const transferAmountRef = useRef('')
    const uenBalanceRef = useRef('')

    const handleTransfer = async (event) => {
        event.preventDefault();
        setPayeeAddress(payeeAddressRef.current.value)
        setTransferAmount(transferAmountRef.current.value)
        const payeeAddressTmp = payeeAddressRef.current.value
        const transferAmountTmp = transferAmountRef.current.value
        try {
            // No need to convert amount as Zeenus uses its own denomination
            const success = await contract.methods.transfer(payeeAddressTmp, transferAmountTmp).send({ from: payeeAddress });
            if (success) {
                alert("Transfer successful!")
            }

            if (payeeAddressRef.current) {
                payeeAddressRef.current.value = '';
            }
    
            if (transferAmountRef.current) {
                transferAmountRef.current.value = '';
            }
        } catch (error) {
            console.error("Transfer failed:", error);
            alert("Transfer failed!")
        }
    };

    const checkUENBalance = async (event) => {
        event.preventDefault();
        setBalanceUEN(uenBalanceRef.current.value)
        const balanceUENTmp = uenBalanceRef.current.value
        try {
            const balance = await contract.methods.balance_of_uen(balanceUENTmp).call();
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
                    <h2 style={{margin: '20px'}}>Merchant Dashboard</h2>
                    
                    {/* Form for transferring Zeenus tokens */}
                    <form onSubmit={handleTransfer} className="form-group" style={{marginBottom: '40px'}}>
                        <div style={{fontSize: '30px', marginBottom:'20px'}}>Withdrawal</div>
                        <div className='withdraw-form-component'>
                            <div style={{marginRight: "10px"}}>Enter Payee Address: </div>
                            <input
                                className='input-field'
                                type="text"
                                ref={payeeAddressRef}
                                placeholder="e.g. 0x12345678"
                            />
                        </div>
                        <div className='withdraw-form-component'>
                            <div style={{marginRight: "10px"}}>Enter Amount: </div>
                            <input
                                className='input-field'
                                type="text"
                                ref={transferAmountRef}
                                placeholder="e.g. 0.25 ZEENUS"
                            />
                        </div>
                        <button type="submit" className='merchant-btn'>Transfer Now</button>
                    </form>

                    {/* Result of transfer attempt
                    {transferResult && <p>{transferResult}</p>} */}

                    {/* Form for checking UEN balance */}
                    <form onSubmit={checkUENBalance} className="form-group">
                        <div style={{fontSize: '30px', marginBottom:'20px'}}>Check Balance</div>
                        <div className='withdraw-form-component'>
                            <input
                                className='input-field'
                                type="text"
                                ref={uenBalanceRef}
                                placeholder="Enter UEN"
                            />
                        </div>
                        {uenBalance !== '' && (
                            <div className="balance-display">
                                <p>Balance for UEN {balanceUEN}: {uenBalance}</p>
                            </div>
                        )}
                        <button type="submit" className='merchant-btn'>Check Balance</button>
                    </form>

                </div>

                <GlobalToolBar/>
            </div>
        );
    };

    return (
        <div>
            {isConnected ? <MerchantPage /> : <Navigate to='/' />}
        </div>
    );
}
