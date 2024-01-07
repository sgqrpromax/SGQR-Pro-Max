import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { QrReader } from 'react-qr-reader';
import "./paytoqr.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";
import { ERC20_ABI} from "../../contracts/erc20";
import {CONTRACT_ADDRESS } from "../../contracts/config";

export default function PayToQR(props) {
    const [extractedData, setExtractedData] = useState(''); // State for the extracted UEN
    const [retrievedName, setRetrievedName] = useState(''); // State to store the name retrieved from the blockchain
    const [amount, setAmount] = useState(''); // State to store the amount to send
    const [approvalAmount, setApprovalAmount] = useState(''); // State for storing the approval amount
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

    const retrieveZeenusTokenAddress = async () => {
        try {
            const tokenAddress = await contract.methods.token_address().call();
            console.log(`Zeenus Token Address: ${tokenAddress}`);
            return tokenAddress;
        } catch (error) {
            console.error("Error retrieving Zeenus token address:", error);
        }
    };

    const approveZeenusTokenSpend = async () => {
        if (!approvalAmount) {
            console.error("Please enter an amount to approve.");
            return;
        }

        const tokenAddress = await retrieveZeenusTokenAddress(); // Retrieve token address first
        const zeenusTokenContract = new props.web3.eth.Contract(ERC20_ABI, tokenAddress); // Use ERC20_ABI for Zeenus token contract
        try {
            await zeenusTokenContract.methods.approve(CONTRACT_ADDRESS, approvalAmount).send({ from: address });
            console.log(`Approved the contract to spend ${approvalAmount} Zeenus tokens.`);
        } catch (error) {
            console.error("Error approving the contract to spend Zeenus tokens:", error);
        }
    };
    
    // Function to check allowance and send Zeenus tokens to the UEN
    const sendZeenus = async () => {
        console.log("Contract:", contract);
        console.log("UEN (extractedData):", extractedData);
        console.log("Amount to send:", amount);
        console.log("User address:", address);

        if (contract && extractedData && amount && address) { 
            console.log("Sending Zeenus:", amount, "to UEN:", extractedData);
            try {
                // Ensure you have enough allowance to perform the transfer
                const allowance = await contract.methods.check_allowance(address).call({ from: address });
                console.log("Allowance:", allowance);
                console.log("Amount:", amount);
                if (Number(allowance) < Number(amount)) {
                    // Show an alert if the allowance is not enough
                    console.log("Alerting lack of allowance:");
                    alert("Your allowance is less than the amount you want to send. Please raise your allowance first.");
                    return; // Exit the function to prevent further execution
                } 
                else {
                    await contract.methods.send_tokens_to_uen(extractedData, amount).send({ from: address });
                }
                const new_allowance = await contract.methods.check_allowance(address).call({ from: address });
                console.log("New Allowance:", new_allowance);
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
                console.log("Zeenus sent successfully to UEN:", extractedData);
            } catch (error) {
                console.error("Error sending Zeenus:", error);
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
                } else {
                    // Else, assume it's a 10 character UEN
                    console.log("Parsed QR Data (10-character UEN):", match[1]); // Include all characters
                    setExtractedData(match[1]); // Set the 10-character UEN
                }
            } else {
                console.log("Full QR Data:", text); // Log the full QR data
                setExtractedData(text); // Set the full QR text to the extractedData state
            }
        }
    };
    
    const handleError = (err) => {
        console.error("QR Reader Error:", err);
    }

    // Function to call get_name from the blockchain
    const submitUEN = async () => {
        if (contract && extractedData) {
            console.log("Submitting UEN:", extractedData);
            try {
                const name = await contract.methods.get_name(extractedData).call();
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
            <h1 className="paytoqr-intro">QR Scanner for Zeenus Transactions</h1>
            <div className="paytoqr">
                <p className="scanner-instructions">Scan a QR code to start a Zeenus transaction:</p>
                {/* QR Scanner */}
                <div className="qr-scanner-container">
                    <QrReader
                        delay={100}
                        onError={handleError}
                        onResult={handleScan}
                        style={{ width: '100%', height: 'auto' }}
                        className="qrScanner"
                    />
                    <div className="qrOverlay"></div>                    
                </div>

                {/* Information and Actions */}
                <div className="actions-container">
                    <div className="action">
                        <p className="action-description">Approve a token allowance amount to enable transactions:</p>
                        <input 
                            type="text" 
                            value={approvalAmount} 
                            onChange={(e) => setApprovalAmount(e.target.value)} 
                            placeholder="Zeenus tokens to approve" 
                        />
                        <button onClick={approveZeenusTokenSpend} className="action-button">
                            Approve Tokens
                        </button>                        
                    </div>

                    <div className="action">
                        <p className="action-description">Decoded UEN from SGQR will be displayed below, alternatively UEN can be manually inputted:</p>
                        <input 
                            type="text" 
                            value={extractedData}
                            onChange={(e) => setExtractedData(e.target.value)}
                            placeholder="UEN (Unique Entity Number)" 
                        />
                        <button onClick={submitUEN} className="action-button">
                            Check Entity Name
                        </button>
                    </div>

                    {retrievedName && (
                        <div className="retrieved-name-display">
                            <p>Retrieved Name: {retrievedName}</p>
                        </div>
                    )}

                    <div className="action">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Zeenus tokens to send"
                        />
                        <button onClick={sendZeenus} className="action-button">
                            Send Tokens
                        </button>
                    </div>
                    {/* Scrollable Transactions List */}
                    <div className="transactions-list-container">
                    <h2>Transaction History</h2>
                    <div className="table-scroll">
                        <table>
                        <thead>
                            <tr>
                            <th>Sender</th>
                            <th>Recipient UEN</th>
                            <th>Entity Name</th>
                            <th>Amount Zeenus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{transaction.senderAddress}</td>
                                <td>{transaction.recipientUEN}</td>
                                <td>{transaction.recipientName}</td>
                                <td>{transaction.amountTransferred}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


