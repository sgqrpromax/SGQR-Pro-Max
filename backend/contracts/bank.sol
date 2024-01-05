// SPDX-License-Identifier: Proprietary
pragma solidity 0.8.22;

import "@openzeppelin/token/ERC20/IERC20.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

interface Iwhitelist {
	/* 
	This interface is used to check if a UEN is onboarded.
	get_uen_to_whitelist gets the whitelisted address for a UEN. UEN is the input.
	*/
	function get_uen_to_whitelist(string memory _uen) external view returns (address);
	function get_whitelist_to_uen(address _whitelist) external view returns (string memory);
}

interface Iuen_management {
	/*
	This interface is used to read the UENs from the UEN management contract. 
	get_name gets the name of the company from the UEN. UEN is the input.
	get_all_uens gets all the UENs from the UEN management contract.
	*/
	function get_name(string memory _uen) external view returns (string memory);
	function get_all_uens() external view returns (string[] memory);
}

interface Iadmin_management {
	/*
	This interface is used to manage the admin list of who can manage this bank contract.
	*/
	function get_admins() external view returns (address[] memory);
}

interface Ibank {
	/*
	This interface describes the overall bank contract.
	*/
	function token_address() external view returns (address);
	function name() external view returns (string memory);
	function symbol() external view returns (string memory);
	function decimals() external view returns (uint8);
	function totalSupply() external view returns (uint256);
	function balanceOf(address _owner) external view returns (uint256 balance);
	function allowance(address _owner, address _spender) external view returns (uint256 remaining);

	function send_tokens_to_uen(string memory _uen, uint256 _amount) external returns (bool);
	function uen_send(string memory _uen_target, uint256 _amount) external returns (bool);
	function transfer(address _to, uint256 _amount) external returns (bool);
	function admin_withdraw(address _to, uint256 _amount) external returns (bool);
	function check_whitelist() external view returns (string memory);
	function check_allowance(address _address) external view returns (uint256);
	function balance_of_uen(string memory _uen) external view returns (uint256);
}

