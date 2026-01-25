import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("HelloWorld", function(){
    async function deployHelloWorldFixture(){
        const initialMessage = "Hello World!"
        const HelloWorld = await ethers.getContractFactory("HelloWorld");
        const helloWorld = await HelloWorld.deploy(initialMessage);

        return { helloWorld, initialMessage };
    }

    describe("Deployment", function(){
        it("should set the correct initial message", async function() {
            const { helloWorld, initialMessage } = await deployHelloWorldFixture();

            expect(await helloWorld.message()).to.equal(initialMessage);
            console.log("The initial message is:", initialMessage);
        });
    });
    describe("Update Message", function(){
        it("should update the message correctly", async function(){
            const { helloWorld, initialMessage } = await deployHelloWorldFixture();
            const newMessage = "BCU25D";

            expect(await helloWorld.message()).to.equal(initialMessage);

            await helloWorld.setMessage(newMessage);
            expect(await helloWorld.message()).to.equal(newMessage);
        });

        it("should allow multiple updates", async function(){
            const { helloWorld } = await deployHelloWorldFixture();
            const firstMessage ="this is the first message";
            const secondMessage = "this is the second message";

            await helloWorld.setMessage(firstMessage);
            expect(await helloWorld.message()).to.equal(firstMessage);

            await helloWorld.setMessage(secondMessage);
            expect(await helloWorld.message()).to.equal(secondMessage);
        });  
    });

    describe("retrieve message", function(){
        it ("should return the current message", async function(){
            const { helloWorld, initialMessage } = await deployHelloWorldFixture();
            const newMessage = "New Message!";

            expect(await helloWorld.message()).to.equal(initialMessage);

            await helloWorld.setMessage(newMessage);

            expect(await helloWorld.getMessage()).to.equal(newMessage);
        });
    });
});