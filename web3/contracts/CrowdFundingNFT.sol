// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./CrowdFunding.sol";

contract CrowdFundingNFT is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    CrowdFunding public crowdFundingContract;
    
    // Mapping from tokenId to campaign ID
    mapping(uint256 => uint256) public tokenToCampaign;
    
    event NFTMinted(uint256 campaignId, uint256 tokenId, address owner);
    
    constructor(address _crowdFundingAddress) ERC721("CrowdFunding Success NFT", "CFNFT") {
        crowdFundingContract = CrowdFunding(_crowdFundingAddress);
    }
    // Modify the mintCampaignNFT function to reduce stack variables
    function mintCampaignNFT(uint256 _campaignId, string memory _tokenURI) public {
        // Get campaign details from the main contract
        (
            address owner,
            ,  // title
            ,  // description
            uint256 target,
            ,  // deadline
            uint256 amountCollected,
            ,  // image
            ,  // claimed
            bool hasNFT,
            ,  // nftTokenId
            uint8 status
        ) = crowdFundingContract.getCampaignDetails(_campaignId);
                    
        // Verify conditions
        require(msg.sender == owner, "Only campaign owner can mint NFT");
        require(status == 1, "Campaign must be ended"); // 1 = Ended status
        require(amountCollected >= target, "Campaign must reach target");
        require(!hasNFT, "NFT already minted for this campaign");
        
        // Mint NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        tokenToCampaign[newTokenId] = _campaignId;
        
        // Update campaign in main contract
        crowdFundingContract.updateCampaignNFTStatus(_campaignId, newTokenId);
        
        emit NFTMinted(_campaignId, newTokenId, owner);
    }
    function getCampaignByTokenId(uint256 _tokenId) public view returns (uint256) {
        require(_exists(_tokenId), "Token does not exist");
        return tokenToCampaign[_tokenId];
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}