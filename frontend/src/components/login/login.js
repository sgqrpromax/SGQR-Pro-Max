import './login.css';
import '../../global.css';
import logo from '../../images/logo.svg';

export default function Login(props){

    const NoMetamask = () => {
        return (
            <div>
                <p>
                    No MetaMask detected. 
                    <br></br>
                    Please install&nbsp;
                    <span className = "login-highlight">
                        METAMASK 
                    </span>
                    &nbsp;to your browser to proceed. 
                </p>
            </div>
        )
    }

    const LoginMetamask = () => {
        return (
            <div>
                
                <a className = "login-btn" onClick = {props.connectTo} >
                    Get started!
                </a>
            </div>
        )
    }

    return (
        <div className="login">
            <div className='login-container'>
                <h1>
                    <span className="login-projectName">SGQR+</span>
                </h1>

                <h2 className="login-headline">Pay with the power of Blockchain</h2>
                
                <h3 className="login-author">
                    SGQR+ is a blockchain-powered digital payment solution that promises instant onboarding, zero downtime, and a seamless payment experience.
                </h3>
                
                
                {
                    props.isHaveMetamask ?
                    <LoginMetamask /> :
                    <NoMetamask />
                }
            </div>

        </div>
    )    
}
