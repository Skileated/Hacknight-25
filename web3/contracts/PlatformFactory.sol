// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./CrowdFunding.sol";
import "./CrowdFundingNFT.sol";
import "./MicroFinance.sol";

contract PlatformFactory {
    CrowdFunding public crowdFundingContract;
    CrowdFundingNFT public nftContract;
    MicroFinance public microFinanceContract;
    
    event ContractsDeployed(address crowdFunding, address nft, address microFinance);
    
    constructor() {
        // Deploy all contracts
        crowdFundingContract = new CrowdFunding();
        nftContract = new CrowdFundingNFT(address(crowdFundingContract));
        microFinanceContract = new MicroFinance();
        
        // Set NFT contract address in CrowdFunding
        crowdFundingContract.setNFTContractAddress(address(nftContract));
        
        emit ContractsDeployed(
            address(crowdFundingContract),
            address(nftContract),
            address(microFinanceContract)
        );
    }
    
    function getCrowdFundingAddress() public view returns (address) {
        return address(crowdFundingContract);
    }
    
    function getNFTAddress() public view returns (address) {
        return address(nftContract);
    }
    
    function getMicroFinanceAddress() public view returns (address) {
        return address(microFinanceContract);
    }
}