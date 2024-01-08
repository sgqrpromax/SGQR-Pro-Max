import { Link } from "react-router-dom";
import { BsQrCodeScan } from "react-icons/bs";
import { BiSolidWallet } from "react-icons/bi";
import { GiReceiveMoney } from "react-icons/gi";

export const BackgroundCovered = '#282c34';
export const BackgroundUncovered = 'white';
export const MessageColorCovered = 'white';
export const MessageColorUncovered = 'black';

export const HighlightColor = 'yellow';
export const LinkColor = '#61dafb';
export const TopbarColor = '#61dafb';

export const GlobalToolBar = () => {
    return (
        <div className = "global-toolbar">
            {/* <Link to="/" className="global-btn">SGQR+</Link> Adjusted to root path */}
            <Link to="/profile" className="global-btn">
                <BiSolidWallet size={30} style={{paddingBottom: "5px"}}/>
                Profile    
            </Link> {/* Adjusted to relative path */}
            <Link to="/paytoqr" className="global-btn">
                <BsQrCodeScan size={30} style={{paddingBottom: "5px"}}/>
                Pay To QR
            </Link> {/* Adjusted to relative path */}
            <Link to="/merchant" className="global-btn">
                <GiReceiveMoney size={30} style={{paddingBottom: "5px"}}/>
                Merchant   
            </Link> {/* Adjusted to relative path */}
        </div>
    )
}
