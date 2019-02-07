pragma solidity ^0.5.0;

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/digital-oracles-prototype/node_modules/openzeppelin-solidity/contracts/access/Roles.sol

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
    struct Role {
        mapping (address => bool) bearer;
    }

    /**
     * @dev give an account access to this role
     */
    function add(Role storage role, address account) internal {
        require(account != address(0));
        require(!has(role, account));

        role.bearer[account] = true;
    }

    /**
     * @dev remove an account's access to this role
     */
    function remove(Role storage role, address account) internal {
        require(account != address(0));
        require(has(role, account));

        role.bearer[account] = false;
    }

    /**
     * @dev check if an account has this role
     * @return bool
     */
    function has(Role storage role, address account) internal view returns (bool) {
        require(account != address(0));
        return role.bearer[account];
    }
}

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/digital-oracles-prototype/node_modules/openzeppelin-solidity/contracts/access/roles/WhitelistAdminRole.sol

/**
 * @title WhitelistAdminRole
 * @dev WhitelistAdmins are responsible for assigning and removing Whitelisted accounts.
 */
contract WhitelistAdminRole {
    using Roles for Roles.Role;

    event WhitelistAdminAdded(address indexed account);
    event WhitelistAdminRemoved(address indexed account);

    Roles.Role private _whitelistAdmins;

    constructor () internal {
        _addWhitelistAdmin(msg.sender);
    }

    modifier onlyWhitelistAdmin() {
        require(isWhitelistAdmin(msg.sender));
        _;
    }

    function isWhitelistAdmin(address account) public view returns (bool) {
        return _whitelistAdmins.has(account);
    }

    function addWhitelistAdmin(address account) public onlyWhitelistAdmin {
        _addWhitelistAdmin(account);
    }

    function renounceWhitelistAdmin() public {
        _removeWhitelistAdmin(msg.sender);
    }

    function _addWhitelistAdmin(address account) internal {
        _whitelistAdmins.add(account);
        emit WhitelistAdminAdded(account);
    }

    function _removeWhitelistAdmin(address account) internal {
        _whitelistAdmins.remove(account);
        emit WhitelistAdminRemoved(account);
    }
}

// File: openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol

/**
 * @title WhitelistedRole
 * @dev Whitelisted accounts have been approved by a WhitelistAdmin to perform certain actions (e.g. participate in a
 * crowdsale). This role is special in that the only accounts that can add it are WhitelistAdmins (who can also remove
 * it), and not Whitelisteds themselves.
 */
contract WhitelistedRole is WhitelistAdminRole {
    using Roles for Roles.Role;

    event WhitelistedAdded(address indexed account);
    event WhitelistedRemoved(address indexed account);

    Roles.Role private _whitelisteds;

    modifier onlyWhitelisted() {
        require(isWhitelisted(msg.sender));
        _;
    }

    function isWhitelisted(address account) public view returns (bool) {
        return _whitelisteds.has(account);
    }

    function addWhitelisted(address account) public onlyWhitelistAdmin {
        _addWhitelisted(account);
    }

    function removeWhitelisted(address account) public onlyWhitelistAdmin {
        _removeWhitelisted(account);
    }

    function renounceWhitelisted() public {
        _removeWhitelisted(msg.sender);
    }

    function _addWhitelisted(address account) internal {
        _whitelisteds.add(account);
        emit WhitelistedAdded(account);
    }

    function _removeWhitelisted(address account) internal {
        _whitelisteds.remove(account);
        emit WhitelistedRemoved(account);
    }
}

// File: contracts/DigitalOracles.sol

contract DigitalOracles is WhitelistedRole {

    struct Contract {
        uint256 contractId;     // The contract ID
        uint256 creationDate;   // When the contract was created
        uint256 partyA;         // Party B ID
        uint256 partyB;         // Party A ID
        State state;            // The contract state
        string contractData;   // The IPFS hash of the approved contract
    }

    enum State {Blank, Pending, Approved, Terminated}

    ////////////
    // Events //
    ////////////

    event ContractCreated(uint256 indexed contractId, uint256 indexed partyA);
    event ContractPartyBAdded(uint256 indexed contractId, uint256 indexed partyB);
    event ContractApproved(uint256 indexed contractId, string indexed contractData);
    event ContractStateChanged(uint256 indexed contractId, State indexed state);
    event ContractTerminated(uint256 indexed contractId);
    event InvoiceAdded(uint256 indexed contractId, uint256 indexed invoiceId);

    // Contract ID -> Contract
    mapping(uint256 => Contract) contracts;

    // Contract ID -> Invoice IDs
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
        contracts[_contractId] = Contract(_contractId, now, _partyA, 0, State.Pending, "");

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

    function setContractState(uint256 _contractId, State _state)
    onlyWhitelisted
    public returns (uint256 _id) {
        require(_contractId != 0, "Invalid contract ID");
        require(contracts[_contractId].state == State.Blank, "Contract not created");

        contracts[_contractId].state = _state;

        emit ContractStateChanged(_contractId, _state);

        return _contractId;
    }

    function approveContract(uint256 _contractId, uint256 _partyB, string memory _contractData)
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

    function approveContract(uint256 _contractId, uint256 _partyB, string memory _contractData, uint256 _invoiceId)
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
    external view
    returns (uint256 creationDate, uint256 partyA, uint256 partyB, State state, string memory contractData, uint256[] memory invoiceIds) {
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
    external view
    returns (uint256[] memory invoiceIds) {
        return invoices[_contractId];
    }

}
