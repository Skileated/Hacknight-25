// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MicroFinance is ReentrancyGuard {
    enum LoanStatus { Pending, Active, Repaid, Defaulted }
    
    struct Loan {
        address borrower;
        string purpose;
        uint256 amount;
        uint256 interestRate; // In basis points (1% = 100)
        uint256 duration; // In seconds
        uint256 startTime;
        uint256 endTime;
        uint256 amountRepaid;
        LoanStatus status;
        address[] lenders;
        uint256[] contributions;
    }
    
    mapping(uint256 => Loan) public loans;
    uint256 public numberOfLoans = 0;
    
    // Borrower reputation system
    mapping(address => uint256) public borrowerReputation; // 0-100 scale
    mapping(address => uint256) public borrowerLoansCount;
    mapping(address => uint256) public borrowerDefaultsCount;
    
    event LoanCreated(uint256 loanId, address borrower, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanFunded(uint256 loanId, address lender, uint256 amount);
    event LoanActivated(uint256 loanId, uint256 startTime, uint256 endTime);
    event LoanRepaid(uint256 loanId, uint256 amount);
    event LoanDefaulted(uint256 loanId);
    
    // For example, if you have a getLoanDetails function with many return values:
    struct LoanDetails {
        address borrower;
        string purpose;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        uint256 amountRepaid;
        uint8 status;
        uint256 totalContributed;
    }
    
    // Renamed to getLoanDetailsStruct to avoid duplicate function name
    function getLoanDetailsStruct(uint256 _id) external view returns (LoanDetails memory) {
        Loan storage loan = loans[_id];
        
        uint256 totalContrib = 0;
        for (uint256 i = 0; i < loan.contributions.length; i++) {
            totalContrib += loan.contributions[i];
        }
        
        return LoanDetails({
            borrower: loan.borrower,
            purpose: loan.purpose,
            amount: loan.amount,
            interestRate: loan.interestRate,
            duration: loan.duration,
            startTime: loan.startTime,
            endTime: loan.endTime,
            amountRepaid: loan.amountRepaid,
            status: uint8(loan.status),
            totalContributed: totalContrib
        });
    }
    
    // Missing createLoan function
    function createLoan(string memory _purpose, uint256 _amount, uint256 _interestRate, uint256 _duration) public returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        Loan storage loan = loans[numberOfLoans];
        loan.borrower = msg.sender;
        loan.purpose = _purpose;
        loan.amount = _amount;
        loan.interestRate = _interestRate;
        loan.duration = _duration;
        loan.status = LoanStatus.Pending;
        loan.lenders = new address[](0);
        loan.contributions = new uint256[](0);
        
        borrowerLoansCount[msg.sender]++;
        
        // Initialize reputation for new borrowers
        if (borrowerReputation[msg.sender] == 0 && borrowerLoansCount[msg.sender] == 1) {
            borrowerReputation[msg.sender] = 50; // Start with neutral reputation
        }
        
        emit LoanCreated(numberOfLoans, msg.sender, _amount, _interestRate, _duration);
        
        numberOfLoans++;
        return numberOfLoans - 1;
    }
    
    function fundLoan(uint256 _loanId) public payable nonReentrant {
        require(_loanId < numberOfLoans, "Loan does not exist");
        
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        loan.lenders.push(msg.sender);
        loan.contributions.push(msg.value);
        
        emit LoanFunded(_loanId, msg.sender, msg.value);
        
        uint256 totalFunded = 0;
        for (uint256 i = 0; i < loan.contributions.length; i++) {
            totalFunded += loan.contributions[i];
        }
        
        if (totalFunded >= loan.amount) {
            activateLoan(_loanId);
        }
    }
    
    function activateLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.endTime = block.timestamp + loan.duration;
        
        // Transfer funds to borrower
        (bool sent,) = payable(loan.borrower).call{value: loan.amount}("");
        require(sent, "Failed to send funds to borrower");
        
        emit LoanActivated(_loanId, loan.startTime, loan.endTime);
    }
    
    function repayLoan(uint256 _loanId) public payable nonReentrant {
        require(_loanId < numberOfLoans, "Loan does not exist");
        
        Loan storage loan = loans[_loanId];
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(loan.status == LoanStatus.Active, "Loan is not active");
        
        uint256 totalDue = calculateTotalDue(_loanId);
        require(msg.value > 0, "Repayment amount must be greater than 0");
        
        loan.amountRepaid += msg.value;
        emit LoanRepaid(_loanId, msg.value);
        
        if (loan.amountRepaid >= totalDue) {
            loan.status = LoanStatus.Repaid;
            
            // Improve borrower reputation
            if (borrowerReputation[loan.borrower] < 100) {
                borrowerReputation[loan.borrower] += 5;
                if (borrowerReputation[loan.borrower] > 100) {
                    borrowerReputation[loan.borrower] = 100;
                }
            }
            
            // Distribute repayments to lenders
            distributeFunds(_loanId);
        }
    }
    
    function markAsDefaulted(uint256 _loanId) public {
        require(_loanId < numberOfLoans, "Loan does not exist");
        
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(block.timestamp > loan.endTime, "Loan duration not ended yet");
        
        loan.status = LoanStatus.Defaulted;
        borrowerDefaultsCount[loan.borrower]++;
        
        // Decrease borrower reputation
        if (borrowerReputation[loan.borrower] > 10) {
            borrowerReputation[loan.borrower] -= 10;
        } else {
            borrowerReputation[loan.borrower] = 0;
        }
        
        emit LoanDefaulted(_loanId);
        
        // Distribute any partial repayments
        if (loan.amountRepaid > 0) {
            distributeFunds(_loanId);
        }
    }
    
    function calculateTotalDue(uint256 _loanId) public view returns (uint256) {
        Loan storage loan = loans[_loanId];
        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        return loan.amount + interest;
    }
    
    function distributeFunds(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        
        uint256 totalContributed = 0;
        for (uint256 i = 0; i < loan.contributions.length; i++) {
            totalContributed += loan.contributions[i];
        }
        
        for (uint256 i = 0; i < loan.lenders.length; i++) {
            uint256 lenderShare = (loan.amountRepaid * loan.contributions[i]) / totalContributed;
            if (lenderShare > 0) {
                (bool sent,) = payable(loan.lenders[i]).call{value: lenderShare}("");
                require(sent, "Failed to send funds to lender");
            }
        }
    }
    
    function getActiveLoansByBorrower(address _borrower) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count active loans
        for (uint256 i = 0; i < numberOfLoans; i++) {
            if (loans[i].borrower == _borrower && loans[i].status == LoanStatus.Active) {
                count++;
            }
        }
        
        // Create array of loan IDs
        uint256[] memory activeLoanIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < numberOfLoans; i++) {
            if (loans[i].borrower == _borrower && loans[i].status == LoanStatus.Active) {
                activeLoanIds[index] = i;
                index++;
            }
        }
        
        return activeLoanIds;
    }
    
    function getLoansByLender(address _lender) public view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count loans funded by lender
        for (uint256 i = 0; i < numberOfLoans; i++) {
            for (uint256 j = 0; j < loans[i].lenders.length; j++) {
                if (loans[i].lenders[j] == _lender) {
                    count++;
                    break;
                }
            }
        }
        
        // Create array of loan IDs
        uint256[] memory lenderLoanIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < numberOfLoans; i++) {
            for (uint256 j = 0; j < loans[i].lenders.length; j++) {
                if (loans[i].lenders[j] == _lender) {
                    lenderLoanIds[index] = i;
                    index++;
                    break;
                }
            }
        }
        
        return lenderLoanIds;
    }
    
    function getLoanDetails(uint256 _loanId) public view returns (
        address borrower,
        string memory purpose,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        uint256 startTime,
        uint256 endTime,
        uint256 amountRepaid,
        LoanStatus status,
        uint256 totalContributed
    ) {
        require(_loanId < numberOfLoans, "Loan does not exist");
        
        Loan storage loan = loans[_loanId];
        
        uint256 totalContrib = 0;
        for (uint256 i = 0; i < loan.contributions.length; i++) {
            totalContrib += loan.contributions[i];
        }
        
        return (
            loan.borrower,
            loan.purpose,
            loan.amount,
            loan.interestRate,
            loan.duration,
            loan.startTime,
            loan.endTime,
            loan.amountRepaid,
            loan.status,
            totalContrib
        );
    }
    
    function getBorrowerReputation(address _borrower) public view returns (
        uint256 reputation,
        uint256 totalLoans,
        uint256 defaultedLoans
    ) {
        return (
            borrowerReputation[_borrower],
            borrowerLoansCount[_borrower],
            borrowerDefaultsCount[_borrower]
        );
    }
}