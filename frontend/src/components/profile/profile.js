import React, { useEffect } from 'react';
import { Navigate } from "react-router-dom";
import "./profile.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";
import METAMASK from '../../images/METAMASK.png';
import { ERC20_ABI} from "../../contracts/erc20";

export default function Profile(props){

    // Fetch Zeenus balance when the component mounts or when props.address/props.isConnected changes
    useEffect(() => {
        const fetchZeenusBalance = async () => {
            if (props.isConnected && props.address) {
                try {
                    const tokenAddress = await props.contract.methods.token_address().call();
                    const zeenusTokenContract = new props.web3.eth.Contract(ERC20_ABI, tokenAddress);
                    const zeenusBalance = await zeenusTokenContract.methods.balanceOf(props.address).call();
                    props.setBalance(zeenusBalance); // Update balance with fetched balance
                } catch (error) {
                    console.error("Error fetching ZEENUS balance:", error);
                    props.setBalance(null); // Set balance to null or handle error state as appropriate
                }
            }
        };

        fetchZeenusBalance();
    }, [props.address, props.isConnected, props.contract, props.web3, props.setBalance]);

    // Function component for profile page content
    const ProfilePage = () => {
        return (
            
        <div className = "profile-background">
            <div className = "profile">
                <img src = {METAMASK} alt = "logo" height = "100%"/>
                <div className = "profile-account">
                    <p>
                        <b>Profile details</b>
                    </p>
                    <hr color = "black"/>
                    <p>
                        Address:&nbsp;
                        <span className = "global-message">{props.address}</span>
                        <br/>
                        Network:&nbsp;
                        <span className = "global-message">{props.networkType}</span>
                        <br/>
                        Balance:&nbsp;
                        <span className = "global-message">{props.balance}</span>
                        &nbsp;ZEENUS
                    </p>
                </div>
            </div>

            
            <GlobalToolBar/>
            
        </div>
            
        )
    }    
    // Main component conditional rendering
    return (
        <div>
            {props.isConnected ? <ProfilePage /> : <Navigate to='/InterfaceDemo' />}
        </div>
    );
}
