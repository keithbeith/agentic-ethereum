"use client";
import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { anvil } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";

const contractAddress = "0x121f7e412A536D673DaB310F1448ce0e3843068a"; // Replace with your contract address

type Task = {
    taskIndex: number;
    imageUrl?: string;
    longitude?: string;
    latitude?: string;
    response?: number;
    operator?: `0x${string}`;
};

export const DashboardSection = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const client = createPublicClient({
                    chain: anvil,
                    transport: http("http://localhost:8545"),
                });

                const logs = await client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem(
                        "event TaskResponded(uint32 indexed taskIndex, (string imageUrl, string longitude, string latitude, uint32 taskCreatedBlock) task, uint8 response, address operator)"
                    ), // Parse the event from ABI
                    fromBlock: 3308630n, // Adjust if needed
                    toBlock: "latest",
                });
                console.log("logs", logs);

                const formattedTasks = logs.map((log) => ({
                    taskIndex: Number(log.args.taskIndex),
                    imageUrl: log.args.task?.imageUrl,
                    longitude: log.args.task?.longitude,
                    latitude: log.args.task?.latitude,
                    response: log.args.response,
                    operator: log.args.operator,
                }));

                setTasks(formattedTasks);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="container mx-auto p-12">
            <h2 className="text-2xl font-semibold mb-6">Sightings Responded</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tasks.map((task, index) => (
                    <Card key={index} className="shadow-lg">
                        <img
                            src={task.imageUrl || "/placeholder.jpg"}
                            alt={`Task ${task.taskIndex}`}
                            className="w-full h-80 object-cover rounded-t-lg mb-4"
                            width={320}
                            height={320}
                        />
                        <CardHeader>
                            <CardTitle>Sighting #{task.taskIndex}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                <strong>Location:</strong> {task.longitude},{" "}
                                {task.latitude}
                            </p>
                            <p>
                                <strong>Confidence: </strong>
                                <span>{task.response}</span>
                            </p>
                            <p>
                                <strong>Operator:</strong>{" "}
                                <span className="font-mono">
                                    {task.operator?.slice(0, 6)}...
                                    {task.operator?.slice(-4)}
                                </span>
                            </p>
                            <Button className="mt-4">Vote</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
