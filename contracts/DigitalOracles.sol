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

    function createContract(uint256 _contractId, uint256 _partyA)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(_partyA != 0, "Invalid party ID");
        require(contracts[_contractId].state == State.Blank, "Contract already created");

        // Create Contract
        contracts[_contractId] = Contract(_contractId, now, _partyA, 0, State.Pending, bytes32(0x0));

        emit ContractCreated(_contractId, _partyA);

        return _contractId;
    }

    function setPartyBToContract(uint256 _contractId, uint256 _partyB)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(_partyB != 0, "Invalid party ID");
        require(contracts[_contractId].state == State.Pending, "Contract not in pending state");

        // Update state
        contracts[_contractId].partyB = _partyB;

        emit ContractPartyBAdded(_contractId, _partyB);

        return _contractId;
    }

    // TODO add override method for state?

    function approveContract(uint256 _contractId, uint256 _partyB, bytes32 _contractData)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(_partyB != 0, "Invalid partyB ID");
        require(contracts[_contractId].state == State.Pending, "Contract not in pending state");

        contracts[_contractId].state = State.Approved;
        contracts[_contractId].partyB = _partyB;
        contracts[_contractId].contractData = _contractData;

        emit ContractApproved(_contractId, _contractData);

        return _contractId;
    }

    function approveContract(uint256 _contractId, uint256 _partyB, bytes32 _contractData, uint256 _invoiceId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(_partyB != 0, "Invalid partyB ID");
        require(contracts[_contractId].state == State.Pending, "Contract not in pending state");

        contracts[_contractId].state = State.Approved;
        contracts[_contractId].partyB = _partyB;
        contracts[_contractId].contractData = _contractData;

        invoices[_contractId].push(_invoiceId);

        emit ContractApproved(_contractId, _contractData);

        return _contractId;
    }

    function terminateContract(uint256 _contractId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(contracts[_contractId].state == State.Pending, "Contract not in pending state");

        contracts[_contractId].state = State.Terminated;

        emit ContractTerminated(_contractId);

        return _contractId;
    }


    function addInvoiceToContract(uint256 _contractId, uint256 _invoiceId)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(contracts[_contractId].state == State.Pending || contracts[_contractId].state == State.Approved, "Contract not in pending state");

        invoices[_contractId].push(_invoiceId);

        emit InvoiceAdded(_contractId, _invoiceId);

        return _contractId;
    }

    ///////////////////
    // Query Methods //
    ///////////////////

    function getContract(uint256 _contractId)
    public view
    returns (uint256 creationDate, uint256 partyA, uint256 partyB, State state, bytes32 contractData, uint256[] memory invoiceIds) {
        Contract memory _contract = contracts[_contractId];
        return (
        _contract.creationDate,
        _contract.partyA,
        _contract.partyB,
        _contract.state,
        _contract.contractData,
        invoices[_contractId]
        );
    }

    function getContractInvoices(uint256 _contractId)
    public view
    returns (uint256[] memory invoiceIds) {
        return invoices[_contractId];
    }

}
