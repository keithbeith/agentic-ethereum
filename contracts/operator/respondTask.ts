import {
    createPublicClient,
    createWalletClient,
    http,
    parseAbi,
    encodePacked,
    keccak256,
    parseAbiItem,
    AbiEvent,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import "dotenv";
import { Task } from "./createTask";

if (!process.env.OPERATOR_KEY) {
    throw new Error("OPERATOR_KEY is not defined");
}

const abi = parseAbi([
    `function respondToTask((string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task, uint32 referenceTaskIndex, bytes memory response, bytes memory signature)`,
    `event NewTaskCreated(uint256 taskId, (string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task)`,
]);

async function createSignature(
    account: any,
    sightingConfidence: number,
    imageUrl: string,
    longitude: string,
    latitude: string
) {
    const messageHash = keccak256(
        encodePacked(
            ["uint8", "string", "string", "string"],
            [sightingConfidence, imageUrl, longitude, latitude]
        )
    );

    const signature = await account.signMessage({
        message: { raw: messageHash },
    });

    return signature;
}

async function respondToTask(
    walletClient: any,
    publicClient: any,
    contractAddress: string,
    account: any,
    task: Task,
    taskIndex: number
) {
    try {
        // const response = await axios.get
        let sightingConfidence = 50;
        const signature = await createSignature(
            account,
            sightingConfidence,
            task.imageUrl,
            task.longitude,
            task.latitude
        );
        const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi,
            functionName: "respondToTask",
            args: [task, taskIndex, sightingConfidence, signature],
            account: account.address,
        });

        const hash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Responded to task with:", {
            taskIndex,
            task,
            sightingConfidence,
            transactionHash: hash,
            receipt,
        });
    } catch (error) {
        console.error("Error responding to task", error);
    }
}

async function main() {
    const contractAddress = "0x8EB5A8B9732022F20ab4d3128DDf3a50a6dAa7A2";
    const account = privateKeyToAccount(
        process.env.OPERATOR_KEY as `0x${string}`
    );
    const publicClient = createPublicClient({
        chain: anvil,
        transport: http("http://localhost:8545"),
    });
    const walletClient = createWalletClient({
        chain: anvil,
        transport: http("http://localhost:8545"),
        account,
    });
}
