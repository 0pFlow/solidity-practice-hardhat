// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

contract HelloWorld {
    // State variabel av typen string.
    string public message;

    constructor(string memory initMessage){
        message = initMessage;
    }

    // Write funktion.
    // Vi skickar in en string som en parameter/lokal variabel (newMessage) och uppdaterar vår state variabel (message).
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    // Read funktion.
    // Endast i demo syfte. Eftersom state variabeln message är public kan vi redan läsa av värdet utan att skriva en egen funktion.
    function getMessage() public view returns(string memory) {
        return message;
    }
}