contract bank {
	/*
	For now, we are implementing only a single token banking application. 

	Attempts to implement ERC20 token standard:
	Public view:
	- function name() public view returns (string)
	- function symbol() public view returns (string)
	- function decimals() public view returns (uint8)
	- function totalSupply() public view returns (uint256)
	- function balanceOf(address _owner) public view returns (uint256 balance)
	- function allowance(address _owner, address _spender) public view returns (uint256 remaining)

	- event Transfer(address indexed _from, address indexed _to, uint256 _value)
	- event Approval(address indexed _owner, address indexed _spender, uint256 _value)

	Functions:
	- function transfer(address _to, uint256 _value) public returns (bool success)
	- function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
	- function approve(address _spender, uint256 _value) public returns (bool success)

	Before transfer and transferFrom, check the allowance for both this contract and the actual ERC20 token we want to transfer to and from. For now, we ignore the approve and transferFrom functions and implement only the transfer function. 

	For balanceOf, it will return the value corresponding to the whitelist. 
	*/

	// Contains the ERC20 token contract address. This should theoretically be ERC20
	IERC20 public token;

	// Mapping of UEN to amount of tokens they contain. 
	mapping(string => uint256) public uen_to_balance;

	// Contains the list of admins for this contract. 
	Iadmin_management admin_management_contract;
	address[] public admins;
	// Contains the list of UENs.
	Iuen_management uen_management_contract;
	string[] public uen_list;
	// Contains the contract of the mapping of the UEN to the whitelisted address. This can also query whitelisted address to UEN.
	Iwhitelist whitelist_contract;

	constructor (address _token1, address _uen_management_contract_address, address _admin_management_contract_address, address _whitelist_management_contract_address) {
		// Specify the token to use
		token = IERC20(_token1);

		// UEN management contract
		uen_management_contract = Iuen_management(_uen_management_contract_address);
		uen_list = uen_management_contract.get_all_uens();

		// Admin management for this contract
		admin_management_contract = Iadmin_management(_admin_management_contract_address);
		admins = admin_management_contract.get_admins();

		// Whitelist management contract
		whitelist_contract = Iwhitelist(_whitelist_management_contract_address);
	}

	// Check if the caller is an admin. This is a modifier which is called before a function call. This will prevent non-admins from calling the function.
	modifier only_admin {
		bool is_owner = false;
		for (uint i = 0; i < admins.length; i++) {
			if (msg.sender == admins[i]) {
				is_owner = true;
				break;
			}
		}
		require(is_owner, "Only admins can call this function");
		_;
	}

	// Function for admins to withdraw tokens from the contract. This is essentially a withdraw function.
	function admin_withdraw(address _to, uint256 _amount) external only_admin returns (bool) {
		require(_to != address(0), "Withdraw to the zero address");
		if (token.balanceOf(address(this)) < _amount) {
			return false;
		}
		token.transfer(_to, _amount);
		return true;
	}

	// Get name of the UEN. This is a public function. If no name exists, break.
	modifier check_name(string memory _uen) {
		require(bytes(uen_management_contract.get_name(_uen)).length > 0, "UEN does not exist");
		_;
	}

	// Get name for UEN. This is a public function.
	function get_name(string memory _uen) external view returns (string memory) {
		return uen_management_contract.get_name(_uen);
	}

	// Check if the sender is a whitelisted address. Returns the UEN. 
	function check_whitelist() public view returns (string memory) {
		return whitelist_contract.get_whitelist_to_uen(msg.sender);
	}

	// Check ERC20 allowance
	function check_allowance(address _address) external view returns (uint256) {
		return token.allowance(_address, address(this));
	}

	// Balance of UEN
	function balance_of_uen(string memory _uen) external view returns (uint256) {
		return uen_to_balance[_uen];
	}

	/* 
	Send tokens from private wallet to uen. In short, the function that consumers will use. 
	Input: UEN of the company to send tokens to, amount of tokens to send.
	Before sending, ensure that the sender has approved this contract to spend the tokens.
	Before sending, ensure that the UEN exists. 
	After sending, update the mapping of UEN to balance. 
	If there is an associated whitelist address, emit and event to notify the whitelist address of the transfer.
	*/
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	function send_tokens_to_uen(string memory _uen, uint256 _amount) external check_name(_uen) returns (bool) {
		require(bytes(_uen).length > 0, "UEN is empty");
		uint256 token_allowance = token.allowance(msg.sender, address(this));
    	require(token_allowance >= _amount, "Increase the allowance");
		token.transferFrom(msg.sender, address(this), _amount);
		uen_to_balance[_uen] += _amount;
		address _uen_address = whitelist_contract.get_uen_to_whitelist(_uen);
		if (_uen_address != address(0)) {
			emit Transfer(msg.sender, _uen_address, _amount);
		}
		return true;
	}

	/*
	Send tokens between UENs. This is basically an internal transfer function.
	Input: UEN of the company to send tokens to, amount of tokens to send.
	Before sending, ensure that the UEN of the destination exists.
	Before sending, ensure that the spender has enough tokens to send and the spender is the owner of the UEN.
	After sending, if both UENs have an associated whitelist, emit an event to notify both addresses of the transfer.
	*/
	function uen_send(string memory _uen_target, uint256 _amount) external check_name(_uen_target) returns (bool) {
		require(bytes(_uen_target).length > 0, "UEN target is empty");
		string memory _uen_payer = whitelist_contract.get_whitelist_to_uen(msg.sender);
		if (uen_to_balance[_uen_payer] < _amount) {
			return false;
		}
		uen_to_balance[_uen_payer] -= _amount;
		uen_to_balance[_uen_target] += _amount;
		
		address _uen_target_address = whitelist_contract.get_uen_to_whitelist(_uen_target);
		if (_uen_target_address != address(0)) {
			emit Transfer(msg.sender, _uen_target_address, _amount);
		}
		return true;
	}

	/*
	Enable whitelisted addresses to withdraw their tokens to an external address. 
	This is essentially a withdraw function.
	Input: destination address, amount of tokens to withdraw.
	Before sending, ensure that the sender is the whitelisted owner of the UEN. 
	*/
	function transfer(address _to, uint256 _amount) public returns (bool) {
		require(_to != address(0), "Transfer to the zero address");
		string memory _uen_sender = whitelist_contract.get_whitelist_to_uen(msg.sender);
		if (uen_to_balance[_uen_sender] < _amount) {
			return false;
		}
		uen_to_balance[_uen_sender] -= _amount;
		token.transfer(_to, _amount);
		emit Transfer(msg.sender, _to, _amount);
		return true;
	}

	// Return token address
	function token_address() external view returns (address) {
		return address(token);
	}

	// Name
	function name() public view returns (string memory) {
		return "SGDz Bank";
	}

	// Symbol
	function symbol() public view returns (string memory) {
		return "SGDz";
	}

	// Decimals, returns the token decimals
	// TODO: Change this portion to return the actual decimal of the token.
	function decimals() public view returns (uint8) {
		// return uint8(ERC20(address(token)).decimals());
		return 0;
	}

	// Total supply, returns the token total supply
	// TODO: Might need to fix the return value here
	function totalSupply() public view returns (uint256) {
		return uint256(token.totalSupply());
	}

	// Balance of, returns the balance of the UEN which the _owner is associated with.
	// If not associated, it'll return 0.
	function balanceOf(address _owner) public view returns (uint256 balance) {
		string memory _uen = whitelist_contract.get_whitelist_to_uen(_owner);
		return uen_to_balance[_uen];
	}

	// Function for allowance. This is set to 0 for now to disallow other contracts from spending tokens from this contract.
	// TODO: Implement allowance. Allow other contracts to transfer on behalf of the UEN.
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	function allowance(address _owner, address _spender) public view returns (uint256) {
		return 0;
	}
}