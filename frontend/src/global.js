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
            <Link to="/profile" className="global-btn">
                <div className="toolbar-btn">
                    <BiSolidWallet size={30} style={{paddingBottom: "5px"}}/>
                    Profile    
                </div>
            </Link> {/* Adjusted to relative path */}
            <Link to="/paytoqr" className="global-btn">
                <div className="toolbar-btn">
                    <BsQrCodeScan size={30} style={{paddingBottom: "5px"}}/>
                    Pay To QR
                </div>
            </Link> {/* Adjusted to relative path */}
            <Link to="/merchant" className="global-btn">
                <div className="toolbar-btn">
                    <GiReceiveMoney size={30} style={{paddingBottom: "5px"}}/>
                    Merchant   
                </div>
            </Link> {/* Adjusted to relative path */}
        </div>
    )
}
