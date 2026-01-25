import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("AccessControl", function (){
    async function deployAccessControlFixture() {
        const [ owner, notOwner ] = await ethers.getSigners();
        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.deploy();

        return { accessControl, owner, notOwner };
    };

    describe("deployment", function (){
        it("should set the deployer as admin", async function(){
            const {accessControl, owner} = await deployAccessControlFixture();
            expect(await accessControl.admins(owner.address)).to.be.true;
        });
    });

    describe("setRole", function (){
        it("should allow admin to set role", async function(){
            const { accessControl, notOwner } = await deployAccessControlFixture();

            expect(await accessControl.admins(notOwner.address)).to.be.false;

            await expect(accessControl.assignAdminRole(notOwner.address,))
                .to.emit(accessControl, "RoleAssigned")
                .withArgs(notOwner.address, "Admin");

            expect(await accessControl.admins(notOwner.address)).to.be.true;
        });

        it("should allow admin to assign supporter role", async function(){
            const { accessControl, notOwner } = await deployAccessControlFixture();

            expect(await accessControl.supporters(notOwner.address)).to.be.false;

            await expect(accessControl.assignOtherRole(notOwner.address, "Supporter"))
                .to.emit(accessControl, "RoleAssigned")
                .withArgs(notOwner.address, "Supporter");
            expect(await accessControl.supporters(notOwner.address)).to.be.true;
        });

        it("should allow the admin to assign member role", async function(){
            const { accessControl, notOwner } = await deployAccessControlFixture();
            expect(await accessControl.members(notOwner.address)).to.be.false;

            await expect(accessControl.assignOtherRole(notOwner.address, "Member"))
                .to.emit(accessControl, "RoleAssigned")
                .withArgs(notOwner.address, "Member");

            expect(await accessControl.members(notOwner.address)).to.be.true;
        });

        it("should not allow an admin to assign an invalid role", async function(){
            const { accessControl, notOwner } = await deployAccessControlFixture();

            await expect(accessControl.assignOtherRole(notOwner.address, "InvalidRole"))
                .to.be.revertedWith("Invalid role. Please try again!")
        });

        it("should not allow non-admin to set role", async function(){
            const { accessControl, owner, notOwner } = await deployAccessControlFixture();

            await expect(accessControl.connect(notOwner).assignOtherRole(owner.address, "Member"))
                .to.be.revertedWith("You are not an admin and cannot call this function!");
        });
    });
});