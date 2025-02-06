import {
    createPublicClient,
    createWalletClient,
    http,
    parseAbi,
    encodePacked,
    keccak256,
    parseAbiItem,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import "dotenv";
import { Task } from "./createTask";
import axios from "axios";

if (!process.env.OPERATOR_KEY) {
    throw new Error("OPERATOR_KEY is not defined");
}

const abi = parseAbi([
    `function respondToTask((string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task, uint32 referenceTaskIndex, uint8 response, bytes memory signature)`,
    `event NewTaskCreated(uint32 indexed taskIndex, (string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task)`,
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
        let sightingConfidence = 0;

        try {
            if (!process.env.ROBOFLOW_KEY) {
                throw new Error("ROBOFLOW_KEY is not defined");
            }
            const response = await axios({
                method: "POST",
                url: "https://detect.roboflow.com/creeper-plant-detection/1",
                params: {
                    api_key: process.env.ROBOFLOW_KEY,
                    image: task.imageUrl,
                },
            });

            if (
                response.status === 200 &&
                response.data.predictions &&
                response.data.predictions.length !== 0
            ) {
                // take max of all confidence
                sightingConfidence = response.data.predictions.reduce(
                    (max: number, prediction: any) =>
                        prediction.confidence > max
                            ? prediction.confidence
                            : max,
                    0
                );
            }
        } catch (error) {
            console.error("Error fetching image from Roboflow", error);
        }
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

    console.log("Watching for new tasks / sightings...");
    publicClient.watchEvent({
        address: contractAddress,
        event: parseAbiItem(
            `event NewTaskCreated(uint32 indexed taskIndex, (string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task)`
        ),
        onLogs: async (logs) => {
            for (const log of logs) {
                const { args } = log;
                if (!args) {
                    continue;
                }
                const taskIndex = Number(args.taskIndex);
                const task = args.task as Task;
                console.log("Received new task:", { taskIndex, task });

                await respondToTask(
                    walletClient,
                    publicClient,
                    contractAddress,
                    account,
                    task,
                    taskIndex
                );
            }
        },
    });

    process.on("SIGINT", () => {
        console.log("Exiting...");
        process.exit(0);
    });

    await new Promise(() => {});
}

main().catch(console.error);
