import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import "dotenv";

if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
}

export type Task = {
    longitude: string;
    latitude: string;
    imageUrl: string;
    taskCreatedBlock: number;
};

const abi = parseAbi([
    `function createNewTask(string memory imageUrl, string memory longitude, string memory latitude) external returns ((string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock))`,
]);

async function main() {
    const contractAddress = "0x8EB5A8B9732022F20ab4d3128DDf3a50a6dAa7A2";
    const account = privateKeyToAccount(
        process.env.PRIVATE_KEY as `0x${string}`
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

    try {
        const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi,
            functionName: "createNewTask",
            args: ["https://example.com/image.jpg", "0.0", "0.0"],
            account: account.address,
        });
        const hash = await walletClient.writeContract(request);
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction hash: ", hash);
        console.log("Transaction Receipt: ", receipt);
    } catch (error) {
        console.error(error);
    }
}

main().catch(console.error);
