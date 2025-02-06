// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {ISignatureUtils} from "eigenlayer-contracts/src/contracts/interfaces/ISignatureUtils.sol";
import {IAVSDirectory} from "eigenlayer-contracts/src/contracts/interfaces/IAVSDirectory.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

contract SAMServiceManager {
    using ECDSA for bytes32;

    // State Variables
    address public immutable avsDirectory;
    uint32 public latestTaskNum;
    mapping(address => bool) public operatorsRegistered;
    mapping(uint32 => bytes32) public allTaskHashes;
    mapping(address => mapping(uint32 =>bytes)) public allTaskResponses;

    // Events
    event NewTaskCreated(uint32 indexed taskIndex, Task task);

    event TaskResponded(
        uint32 indexed taskIndex,
        Task task,
        bytes response,
        address operator
    );

    // Types
    struct Task {
        string imageUrl;
        string longitude;
        string latitude;
        uint32 taskCreatedBlock;
    }

    // Modifier
    modifier onlyOperator() {
        require(operatorsRegistered[msg.sender], "Operator not registered");
        _;
    }

    // Constructor
    constructor(address _avsDirectory) {
        avsDirectory = _avsDirectory;
    }

    // Function to Register Operator
    function registerOperatorToAVS(
        address operator,
        ISignatureUtils.SignatureWithSaltAndExpiry memory operatorSignature
    ) external {
            IAVSDirectory(avsDirectory).registerOperatorToAVS(operator, operatorSignature);
            operatorsRegistered[operator] = true;
    }

    // Function to Deregister Operator
    function deregisterOperatorFromAVS(address operator) external onlyOperator {
        require(msg.sender == operator);
        IAVSDirectory(avsDirectory).deregisterOperatorFromAVS(operator);
        operatorsRegistered[operator] = false;
    }

    // Create Sighting / Task
    function createNewTask(
        string memory imageUrl,
        string memory longitude,
        string memory latitude 
    ) external returns (Task memory) {
        // Create newTask struct with given parameters
        Task memory newTask;
        newTask.imageUrl = imageUrl;
        newTask.longitude = longitude;
        newTask.latitude = latitude;
        newTask.taskCreatedBlock = uint32(block.number);

        // store hash of task onchain, emit event and increment latestTaskNum
        allTaskHashes[latestTaskNum] = keccak256(abi.encode(newTask));
        emit NewTaskCreated(latestTaskNum, newTask);
        latestTaskNum += 1;

        return newTask;
    }
    // Respond to Sighting / Task
    function respondToTask(
        Task calldata task,
        uint32 referenceTaskIndex,
        bytes memory response,
        bytes memory signature
    ) external onlyOperator {
        require(keccak256(abi.encode(task)) == allTaskHashes[referenceTaskIndex], "Task hash mismatch: Wrong task");
        require(allTaskResponses[msg.sender][referenceTaskIndex].length == 0, "Operator has already responded to this task");

        // Verify message with signature
        bytes32 messageHash = keccak256(abi.encodePacked(response, task.imageUrl, task.longitude, task.latitude));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        if (ethSignedMessageHash.recover(signature) != msg.sender) {
            revert("Invalid signature");
        }

        // Update allTaskResponses mapping with signature
        allTaskResponses[msg.sender][referenceTaskIndex] = signature;

        // Emit event
        emit TaskResponded(referenceTaskIndex, task, response, msg.sender);

    }
}