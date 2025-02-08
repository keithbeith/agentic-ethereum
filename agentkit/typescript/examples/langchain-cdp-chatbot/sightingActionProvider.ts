import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { ethers } from "ethers";

const abi = ["function createNewTask(string imageUrl, string longitude, string latitude) external"];

const iface = new ethers.Interface(abi);

const createTask = customActionProvider<EvmWalletProvider>({
  // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
  name: "create_sighting_task",
  description: "create a new task to look for invasive creepers",
  schema: z.object({
    longitude: z.string(),
    latitude: z.string(),
  }),
  invoke: async (walletProvider, args: any) => {
    const { longitude, latitude } = args;
    const imageUrl =
      "https://img.freepik.com/premium-photo/piper-sarmentosum-plant-leaves-piper-sarmentosum-herb-garden-nature-concept_56644-354.jpg";
    const data = iface.encodeFunctionData("createNewTask", [
      imageUrl,
      longitude,
      latitude,
    ]) as `0x${string}`;

    const signature = await walletProvider.sendTransaction({
      to: "0x121f7e412A536D673DaB310F1448ce0e3843068a",
      data,
    });
    return `The payload signature ${signature}`;
  },
});

export const sightingActionProvider = () => createTask;
