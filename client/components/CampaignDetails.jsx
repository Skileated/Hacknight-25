const CampaignDetails = ({ campaign }) => {
  const { donate, getDonations, address, claimCampaignFunds, requestRefund, checkCampaignStatus } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);
  const isEnded = checkCampaignStatus(campaign);
  const isOwner = address === campaign.owner;
  const canClaim = isOwner && isEnded && !campaign.claimed && 
                  parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
  const canRefund = isEnded && parseFloat(campaign.amountCollected) < parseFloat(campaign.target);

  const handleDonate = async () => {
    setIsLoading(true);
    try {
      await donate(campaign.pId, amount);
      // Refresh donations
      const updatedDonations = await getDonations(campaign.pId);
      setDonators(updatedDonations);
    } catch (error) {
      console.error("Donation failed:", error);
    }
    setIsLoading(false);
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      await claimCampaignFunds(campaign.pId);
      // Refresh campaign data
    } catch (error) {
      console.error("Claim failed:", error);
    }
    setIsLoading(false);
  };

  const handleRefund = async () => {
    setIsLoading(true);
    try {
      await requestRefund(campaign.pId);
      // Refresh donations
      const updatedDonations = await getDonations(campaign.pId);
      setDonators(updatedDonations);
    } catch (error) {
      console.error("Refund failed:", error);
    }
    setIsLoading(false);
  };

  // ... rest of your component code ...

  return (
    <div>
      {/* ... existing campaign details ... */}
      
      {!isEnded && (
        <div>
          <input 
            type="number" 
            placeholder="ETH 0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button 
            onClick={handleDonate}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Fund Campaign'}
          </button>
        </div>
      )}

      {canClaim && (
        <button 
          onClick={handleClaim}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Claim Funds'}
        </button>
      )}

      {canRefund && (
        <button 
          onClick={handleRefund}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Request Refund'}
        </button>
      )}

      {/* ... rest of your JSX ... */}
    </div>
  );
};