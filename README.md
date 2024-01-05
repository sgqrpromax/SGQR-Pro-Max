# SGQR+
## Layout of repo
1. Front end
1. Solidity backend

## Sepolia Info
* We are using ZEENUS token instead of XSGD or USDC.
* ZEENUS token has 0 decimal places compared to XSGD, USDC, or other conventional tokens.

## Front and backend interaction
* Users link their wallet to metamask when they log in to the front end. 
* User can choose to send tokens to merchant via UEN by scanning the standard SGQR.
  * After scanning, the front end queries the ZEENUS token allowance.
    * This is done by calling the `bank.sol` deployment's `check_allowance()` function which returns how many ZEENUS token the user has allowed to be sent to the `bank.sol` backend.
  * To transfer, the `send_tokens_to_uen(string memory _uen, uint256 _amount)` is called to send ZEENUS tokens to the UEN. The allowance is checked to make sure that the token to transfer is within the allowance.
* For merchants, what they want to do is to view the amount of ZEENUS token they have. The merchant have 2 options to do this:
  * Merchants that are not onboarded can use the frontend and enter their UEN to view the amount of tokens they currently have. 
  * Merchants that have already onboarded can add the deployment address of `bank.sol` directly to any wallet of their choice and it will be shown as an ERC20 token.

## TODO
1. Fill things up here...

## WEN MOON
1. BTC 100K 2021 Q10
1. PROFIT???!!
1. LAUNCH GARGCOIN