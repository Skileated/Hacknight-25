// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    enum CampaignStatus { Active, Ended, NFTMinted }
    
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        CampaignStatus status;
        bool claimed;
        bool hasNFT;
        uint256 nftTokenId;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;
    address public nftContractAddress;
    
    event CampaignCreated(uint256 id, address owner, string title, uint256 target, uint256 deadline);
    event DonationReceived(uint256 campaignId, address donor, uint256 amount);
    event CampaignClaimed(uint256 campaignId, address owner, uint256 amount);
    event DonationRefunded(uint256 campaignId, address donor, uint256 amount);

    modifier onlyNFTContract() {
        require(msg.sender == nftContractAddress, "Only NFT contract can call this");
        _;
    }
    
    function setNFTContractAddress(address _nftContractAddress) external {
        require(nftContractAddress == address(0), "NFT contract already set");
        nftContractAddress = _nftContractAddress;
    }

    function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "The deadline should be a date in the future");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.status = CampaignStatus.Active;
        campaign.claimed = false;
        campaign.hasNFT = false;
        campaign.nftTokenId = 0;

        emit CampaignCreated(numberOfCampaigns, _owner, _title, _target, _deadline);

        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Campaign storage campaign = campaigns[_id];
        require(campaign.status == CampaignStatus.Active, "Campaign is not active");
        require(block.timestamp <= campaign.deadline, "Campaign has ended");
    
        uint256 amount = msg.value;
    
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        campaign.amountCollected += amount;
    
        emit DonationReceived(_id, msg.sender, amount);
    
        if (campaign.amountCollected >= campaign.target) {
            campaign.status = CampaignStatus.Ended;
        }
    }

    function claimCampaignFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only campaign owner can claim");
        require(!campaign.claimed, "Funds already claimed");
        require(campaign.status == CampaignStatus.Ended || block.timestamp > campaign.deadline, "Campaign is still active");
        require(campaign.amountCollected >= campaign.target, "Target not reached");

        campaign.claimed = true;
        uint256 amount = campaign.amountCollected;
        
        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send funds");

        emit CampaignClaimed(_id, campaign.owner, amount);
    }

    function refundDonation(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp > campaign.deadline, "Campaign not ended yet");
        require(campaign.amountCollected < campaign.target, "Campaign was successful");
        
        // Gas optimization: Use memory variables to reduce storage reads
        address[] memory donators = campaign.donators;
        uint256[] memory donations = campaign.donations;
        
        uint256 donationIndex;
        uint256 donationAmount;
        bool found = false;
    
        // Gas optimization: Cache array length
        uint256 donatorsLength = donators.length;
        for(uint256 i = 0; i < donatorsLength; i++) {
            if(donators[i] == msg.sender) {
                donationIndex = i;
                donationAmount = donations[i];
                found = true;
                break;
            }
        }
    
        require(found, "No donation found from this address");
        require(donationAmount > 0, "Donation already refunded");
    
        campaign.donations[donationIndex] = 0;
        campaign.amountCollected -= donationAmount;
    
        (bool sent,) = payable(msg.sender).call{value: donationAmount}("");
        require(sent, "Failed to send refund");
    
        emit DonationRefunded(_id, msg.sender, donationAmount);
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }
        return allCampaigns;
    }

    // New function for NFT contract to update campaign status
    function updateCampaignNFTStatus(uint256 _id, uint256 _tokenId) external onlyNFTContract {
        Campaign storage campaign = campaigns[_id];
        campaign.hasNFT = true;
        campaign.nftTokenId = _tokenId;
        campaign.status = CampaignStatus.NFTMinted;
    }
    
    // New function to get campaign details for NFT contract
    // Modify the getCampaignDetails function to use structs instead of multiple return values
    function getCampaignDetails(uint256 _id) external view returns (
        address owner,
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        uint256 amountCollected,
        string memory image,
        bool claimed,
        bool hasNFT,
        uint256 nftTokenId,
        uint8 status
    ) {
        Campaign storage campaign = campaigns[_id];
        return (
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.target,
            campaign.deadline,
            campaign.amountCollected,
            campaign.image,
            campaign.claimed,
            campaign.hasNFT,
            campaign.nftTokenId,
            uint8(campaign.status)
        );
    }
}