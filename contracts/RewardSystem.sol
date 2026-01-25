// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

enum RewardType {
    VIP, TICKETS, HOODIES
}

contract RewardSystem {
    
    error NotAdmin();
    error NotMember();
    error AlreadyMember();
    error InvalidAmount();
    error InsufficientPoints(uint256 have, uint256 need);
    error SelfTransfer();

    struct Member {
        uint256 points;
        bool exists;
    }

    address public immutable admin;
    mapping(address => Member) public members;
    mapping(RewardType => uint256) public rewardCost;

    event MemberJoined(address indexed member);
    event PointsEarned(address indexed member, uint256 points);
    event PointsGranted(address indexed admin, address indexed member, uint256 amount);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);
    event RewardRedeemed(address indexed member, RewardType reward, uint256 cost);

    modifier onlyAdmin(){
        if(msg.sender !=admin) revert NotAdmin();
        _;
    }
    modifier onlyMember(){
        if(!members[msg.sender].exists)revert NotMember();
        _;
    }

    constructor(){
        admin = msg.sender;

        rewardCost[RewardType.VIP] = 100;
        rewardCost[RewardType.TICKETS] = 50;
        rewardCost[RewardType.HOODIES] = 25;
    }

    function join() external {
        if(members[msg.sender].exists) revert AlreadyMember();
        members[msg.sender] = Member({points:0, exists:true});

        emit MemberJoined(msg.sender);
    }

    function earnPoints(uint256 amount) external onlyMember {
        if(amount ==0) revert InvalidAmount();

        members[msg.sender].points += amount;
        emit PointsEarned(msg.sender, amount);

        assert(members[msg.sender].points >= amount);
    }
    function grantPoints(address to, uint256 amount) external onlyAdmin {
        if(!members[to].exists) revert NotMember();
        if(amount ==0) revert InvalidAmount();

        members[to].points += amount;
        emit PointsGranted(msg.sender, to, amount);
    }
    function transferPoints(address to, uint256 amount) external onlyMember {
        if(to == msg.sender) revert SelfTransfer();
        if(!members[to].exists) revert NotMember();
        if(amount ==0) revert InvalidAmount();

        uint256 fromBalance = members[msg.sender].points;
        if(fromBalance < amount) revert InsufficientPoints(fromBalance, amount);

        unchecked {
            members[msg.sender].points = fromBalance - amount;
        }
        members[to].points += amount;
        emit PointsTransferred(msg.sender, to, amount);    
    }

    function isMember(address user) external view returns(bool){
        return members[user].exists;
    }

    function redeem(RewardType reward) external onlyMember {
        uint256 cost = rewardCost[reward];
        require(cost >0, "Invalid Reward");

        uint256 balance = members[msg.sender].points;
        if(balance < cost) revert InsufficientPoints(balance, cost);
        unchecked {
            members[msg.sender].points = balance - cost;
        }

        emit RewardRedeemed(msg.sender, reward, cost);
    }

    receive() external payable{
        revert("No ETH accepted");
    }
    fallback() external payable{
        revert("Invalid Call");
    }
}