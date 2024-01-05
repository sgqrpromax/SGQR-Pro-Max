import { Link } from "react-router-dom";

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
            <Link to="/" className="global-btn">SGQR+</Link> {/* Adjusted to root path */}
            &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
            <Link to="/profile" className="global-btn">Profile</Link> {/* Adjusted to relative path */}
            &nbsp;&nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
            <Link to="/paytoqr" className="global-btn">Pay to QR</Link> {/* Adjusted to relative path */}
            &nbsp;&nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
            <Link to="/merchant" className="global-btn">Merchant</Link> {/* Adjusted to relative path */}
        </div>
    )
}
