pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DigitalOraclesOld is Ownable {

    struct Party {
        uint256 id;
        uint256 creationDate;
        string name;
        bool active;
    }

    struct ContractType {
        uint256 id;
        uint256 creationDate;
        string name;
        bool active;
    }

    struct Contract {
        uint256 id;
        uint256 creationDate;
        string name;
        uint256 contractType;
        uint256 partyA;
        uint256 partyB;
        bool active;
    }

    struct Approval {
        uint256 partyId;
        ApprovalState state;
        uint256 updateDatetime;
    }

    struct Settlement {
        ApprovalState state;
        uint256 updateDatetime;
        Approval partyAApproval;
        Approval partyBApproval;
    }

    enum ApprovalState {Pending, Approved, Rejected}

    ////////////
    // Events //
    ////////////

    event ContractTypeAdded(uint256 indexed id);
    event ContractTypeUpdated(uint256 indexed id);
    event ContractTypeDisabled(uint256 indexed id);
    event ContractTypeEnabled(uint256 indexed id);

    event PartyAdded(uint256 indexed id);
    event PartyUpdated(uint256 indexed id);
    event PartyEnabled(uint256 indexed id);
    event PartyDisabled(uint256 indexed id);

    event ContractAdded(uint256 indexed id);
    event ContractUpdated(uint256 indexed id);
    event ContractEnabled(uint256 indexed id);
    event ContractDisabled(uint256 indexed id);

    // type ID -> ContractType
    mapping(uint256 => ContractType) contractTypes;

    // party ID -> Party
    mapping(uint256 => Party) parties;

    // contract ID -> Contract
    mapping(uint256 => Contract) contractToContract;

    // contract ID -> Settlement
    mapping(uint256 => Settlement) contractToSettlement;

    ///////////////////////////
    // Contract Types Setup //
    ///////////////////////////

    function createContractType(uint256 contractTypeId, string memory name, bool active) public onlyOwner returns (uint256 _id) {
        require(contractTypeId != 0, "Invalid ID");
        require(contractTypes[contractTypeId].id == 0, "Cant create a type with the same ID");

        contractTypes[contractTypeId] = ContractType(contractTypeId, now, name, active);

        emit ContractTypeAdded(contractTypeId);

        return contractTypeId;
    }

    function updateContractType(uint256 contractTypeId, string memory name) public onlyOwner returns (uint256 _id) {
        require(contractTypes[contractTypeId].id != 0, "Cant create a type with the same ID");

        contractTypes[contractTypeId].name = name;

        emit ContractTypeUpdated(contractTypeId);

        return contractTypeId;
    }

    function disableContractType(uint256 contractTypeId) public onlyOwner returns (uint256 _id)  {
        require(contractTypes[contractTypeId].id != 0, "Invalid ID");

        contractTypes[contractTypeId].active = false;

        emit ContractTypeDisabled(contractTypeId);

        return contractTypeId;
    }

    function enableContractType(uint256 contractTypeId) public onlyOwner returns (uint256 _id)  {
        require(contractTypes[contractTypeId].id != 0, "Invalid ID");

        contractTypes[contractTypeId].active = true;

        emit ContractTypeEnabled(contractTypeId);

        return contractTypeId;
    }

    /////////////////
    // Party Setup //
    /////////////////

    function createParty(uint256 partyId, string memory name, bool active) public onlyOwner returns (uint256 _id) {
        require(partyId != 0, "Invalid ID");
        require(parties[partyId].id == 0, "Cant create a party with the same ID");

        parties[partyId] = Party(partyId, now, name, active);

        emit PartyAdded(partyId);

        return partyId;
    }

    function updateParty(uint256 partyId, string memory name) public onlyOwner returns (uint256 _id) {
        require(parties[partyId].id != 0, "Cant create a party with the same ID");

        parties[partyId].name = name;

        emit PartyUpdated(partyId);

        return partyId;
    }

    function disableParty(uint256 partyId) public onlyOwner returns (uint256 _id) {
        require(parties[partyId].id != 0, "Invalid ID");

        parties[partyId].active = false;

        emit PartyDisabled(partyId);

        return partyId;
    }

    function enableParty(uint256 partyId) public onlyOwner returns (uint256 _id) {
        require(parties[partyId].id != 0, "Invalid ID");

        parties[partyId].active = true;

        emit PartyEnabled(partyId);

        return partyId;
    }

    /////////////////////
    // Contract Setup //
    /////////////////////

    function createContract(uint256 contractId, string memory name, uint256 contractTypeId, uint256 partyAId, uint256 partyBId) public onlyOwner returns (uint256 _id) {
        require(contractId != 0, "Invalid ID");
        require(contractToContract[contractId].id == 0, "Cant create a contract with the same ID");
        require(parties[partyAId].id != 0, "Invalid Party A ID");
        require(parties[partyBId].id != 0, "Invalid Party B ID");
        require(contractTypes[contractTypeId].id != 0, "Invalid contract type ID");

        // Create Contract
        contractToContract[contractId] = Contract(contractId, now, name, contractTypeId, partyAId, partyBId, true);

        // Default settlement
        contractToSettlement[contractId].partyAApproval = Approval(partyAId, ApprovalState.Pending, 0);
        contractToSettlement[contractId].partyBApproval = Approval(partyBId, ApprovalState.Pending, 0);

        emit ContractAdded(contractId);

        return contractId;
    }

    // FIXME this is really a reset?
    function updateContract(uint256 contractId, string memory name, uint256 contractTypeId, uint256 partyAId, uint256 partyBId) public onlyOwner returns (uint256 _id) {
        require(contractId != 0, "Invalid ID");
        require(contractToContract[contractId].id != 0, "Cant create a contract with the same ID");
        require(parties[partyAId].id != 0, "Invalid Party A ID");
        require(parties[partyBId].id != 0, "Invalid Party B ID");
        require(contractTypes[contractTypeId].id != 0, "Invalid contract type ID");

        contractToContract[contractId] = Contract(contractId, now, name, contractTypeId, partyAId, partyBId, true);

        emit ContractUpdated(contractId);

        return contractId;
    }

    function disableContract(uint256 contractId) public onlyOwner returns (uint256 _id) {
        require(contractToContract[contractId].id != 0, "Invalid ID");

        contractToContract[contractId].active = false;

        emit ContractDisabled(contractId);

        return contractId;
    }

    function enableContract(uint256 contractId) public onlyOwner returns (uint256 _id) {
        require(contractToContract[contractId].id != 0, "Invalid ID");

        contractToContract[contractId].active = true;

        emit ContractEnabled(contractId);

        return contractId;
    }

    /////////////////////////
    // Contract Settlement //
    /////////////////////////

    function settleContract(uint256 contractId, uint256 partyId, ApprovalState state) public onlyOwner returns (uint256 _id) {
        require(contractId != 0, "Invalid ID");

        Contract storage con = contractToContract[contractId];
        require(con.id != 0, "No contract found");

        Settlement storage settlement = contractToSettlement[contractId];

        if (con.partyA == partyId) {
            settlement.partyAApproval = Approval(partyId, state, now);
        }
        else if (con.partyB == partyId) {
            settlement.partyBApproval = Approval(partyId, state, now);
        }
        else {
            // throw error if no parties found to match for the provided party
            revert("No matched parties for the provided contract");
        }

        // Update to fully approved if match
        if (settlement.partyAApproval.state == ApprovalState.Approved && settlement.partyBApproval.state == ApprovalState.Approved) {
            settlement.state = ApprovalState.Approved;
        }
        // Update to fully rejected if match
        else if (settlement.partyAApproval.state == ApprovalState.Rejected && settlement.partyBApproval.state == ApprovalState.Rejected) {
            settlement.state = ApprovalState.Rejected;
        }
        else {
            settlement.state = ApprovalState.Pending;
        }

        // Always save last updated
        settlement.updateDatetime = now;

        return contractId;
    }

    ///////////////////
    // Query Methods //
    ///////////////////

    function getContractType(uint256 _id)
    public view
    returns (uint256 id, uint256 creationDate, string memory name, bool active) {
        ContractType memory _contractType = contractTypes[_id];
        return (
        _contractType.id,
        _contractType.creationDate,
        _contractType.name,
        _contractType.active
        );
    }

    function getParty(uint256 _id)
    public view
    returns (uint256 id, uint256 creationDate, string memory name, bool active) {
        Party memory _party = parties[_id];
        return (
        _party.id,
        _party.creationDate,
        _party.name,
        _party.active
        );
    }

    function getContract(uint256 _id)
    public view
    returns (uint256 id, uint256 creationDate, string memory name, uint256 contractType, uint256 partyA, uint256 partyB, bool active) {
        Contract memory _contract = contractToContract[_id];
        return (
        _contract.id,
        _contract.creationDate,
        _contract.name,
        _contract.contractType,
        _contract.partyA,
        _contract.partyB,
        _contract.active
        );
    }

    function getSettlement(uint256 _id)
    public view
    returns (
        ApprovalState state,
        uint256 updateDatetime,
        uint256 partyA,
        ApprovalState partyAState,
        uint256 partyAUpdateDatetime,
        uint256 partyB,
        ApprovalState partyBState,
        uint256 partyBUpdateDatetime
    ) {
        Settlement memory _settlement = contractToSettlement[_id];
        return (
        _settlement.state,
        _settlement.updateDatetime,
        _settlement.partyAApproval.partyId,
        _settlement.partyAApproval.state,
        _settlement.partyAApproval.updateDatetime,
        _settlement.partyBApproval.partyId,
        _settlement.partyBApproval.state,
        _settlement.partyBApproval.updateDatetime
        );
    }

}
