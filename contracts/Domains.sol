// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import { StringUtils } from "./libraries/StringUtils.sol";
import "hardhat/console.sol";

contract Domains {
  string public tld;

  mapping(string => address) public domains;
  mapping(string => string) public records;
		
  // Make the contract "payable" by adding this to the constructor
  constructor(string memory _tld) payable {
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }
		
  // Set price by domain length
  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**14; // 0.05 MATIC = 50 000 000 000 000 000 (18 decimals).
    } else if (len == 4) {
      return 3 * 10**14;
    } else {
      return 1 * 10**14;
    }
  }

  function register(string calldata name) public payable{
    require(domains[name] == address(0));
    
    uint _price = price(name);

    // Check if enough MATIC was paid in the transaction
    require(msg.value >= _price, "Not enough MATIC");

    domains[name] = msg.sender;
    console.log("%s has registered a domain!", msg.sender);
  }
}