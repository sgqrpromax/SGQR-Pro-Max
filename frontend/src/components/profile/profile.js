import React, { useEffect } from 'react';
import { Navigate } from "react-router-dom";
import "./profile.css";
import "../../global.css";
import { GlobalToolBar } from "../../global";
import METAMASK from '../../images/METAMASK.png';
import { ERC20_ABI} from "../../contracts/erc20";

export default function Profile(props){

    // Fetch SGDk balance when the component mounts or when props.address/props.isConnected changes
    useEffect(() => {
        const fetchSGDkBalance = async () => {
            if (props.isConnected && props.address) {
                try {
                    const tokenAddress = await props.contract.methods.token_address().call();
                    const SGDkTokenContract = new props.web3.eth.Contract(ERC20_ABI, tokenAddress);
                    const SGDkBalance = await SGDkTokenContract.methods.balanceOf(props.address).call();
                    props.setBalance(SGDkBalance); // Update balance with fetched balance
                } catch (error) {
                    console.error("Error fetching SGDk balance:", error);
                    props.setBalance(null); // Set balance to null or handle error state as appropriate
                }
            }
        };

        fetchSGDkBalance();
    }, [props.address, props.isConnected, props.contract, props.web3, props.setBalance]);

    // Function component for profile page content
    // const ProfilePage = () => {
    //     return (
    //     <div className = "profile-background">
    //         <h2>Profile</h2>
    //         <div className = "profile">
    //             <img src = {METAMASK} alt = "logo" height={200} />
    //             <div className = "profile-account">
    //                 <p>
    //                     <b>Profile details</b>
    //                 </p>
    //                 <hr color = "white"/>
    //                 {/* <p>
    //                     Address:&nbsp;
    //                     <span className = "global-message">{props.address}</span>
    //                     <br/>
    //                     Network:&nbsp;
    //                     <span className = "global-message">{props.networkType}</span>
    //                     <br/>
    //                     Balance:&nbsp;
    //                     <span className = "global-message">{props.balance}</span>
    //                     &nbsp;SGDk
    //                 </p> */}
    //                 <div className='profile-details'>
    //                     <div className='global-message'>Address: {props.address}</div>
    //                     <div className='global-message'>Network: {props.networkType}</div>
    //                     <div className='global-message'>Balance: {props.balance}</div>
    //                 </div>
    //             </div>
    //         </div>

    //         <GlobalToolBar/>
            
    //     </div>

    const ProfilePage = () => {
        return (
        <div className = "profile-background">
            <h2>Profile</h2>
            <div className = "profile">
                <div style={{fontSize: '60px'}}>{props.balance/1000000} <span style={{fontSize: '30px'}}>SGDk</span></div>
                <img src = {METAMASK} alt = "logo" height={200} />
                <div style={{wordBreak: 'break-all'}}>{props.address}</div>
                <div style={{opacity: '0.75'}}>{props.networkType}</div>
            </div>

            <GlobalToolBar/>
            
        </div>
            
        )
    }    
    // Main component conditional rendering
    return (
        <div>
            {props.isConnected ? <ProfilePage /> : <Navigate to='/' />}
        </div>
    );
}
