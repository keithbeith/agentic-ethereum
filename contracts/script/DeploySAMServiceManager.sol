// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {Script} from "forge-std/Script.sol";
import {SAMServiceManager} from "../src/SAMServiceManager.sol";
import {IDelegationManager} from "eigenlayer-contracts/src/contracts/interfaces/IDelegationManager.sol";
import {AVSDirectory} from "eigenlayer-contracts/src/contracts/core/AVSDirectory.sol";
import {ISignatureUtils} from "eigenlayer-contracts/src/contracts/interfaces/ISignatureUtils.sol";

contract DeploySAMServiceManager is Script {
    address internal constant AVS_DIRECTORY = 0x055733000064333CaDDbC92763c58BF0192fFeBf;
    address internal constant DELEGATION_MANAGER = 0xA44151489861Fe9e3055d95adC98FbD462B948e7;

    address internal deployer;
    address internal operator;
    SAMServiceManager samServiceManager;

    // Setup section
    function setUp() public virtual {
        deployer = vm.rememberKey(vm.envUint("PRIVATE_KEY"));
        operator = vm.rememberKey(vm.envUint("OPERATOR_KEY"));
        vm.label(deployer, "Deployer");
        vm.label(operator, "Operator");
    }

    // Deploy section
    function run() public virtual {
        // Deploy SAMServiceManager
        vm.startBroadcast(deployer);
        samServiceManager = new SAMServiceManager(AVS_DIRECTORY);
        vm.stopBroadcast();

        // Register Operator
        IDelegationManager delegationManager = IDelegationManager(DELEGATION_MANAGER);
        vm.startBroadcast(operator);
        delegationManager.registerAsOperator(operator, 0, "");
        vm.stopBroadcast();

        // Register Operator to SAM AVS
        AVSDirectory avsDirectory = AVSDirectory(AVS_DIRECTORY);
        bytes32 salt = keccak256(abi.encodePacked(block.timestamp, operator));
        uint256 expiry = block.timestamp + 1 hours;

        bytes32 operatorRegistrationDigestHash = avsDirectory.calculateOperatorAVSRegistrationDigestHash(operator, address(samServiceManager), salt, expiry);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(vm.envUint("OPERATOR_KEY"), operatorRegistrationDigestHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        ISignatureUtils.SignatureWithSaltAndExpiry memory operatorSignature = ISignatureUtils.SignatureWithSaltAndExpiry({
            signature: signature,
            salt: salt,
            expiry: expiry
        });

        vm.startBroadcast(operator);
        samServiceManager.registerOperatorToAVS(operator, operatorSignature);
        vm.stopBroadcast();  
    }
}