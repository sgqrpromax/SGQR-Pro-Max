# Overview of project

[SGQR Pro Max Report](https://docs.google.com/document/d/1gl4Az8Ru_RCtfZpL4rT_4Ridk-icp56TpXDgvwWStM0/edit)

New stablecoin created: SGDk (k for constant)

## Layout of repo
1. frontend
1. backend (to be deprecated)

## Frontend
The frontend was built with React, HTML and CSS to create a website that works on both computer and mobile.

To access the website, user will be prompted to connect his/her Metamask wallet to the website when the user clicks on the "Get Started" button.
Upon entering the website, the user has access to a number of pages.

### Pay To QR Page
First, the user needs to approve an amount of SGDk tokens for our backend smart contract to use.

Next, there is a QR code scanner that the user can use to scan SGQR codes across Singapore. Upon successfully the code, the website will return the retrieved name and UEN for the user to verify.
The user can then key the desired amount of tokens he/she wants to transfer to the merchant and then approve and sign the transaction. Our smart contract will then transfer the SGDk tokens from the user's wallet to the merchant's wallet address under the specific UEN.

Below the QR code scanner, there is the user's transaction history.

### Profile Page
Here the user can view his/her SGDk token balance as well as the wallet address connected to the site and the network the wallet is connected to.

### Merchant Dashboard Page
This page is for merchants to withdraw their SGDk tokens from their UEN wallets to their own wallets, whose wallet addresses have already been whitelisted in our backend smart contracts.
The merchant just needs to key in their wallet address as well as the amount of SGDk they would like to withdraw.

Merchants can also check their SGDk token balance based on the UEN.

### Smart contract backend overview
The smart contract backend contains 2 portions, one for the XRP EVM Side chain, and another one for the XRPL Main chain. They're described in details below.

The smart contracts are developed with [foundry](https://github.com/foundry-rs/foundry).

## Backend

### XRPL Main Chain
The XRPL main chain will be used to swap stablecoins for SGDk. The SGDk will then be bridged to the EVM side chain. The reason for using the main chain for holding and swapping for SGDk is explained as follows. 

#### Security
The main chain has never had a single hack that has occurred since inception in 2012, resulting in the most secure chain in terms of enterprise use. As the main chain is not programmable, the chain offers enough core feature to hold the SGDk safely and securely. 

#### Liquidity
As the main chain has many FIs who are involved in the chain, there is a large amount of liquidity present on the chain, great for people who wants to swap for SGDk. Prices will also be closest to midmarket rates as banks use the chain to trade forex. 

In general, the main chain could be seen as the "DBS app", which is the primary "vault" holding all the cash. Meanwhile, the EVM chain can be seen as the "e-wallet" holding a small amount of SGDk for daily transactions and use. 

### EVM side chain
The EVM side chain will hold all the smart contract backend, enabling payment processing for everyone in Singapore. 

#### SGDm
This is a modified ERC20 smart contract. This smart contract holds SGDk and records how many SGDk each UEN hold. As soon as the standard ERC20 transfer function is called, this transfers the underlying SGDk out from the SGDm smart contract belonging to the whitelisted UEN address to the specified address. The smart contract will show 0 and not allow a random address to transfer SGDk out if the address is not whitelisted and does not belong to any UEN. 

There is also a custom transfer function which allows a custom transfer to a specified UEN instead of an address. This allows UEN to UEN transfers which does not require the recipient to be whitelisted. 

As the view functions are all public, any merchant that has not onboarded can also use the website to view their UEN transfer history, without whitelisting and onboarding. 

#### UEN Management
The UEN Management contract holds the entire list of UENs and their names in Singapore. They are scrapped with a helper script from [GovTech](http://data.gov.sg/) which are all public information. More info on the script in the next section. 

#### Whitelist
The whitelist is for merchants to onboard themselves with our platform so they can withdraw. After adding their wallet address to the whitelist, they can then add the SGDm as a standard ERC20 to their wallet app. This enables them to "send" (or withdraw) to their wallet or any other wallet. They can also use the transfer function on our web app which can transfer to a specific UEN which may not have onboarded with us yet. 

### Other helper scripts 
#### UEN Grabber
This script grabs all the UEN from govtech and dumps them in a nice format locally.

#### UEN Deployment
This script deploys the UEN to the smart contract taking the data from the local data dump. 

## Front and backend interaction
* Users link their wallet to metamask when they log in to the front end. 
* User can choose to send tokens to merchant via UEN by scanning the standard SGQR.
  * After scanning, the front end queries the SGDk token allowance.
    * This is done by calling the `bank.sol` deployment's `check_allowance()` function which returns how many SGDk token the user has allowed to be sent to the `bank.sol` backend.
  * To transfer, the `send_tokens_to_uen(string memory _uen, uint256 _amount)` is called to send SGDk tokens to the UEN. The allowance is checked to make sure that the token to transfer is within the allowance.
* For merchants, what they want to do is to view the amount of SGDk token they have. The merchant have 2 options to do this:
  * Merchants that are not onboarded can use the frontend and enter their UEN to view the amount of tokens they currently have. 
  * Merchants that have already onboarded can add the deployment address of `bank.sol` directly to any wallet of their choice and it will be shown as an ERC20 token.
