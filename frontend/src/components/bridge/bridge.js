import React, { useRef, useState } from 'react';
import { Navigate } from "react-router-dom";
import "./bridge.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";

export default function Bridge({ contract, isConnected, web3 }) {
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
                setTransferResult('Transfer successful');
            }
        } catch (error) {
            console.error("Transfer failed:", error);
            setTransferResult('Transfer failed');
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

    const BridgePage = () => {
        return (
            <div className="merchant-background">
                <div className="merchant">
                    <h2 style={{margin: '20px'}}>Token Bridge</h2>
                    
                    {/* Form for transferring Zeenus tokens */}
                    <form onSubmit={handleTransfer} className="form-group" style={{marginBottom: '40px'}}>
                        <div style={{fontSize: '30px', marginBottom:'20px'}}>Bridge</div>
                        <div className='withdraw-form-component'>
                            <div style={{marginRight: "10px"}}>Enter Receiver Address: </div>
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
                        <button type="submit" className='merchant-btn'>Bridge Now</button>
                    </form>

                    {/* Result of transfer attempt */}
                    {transferResult && <p>{transferResult}</p>}

                </div>

                <GlobalToolBar/>
            </div>
        );
    };

    return (
        <div>
            {isConnected ? <BridgePage /> : <Navigate to='/' />}
        </div>
    );
}
