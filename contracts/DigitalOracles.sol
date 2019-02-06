pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

contract DigitalOracles is WhitelistedRole {

    struct Contract {
        uint256 contractId;     // The contract ID
        uint256 creationDate;   // When the contract was created
        uint256 partyA;         // Party B ID
        uint256 partyB;         // Party A ID
        State state;            // The contract state
        bytes32 contractData;   // The IPFS hash of the approved contract
    }

    enum State {Blank, Pending, Approved, Terminated}

    ////////////
    // Events //
    ////////////

    event ContractCreated(uint256 indexed contractId, uint256 indexed partyA);
    event ContractPartyBAdded(uint256 indexed contractId, uint256 indexed partyB);
    event ContractApproved(uint256 indexed contractId, bytes32 indexed contractData);
    event ContractTerminated(uint256 indexed contractId);
    event InvoiceAdded(uint256 indexed contractId, uint256 indexed invoiceId);

    // contract ID -> Contract
    mapping(uint256 => Contract) contracts;

    // contract ID -> invoice array
    mapping(uint256 => uint256[]) invoices;

    /////////////////
    // Constructor //
    /////////////////

    constructor () public{
        super.addWhitelisted(msg.sender);
    }

    /////////////////////
    // Contract Setup //
    /////////////////////

    function createContract(uint256 contractId, uint256 partyA)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(partyA != 0, "Invalid party ID");
        require(contracts[contractId].state == State.Blank, "Contract already created");

        // Create Contract
        contracts[contractId] = Contract(contractId, now, partyA, 0, State.Pending, bytes32(0x0));

        emit ContractCreated(contractId, partyA);

        return contractId;
    }

    function setPartyBToContract(uint256 contractId, uint256 partyB)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(partyB != 0, "Invalid party ID");
        require(contracts[contractId].state == State.Pending, "Contract not in pending state");

        // Update state
        contracts[contractId].partyB = partyB;

        emit ContractPartyBAdded(contractId, partyB);

        return contractId;
    }

    function approveContract(uint256 contractId, bytes32 contractData)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(contracts[contractId].state == State.Pending, "Contract not in pending state");
        require(contracts[contractId].partyA != 0 && contracts[contractId].partyB != 0, "Not all parties set on the contract");

        contracts[contractId].state = State.Approved;
        contracts[contractId].contractData = contractData;

        emit ContractApproved(contractId, contractData);

        return contractId;
    }

    function approveContract(uint256 contractId, uint256 partyB, bytes32 contractData)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(partyB != 0, "Invalid partyB ID");
        require(contracts[contractId].state == State.Pending, "Contract not in pending state");

        contracts[contractId].state = State.Approved;
        contracts[contractId].partyB = partyB;
        contracts[contractId].contractData = contractData;

        emit ContractApproved(contractId, contractData);

        return contractId;
    }

    function approveContract(uint256 contractId, uint256 partyB, bytes32 contractData, uint256 invoiceId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(partyB != 0, "Invalid partyB ID");
        require(contracts[contractId].state == State.Pending, "Contract not in pending state");

        contracts[contractId].state = State.Approved;
        contracts[contractId].partyB = partyB;
        contracts[contractId].contractData = contractData;

        invoices[contractId].push(invoiceId);

        emit ContractApproved(contractId, contractData);

        return contractId;
    }

    function terminateContract(uint256 contractId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(contracts[contractId].state == State.Pending, "Contract not in pending state");

        contracts[contractId].state = State.Terminated;

        emit ContractTerminated(contractId);

        return contractId;
    }


    function addInvoiceToContract(uint256 contractId, uint256 invoiceId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(contractId != 0, "Invalid contract ID");
        require(contracts[contractId].state == State.Pending || contracts[contractId].state == State.Approved, "Contract not in pending state");

        invoices[contractId].push(invoiceId);

        emit InvoiceAdded(contractId, invoiceId);

        return contractId;
    }

    ///////////////////
    // Query Methods //
    ///////////////////

    function getContract(uint256 _id)
    public view
    returns (uint256 creationDate, uint256 partyA, uint256 partyB, State state, bytes32 contractData, uint256[] memory invoiceIds) {
        Contract memory _contract = contracts[_id];
        return (
        _contract.creationDate,
        _contract.partyA,
        _contract.partyB,
        _contract.state,
        _contract.contractData,
        invoices[_id]
        );
    }

    function getContractInvoices(uint256 _id)
    public view
    returns (uint256[] memory invoiceIds) {
        return invoices[_id];
    }

}
