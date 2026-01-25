import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("RewardSystem", function () {
    async function deployRewardSystemFixture(){
        const [admin, user, medlem1, medlem2] = await ethers.getSigners();

        const RewardSystem = await ethers.getContractFactory("RewardSystem");
        const rewardSystem = await RewardSystem.deploy();
        await rewardSystem.waitForDeployment();

        return { rewardSystem, admin, user, medlem1, medlem2 };
    }

describe("Deployment", function (){
        it("should set the deployer as admin and reward costs", async () =>{
            const { rewardSystem, admin } = await deployRewardSystemFixture();

            expect(await rewardSystem.admin()).to.equal(admin.address);

            expect(await rewardSystem.rewardCost(0)).to.equal(100);
            expect(await rewardSystem.rewardCost(1)).to.equal(50);
            expect(await rewardSystem.rewardCost(2)).to.equal(25);
        });
    });

describe("join", function (){
        it("should allow a user to join as a member", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await expect (rewardSystem.connect(medlem1).join())
            .to.emit(rewardSystem, "MemberJoined")
            .withArgs(medlem1.address);

            const member = await rewardSystem.members(medlem1.address);
            expect(member.exists).to.equal(true);
            expect(member.points).to.equal(0);

            expect(await rewardSystem.isMember(medlem1.address)).to.equal(true);
        });

    it("should revert if user joins twice", async () =>{
        const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

        await rewardSystem.connect(medlem1).join();
        await expect(rewardSystem.connect(medlem1).join())
            .to.be.revertedWithCustomError(rewardSystem, "AlreadyMember");
    });
});

describe("earnPoints", function (){
    it("should revert if a caller is not a member", async () =>{
        const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

        await expect(rewardSystem.connect(medlem1).earnPoints(10))
            .to.be.revertedWithCustomError(rewardSystem, "NotMember");
    });

    it("should revert if amount is 0", async () => {
        const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

        await rewardSystem.connect(medlem1).join();

        await expect(rewardSystem.connect(medlem1).earnPoints(0))
            .to.be.revertedWithCustomError(rewardSystem, "InvalidAmount");
    });
    it("should add points and emit PointsEarned", async () => {
        const { rewardSystem, medlem1, medlem2 } = await deployRewardSystemFixture();

        await rewardSystem.connect(medlem1).join();
        await rewardSystem.connect(medlem2).join();

        await expect(rewardSystem.connect(medlem1).transferPoints(medlem2.address, 0))
            .to.be.revertedWithCustomError(rewardSystem, "InvalidAmount");
    });
    it("should revert if insufficient points", async () => {
        const { rewardSystem, medlem1, medlem2 } = await deployRewardSystemFixture();

        await rewardSystem.connect(medlem1).join();
        await rewardSystem.connect(medlem2).join();

        await rewardSystem.connect(medlem1).earnPoints(5);

        await expect(rewardSystem.connect(medlem1).transferPoints(medlem2.address,10))
            .to.be.revertedWithCustomError(rewardSystem, "InsufficientPoints")
            .withArgs(5,10);
    });

    it("should transfer points and emit PointsTransferred", async () => {
        const { rewardSystem, medlem1, medlem2 } = await deployRewardSystemFixture();

        await rewardSystem.connect(medlem1).join();
        await rewardSystem.connect(medlem2).join();

        await rewardSystem.connect(medlem1).earnPoints(100);

        await expect(rewardSystem.connect(medlem1).transferPoints(medlem2.address, 30))
            .to.emit(rewardSystem, "PointsTransferred")
            .withArgs(medlem1.address, medlem2.address, 30);

        expect((await rewardSystem.members(medlem1.address)).points).to.equal(70);
        expect((await rewardSystem.members(medlem2.address)).points).to.equal(30);
        });
    });
    
    describe("redeem", function (){
        it("should revert if caller is not a member", async () =>{
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await expect(rewardSystem.connect(medlem1).redeem(0))
                .to.be.revertedWithCustomError(rewardSystem, "NotMember");
        });

        it("should revert if insufficient points", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join();
            await rewardSystem.connect(medlem1).earnPoints(20);

            await expect(rewardSystem.connect(medlem1).redeem(0))
                .to.be.revertedWithCustomError(rewardSystem, "InsufficientPoints")
                .withArgs(20, 100);
            });
        it("should redeem VIP and emit RewardRedeemed", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join();
            await rewardSystem.connect(medlem1).earnPoints(150);

            await expect(rewardSystem.connect(medlem1).redeem(0))
                .to.emit(rewardSystem, "RewardRedeemed")
                .withArgs(medlem1.address, 0, 100);
            expect((await rewardSystem.members(medlem1.address)).points).to.equal(50);
        });

        it("should redeem HOODIES and decrease correct points", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join();
            await rewardSystem.connect(medlem1).earnPoints(30);

            await expect(rewardSystem.connect(medlem1).redeem(2))
                .to.emit(rewardSystem, "RewardRedeemed")
                .withArgs(medlem1.address, 2, 25);

            expect((await rewardSystem.members(medlem1.address)).points).to.equal(5);
        });
    });

    describe("receive / Fallback", function(){
        it("should revert when sending ETH directly", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await expect(
                medlem1.sendTransaction({
                    to: await rewardSystem.getAddress(),
                    value: ethers.parseEther("0.001"),
                })
            ).to.be.revertedWith("No ETH accepted");
        });
        it("should revert when calling non-existing function", async () => {
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await expect(
                medlem1.sendTransaction({
                    to: await rewardSystem.getAddress(),
                    data: "0x12345678",
                })
            ).to.be.revertedWith("Invalid Call");
        });
    });
    describe("Reverts (custom errors)", function (){
        it("onlyAdmin: should revert NotAdmin when non-admin calls grantPoints", async () =>{
           const { rewardSystem, user, medlem1 } = await deployRewardSystemFixture();
           
           await expect(rewardSystem.connect(user).grantPoints(medlem1.address, 10))
                .to.be.revertedWithCustomError(rewardSystem, "NotAdmin");
        });

        it("grantPoints: should revert NotMember when 'to' is not a member", async ()=>{
            const { rewardSystem, admin, medlem1 }= await deployRewardSystemFixture();

            await expect(rewardSystem.connect(admin).grantPoints(medlem1.address, 10))
                .to.be.revertedWithCustomError(rewardSystem, "NotMember");
        });

        it("grantPoints: should revert InvalidAmount when amount is 0", async () =>{
            const { rewardSystem, admin, medlem1 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join(); //annars hade NotMember triggat först
            await expect(rewardSystem.connect(admin).grantPoints(medlem1.address, 0))
                .to.be.revertedWithCustomError(rewardSystem, "InvalidAmount");
        });

        it("transferPoints: should revert SelfTransfer when sending to self", async () =>{
            const { rewardSystem, medlem1 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join(); //annars NotMember på OnlyMember
            await expect(rewardSystem.connect(medlem1).transferPoints(medlem1.address, 1))
                .to.be.revertedWithCustomError(rewardSystem, "SelfTransfer");
        });
        it("TransferPoints: should revert NotMember when receiver is not a member", async ()=>{
            const { rewardSystem, medlem1, medlem2 } = await deployRewardSystemFixture();

            await rewardSystem.connect(medlem1).join();
            await rewardSystem.connect(medlem1).earnPoints(10);

            //Medlem har inte joinat => ska trigga NotMember
            await expect(rewardSystem.connect(medlem1).transferPoints(medlem2.address, 1))
                .to.be.revertedWithCustomError(rewardSystem, "NotMember");
        });
        it("grantPoints: should increase member points and emit PointsGranted", async ()=>{
            const { rewardSystem, admin, medlem1 } = await deployRewardSystemFixture();
            await rewardSystem.connect(medlem1).join();

            await expect(
            rewardSystem.connect(admin).grantPoints(medlem1.address, 25)
            ).to.emit(rewardSystem, "PointsGranted")
            .withArgs(admin.address, medlem1.address, 25);
            
            const member = await rewardSystem.members(medlem1.address);
            expect(member.points).to.equal(25);
        });
    });
});