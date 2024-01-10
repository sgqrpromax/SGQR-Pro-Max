import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { QrReader } from 'react-qr-reader';
import "./paytoqr.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";
import { ERC20_ABI} from "../../contracts/erc20";
import {CONTRACT_ADDRESS } from "../../contracts/config";
import { FaCamera } from "react-icons/fa";
import { LuRefreshCw } from "react-icons/lu";
import ourIcon from '../../images/logo-white-no-bg.png';

export default function PayToQR2(props) {
    const [extractedData, setExtractedData] = useState(''); // State for the extracted UEN
    const [retrievedName, setRetrievedName] = useState(''); // State to store the name retrieved from the blockchain
    const [amount, setAmount] = useState(''); // State to store the amount to send
    const [approvalAmount, setApprovalAmount] = useState(''); // State for storing the approval amount
    const [isPopup, setIsPopup] = useState(false) // toggle popup on and off
    const [isDoneScanning, setIsDoneScanning] = useState(false) // toggle confirmation page on and off
    // const [isLoadingTransaction, setIsLoadingTransaction] = useState(false)
    const [allowance, setAllowance] = useState(0)
    const [transactions, setTransactions] = useState(() => {
        // Get transactions from local storage if available
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
      });

    useEffect(() => {
        // Save transactions to local storage
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);  

    
    const contract = props.contract; // Assume the contract prop is passed correctly
    const address = props.address; // The user's address should also be passed in props
    
    useEffect(() => {
        //console.log(props)
        const fetchAllowance = async () => {
            try {
                // Assuming contract is available in your component's context
                const allowanceValue = await contract.methods.allowance(props.address, CONTRACT_ADDRESS).call();
                setAllowance(allowanceValue);
                console.log('useeffect triggered, allowance value: ', allowanceValue)
            } catch (error) {
                console.error("Error fetching allowance:", error);
                // Handle the error appropriately
            }
        };

        fetchAllowance();
    }, [props.address, allowance])

    const retrieveSGDkTokenAddress = async () => {
        try {
            const tokenAddress = await contract.methods.token_address().call();
            console.log(`SGDk Token Address: ${tokenAddress}`);
            return tokenAddress;
        } catch (error) {
            console.error("Error retrieving SGDk token address:", error);
        }
    };

    const approveSGDkTokenSpend = async () => {
        if (!approvalAmount) {
            console.error("Please enter an amount to approve.");
            return;
        }

        const tokenAddress = await retrieveSGDkTokenAddress(); // Retrieve token address first
        const SGDkTokenContract = new props.web3.eth.Contract(ERC20_ABI, tokenAddress); // Use ERC20_ABI for SGDk token contract
        try {
            await SGDkTokenContract.methods.approve(CONTRACT_ADDRESS, approvalAmount*1000000).send({ from: address });
            console.log(`Approved the contract to spend ${approvalAmount} SGDk tokens.`);

            const allowanceValue = await contract.methods.allowance(address, CONTRACT_ADDRESS).call();
            console.log('New allowance balance: ', allowanceValue)
            setAllowance(allowanceValue);
            setApprovalAmount('')
        } catch (error) {
            console.error("Error approving the contract to spend SGDk tokens:", error);
        }
    };
    
    // Function to check allowance and send SGDk tokens to the UEN
    const sendSGDk = async () => {
        console.log("Contract:", contract);
        console.log("UEN (extractedData):", extractedData);
        console.log("Amount to send:", amount*1000000);
        console.log("User address:", address);

        if (contract && extractedData && amount && address) { 
            console.log("Sending SGDk:", amount, "to UEN:", extractedData);
            try {
                // Ensure you have enough allowance to perform the transfer
                const allowance = await contract.methods.allowance(address, CONTRACT_ADDRESS).call({ from: address });
                console.log("Allowance:", allowance);
                console.log("Amount:", amount);
                if (Number(allowance) < Number(amount)) {
                    // Show an alert if the allowance is not enough
                    console.log("Alerting lack of allowance:");
                    alert("Your allowance is less than the amount you want to send. Please raise your allowance first.");
                    return; // Exit the function to prevent further execution
                } 
                else {
                    // setIsLoadingTransaction(true)
                    // console.log('isLoading is set to true')
                    const receipt = await contract.methods.send_token_to_uen(extractedData, amount*1000000).send({ from: address });
                    if (receipt.status) {
                        // setIsLoadingTransaction(false)
                        // console.log('isLoading is set to false')
                        setExtractedData('')
                        setAmount('')
                        alert('Transaction successful')
                        setIsPopup(false)
                        setIsDoneScanning(false)
                    }
                    else {
                        // setIsLoadingTransaction(false)
                        console.log('isLoading is set to false')
                        alert('Transaction unsuccessful, please try again.')
                        return 
                    }
                }
                const new_allowance = await contract.methods.allowance(address, CONTRACT_ADDRESS).call({ from: address });
                console.log("New Allowance:", new_allowance);
                setAllowance(new_allowance)
                // After confirming the allowance, send the tokens
                // Note: Adjust this method call to match your contract's send method if it's different than 'transfer'
                //const transactionReceipt = await contract.methods.transfer(extractedData, amountInWei).send({ from: address });

                //submitUEN();

                setTransactions(prevTransactions => [
                    ...prevTransactions,
                    {
                        senderAddress: address,
                        recipientUEN: extractedData,
                        recipientName: retrievedName,
                        amountTransferred: amount
                    }
                ]);
                console.log("SGDk sent successfully to UEN:", extractedData);
            } catch (error) {
                console.error("Error sending SGDk:", error);
            }
        } else {
            console.error("Missing contract, UEN, amount data, or user address");
            alert( "Missing UEN or amount data in the input fields. Or your user address was not captured by our system properly, try again or refresh the page!")
        }
    };

    const handleScan = (result) => {
        function isLetter(str) {
            return str.length === 1 && str.match(/[a-z]/i);
          }

        if (result) {
            const { text } = result; // Destructuring to get the text directly from the result
            console.log("Scanned QR Data lol:", text);
            setIsDoneScanning(true)
    
            // Define a pattern to match the known starting strings and the following characters
            const pattern = /PAYNOW01012021[023]([A-Za-z0-9]{10})/;
            const match = text.match(pattern);

            console.log("match lol:", match);
    
            if (match) {
                // Get the 8th character from the end of the matched substring
                const eigthChar = match[1][match[1].length - 2]; // Second Last character of the first captured group
                console.log("eigthChar lol:", eigthChar);
    
                if (isLetter(eigthChar)) {
                    // If the 8th character is an alphabet, it's a 9 character UEN
                    console.log("Parsed QR Data (9-character UEN):", match[1].slice(0, -1)); // Exclude the last character
                    setExtractedData(match[1].slice(0, -1)); // Set the 9-character UEN
                    submitUEN(match[1].slice(0, -1))
                } else {
                    // Else, assume it's a 10 character UEN
                    console.log("Parsed QR Data (10-character UEN):", match[1]); // Include all characters
                    setExtractedData(match[1]); // Set the 10-character UEN
                    submitUEN(match[1])
                }
            } else {
                console.log("Full QR Data:", text); // Log the full QR data
                setExtractedData(text); // Set the full QR text to the extractedData state
                submitUEN(text)
            }
        }
    };

    const handleError = (err) => {
        console.error("QR Reader Error:", err);
    }

    // Function to call get_name from the blockchain
    const submitUEN = async (givenUEN) => {
        if (contract && givenUEN) {
            console.log("Submitting UEN:", givenUEN);
            try {
                const name = await contract.methods.get_name(givenUEN).call();
                setRetrievedName(name); // Store the name in state
            } catch (error) {
                console.error("Error fetching name:", error);
                setRetrievedName(''); // Reset the name on error
            }
        }
    };

    return (
        <div className="paytoqr-background">
            <GlobalToolBar />
            <div className='form-group'>
            {/* <div style={{fontSize: '30px', marginBottom:'20px'}}>Transfer Limit</div> */}
            <div className='new-h2'>Transfer Limit</div>
            <div style={{fontSize: '60px'}}>{allowance/1000000} <span style={{fontSize: '30px'}}>SGDk</span></div>
                <div className="action">
                    <p className="action-description">Adjust your limit by approving SGDk tokens!</p>
                    <div className='withdraw-form-component'>
                        <input 
                            className='input-field'
                            type="text" 
                            value={approvalAmount} 
                            onChange={(e) => setApprovalAmount(e.target.value)} 
                            placeholder="SGDk tokens to approve" 
                        />
                    </div>
                    <button onClick={approveSGDkTokenSpend} className="merchant-btn">
                        Approve Tokens
                    </button>                        
                </div>
            </div>
            <div className='form-group'>
                <div className='new-h2'>QR Scanner</div>
                <p className="scanner-instructions">Click on the camera to begin scanning!</p>
                <FaCamera size={90} style={{cursor: 'pointer'}} onClick={() => setIsPopup(!isPopup)}/>
            </div>

            {isPopup && (
                // isLoadingTransaction
                // ?
                //     <div className='modal-background'>
                //         <div className='modal'>
                //             Loading
                //         </div>
                //     </div>
                // :
                    isDoneScanning 
                    ? 
                        <div className='modal-background' onClick={() => {
                            setIsPopup(false)
                            setIsDoneScanning(false)
                            }}>
                            <div className='modal' onClick={(e) => e.stopPropagation()}>
                                <img src={ourIcon} style={{width: '350px'}}/>
                                {retrievedName ? 
                                    <div className="retrieved-name-display">
                                        <p>Retrieved Name: {retrievedName}</p>
                                    </div>
                                    : 
                                    <div>
                                        <p>Error: Entity was not found</p>
                                    </div>
                                }
                                <div className='withdraw-form-component'>
                                    <span style={{marginRight: '10px'}}>UEN:</span> 
                                    <input 
                                        type="text" 
                                        value={extractedData}
                                        onChange={(e) => setExtractedData(e.target.value)}
                                        className='uen-input'
                                    />
                                    <LuRefreshCw onClick={() => submitUEN(extractedData)} size={20} style={{cursor: 'pointer'}}/>
                                </div>

                                <div className="transaction-amount-container" >
                                    <input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className='transaction-input'
                                        placeholder='0.00'
                                    />
                                    <span style={{fontSize: '20px', marginLeft: '10px'}}>SGDk</span>
                                </div>
                                <button onClick={sendSGDk} className="send-token-btn">
                                    Send Tokens
                                </button>
                            </div>
                        </div>
                    : 
                        <div className='modal-background' onClick={() => {
                            setIsPopup(false)
                            setIsDoneScanning(false)
                            }}>
                            <div className='modal' onClick={(e) => e.stopPropagation()}>
                                <div className="qr-scanner-container">
                                    <QrReader
                                        onError={handleError}
                                        onResult={handleScan}
                                        className="qrScanner"
                                    />
                                </div>
                                Scanning...
                            </div>
                        </div>
            )}

            <div className='new-h2'>Transaction History</div>
            <div className="transaction-history-table">
                <table>
                <thead>
                    <tr>
                    <th>Sender</th>
                    <th>Entity Name</th>
                    <th>UEN</th>
                    <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                    <tr key={index}>
                        <td>{transaction.senderAddress}</td>
                        <td className='entity-name'>{transaction.recipientName}</td>
                        <td>{transaction.recipientUEN}</td>
                        <td>{transaction.amountTransferred}</td>
                    </tr>
                    ))}
                </tbody>

                
                </table>
            </div>
                
        </div>
    );
}


