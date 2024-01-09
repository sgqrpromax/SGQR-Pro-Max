# Overview
The backend contains a few components. They are listed and explained here.
1. Python script
1. Contracts (Sepolia)
1. Contracts (XRPL EVM)

## Overview
There are several Python scripts written. They are designed to grab UEN data from govtech and also to upload these UEN to the blockchain. 

There are 3 main contracts. 
1. uen_management.sol contains the list of UEN as well as their names. This is the primary UEN database that exists on the blockchain.
1. whitelist.sol contains the onboarded merchant (UEN) and their wallet address. 
1. sgdm.sol is the primary contract enabling transactions to the QR code. It is an ERC20 compliant contract that merchants can add to their wallet applications. 

There are 2 helper contracts.
1. admin.sol governs the admins that can manage each contract. This should be deprecated and replaced by the OpenZeppelin's permissions library. 
1. sgdk.sol is a testing stablecoin that should be replaced by an actual stablecoin. 

# Script
The UEN script is meant to grab the UEN from [data.gov.sg](data.gov.sg). The parsed files are in the full_uen_filtered_list folder and was parsed as of 24 Oct 2023. Solidity is managed and compiled with [ape](https://docs.apeworx.io/ape/stable/userguides/quickstart.html).

## How to run 
1. Install [Python Poetry](https://python-poetry.org/)
1. Poetry is the package manager. Install this to manage the virtual environment effortlessly. :D
1. Run `poetry update`. This should install all the required dependencies. 
1. Run `poetry shell`

## Deploy script
1. Run `ape run deploy` to deploy real UENs into blockchain. Run `ape run deploy_sample` to deploy some sample UENs into blockchain.

### deploy_uen.py
The deploy.py contains the uen_management class.
Run the deploy.py with this command `ape run deploy --network ethereum:sepolia:alchemy`. Alternatively, another network can be specified. 
You need to add an account before you can deploy to testnets. Refer to [ape documentation](https://docs.apeworx.io/ape/stable/userguides/accounts.html#live-network-accounts)
Alternatively, get the help: `ape run deloy --help`
1. Deploy the uen_management smart contract onto the chain. Alternatively, a current address can also be specified with `--deployment`
1. After deployment, grab all the UEN data from local folder. Alternatively, a sample data containing 7 addresses can be specified with `--use_sample`
1. Grab all UEN data from smart contract (onchain data).
1. Check if local UEN and UEN data on smart contract is the same.
1. If not, iteratively update the smart contract with missing UENs and their names. Due to gas limit, a limit can be specified with `--limit`. It will try it's best to upload as many data objects at once. 

## Contract (Sepolia)
### SGDk ERC20 address
`0x3C50e0849cba0dE6deb6Ecd627531eC0a5F828e4`

### Contract addresses
* UEN Management: `0x716C0352dC387873c1022317987b4C942Bef11f9`
  * UEN admin management: `0x6780131f3649c70f94a20b86DeA2f88eb2914e70`
* Whitelist Management: `0xADEc60da0d50caD4C1153f3f6522B94e779ea74f`
  * Whitelist admin management: `0x75D3B79C4b3C3c171282C34B956dA8c50C75ccbE`

| UEN | Address |
| ----------- | ----------- |
| `00467500B` | `0x1A75299144c901654720cF005f1383eB74Ba9b2a`  | 
| `202323489D` | `0x94DECA7D44af312256e88891c9fcdF40D61CA918` | `AGZ FOOD PTE LTD` |
| `198402065R` | `0x7cc710c5Ff87aE5b561913f409b491FE2FDc9CE4` | `WATCHES` |

* SGDm: `0xAFA352988661935b22A1e66390973124F1B013eA`
  * SGDm admin management: `0x09456c18c826b1204c33FA7f3aeEEF7fF43660E1`

SGDm deployment inputs:
`"0x3C50e0849cba0dE6deb6Ecd627531eC0a5F828e4", "0x716C0352dC387873c1022317987b4C942Bef11f9", "0x09456c18c826b1204c33FA7f3aeEEF7fF43660E1", "0xADEc60da0d50caD4C1153f3f6522B94e779ea74f"`

## Contract constructors (under construction)
### sgdm.sol
* Get name of UEN
  * `function get_name(string memory _uen) external view returns (string memory);`
  * function: get_name
  * input: string uen
  * returns string name

* Get the UEN of sender. This checks if the sender is a whitelisted address of any UEN. 
  * `function check_whitelist() public view returns (string memory);`
  * function: check_whitelist()
  * output: string uen, blank if not a whitelist

* Check allowance of SGDk token
  * `function check_allowance() public view returns (uint256);`
  * function: check_allowance
  * output: allowance of ZEENUS token

* Get SGDk token address
  * `function token_address() external view returns (address);`
  * Call this to get the address of the ZEENUS token (XSGD/USDC/stablecoin)

* Request for allowance of SGDk token. This enables you to pay to this contract. This requires gas.
  * `function approve_token(uint256 _amount) public returns (bool);`
  * function: approve_token
  * input: uint256 amount
  * output: True boolean

* Send ZEENUS to UEN. Requires allowance so you can pay ZEENUS tokens to this contract (the bank). This requires gas.
  * `function send_tokens_to_uen(string memory _uen, uint256 _amount) external check_name(_uen) returns (bool);` 
  * function: send_tokens_to_uen
  * input: string uen, uint256 amount
  * output: True for success

* Internal transfer between UENs. Once you (merchant) are onboarded, you can choose to send money to other UENs. This does not require the destination UEN to be onboarded yet (no whitelisted address for the destination UEN). This requires gas. 
  * `function uen_send(string memory _uen_target, uint256 _amount) external check_name(_uen_target) returns (bool);`
  * function: uen_send
  * input: string uen_target, uint256 amount
  * output: True boolean for sucessful transfer

* Transfer ZEENUS token from bank (this contract) to another address. This functions like a withdrawal function for a whitelisted address. This requires gas.
  * `function transfer(address _to, uint256 _amount) public returns (bool);`
  * function: transfer
  * input: address of payee, uint256 amount
  * output: True boolean for successful transfer

* Balance of UEN. This enables anyone to query the balance of any UEN, including non-onboarded merchants.
  * `function balance_of_uen(string memory _uen) public view returns (uint256);`
  * function: balance_of_uen
  * input: string uen
  * output: uint256 balance

* Balance of whitelisted address. This enables anyone to query the balance of any address. However, it'll only return a value if the address is whitelisted (belongs to a UEN)
  * `function balanceOf(address _owner) public view returns (uint256 balance);` 
  * function: balanceOf
  * input: address to query
  * output: uint256 balance

## TODO
* Add deployment to test net
* Add function to check if govtech data is the latest
* Update the readme properly
* Explain the code properly
* Replace admin contract with proper access control management