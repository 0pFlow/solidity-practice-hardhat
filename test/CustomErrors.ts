import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Custom Errors", function(){
    async function CustomErrorsFixture(){
        const [ownerAccount, notOwner] = await ethers.getSigners();
        const CustomErrorsFixture = await ethers.getContractFactory("CustomErrors");
        const customErrors = await CustomErrorsFixture.deploy();

        return { customErrors, ownerAccount, notOwner };    
    }

    describe("Deployment", function(){
        it("should set the right owner", async function(){
            const { customErrors, ownerAccount } = await CustomErrorsFixture();
            expect(await customErrors.owner()).to.equal(ownerAccount.address);




        });
    });

    describe("Update number", function(){
        it("should update valid number if called by owner", async function(){
            const { customErrors } = await CustomErrorsFixture();
            const validNumber = 12;

            await customErrors.setNumber(validNumber);
            expect(await customErrors.number()).to.equal(validNumber);
        });

        it("should not allow non-owner to update valid number", async function(){
            const { customErrors, notOwner } = await CustomErrorsFixture();
            const validNumber = 15;

            await expect(customErrors.connect(notOwner).setNumber(validNumber))
                .to.be.revertedWithCustomError(customErrors, "NotOwner")
                .withArgs(notOwner.address);
        });

        it("should not allow the owner to set a number below 10", async function(){
            const {customErrors} = await CustomErrorsFixture();
            const invalidNumber = 5;

            await expect(customErrors.setNumber(invalidNumber))
                .to.be.revertedWithCustomError(customErrors, "TooLow")
                .withArgs(invalidNumber, 10);
        });

        it("should keep the number despite invalid input", async function(){
            const { customErrors } = await CustomErrorsFixture();
            const validNumber = 12;
            const invalidNumber = 5;

            await customErrors.setNumber(validNumber);
            expect (await customErrors.number()).to.equal(validNumber);
            await expect(customErrors.setNumber(invalidNumber))
                .to.be.revertedWithCustomError(customErrors, "TooLow")
                .withArgs(invalidNumber, 10);
            
            expect(await customErrors.number()).to.equal(validNumber);
        })
    });
});