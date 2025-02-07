"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github, Moon, Sun, Twitter } from "lucide-react";
import Link from "next/link";

function Footer() {
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">
                            Quick Links
                        </h3>
                        <nav className="space-y-2 text-sm">
                            <Link
                                href="/"
                                className="block transition-colors hover:text-primary"
                            >
                                Home
                            </Link>
                            <Link
                                href="/dashboard"
                                className="block transition-colors hover:text-primary"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="https://web3hackathons.xyz"
                                className="block transition-colors hover:text-primary"
                            >
                                Web3Hackathons
                            </Link>
                        </nav>
                    </div>
                    <div className="relative">
                        <h3 className="mb-4 text-lg font-semibold">
                            Follow Us
                        </h3>
                        <div className="mb-6 flex space-x-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Github className="h-4 w-4" />
                                            <span className="sr-only">
                                                GitHub
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View our Code</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">
                                                Twitter 0xsamoyed
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow 0xsamoyed</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">
                                                Twitter sknai_btc
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow sknai_btc</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span className="sr-only">
                                                Twitter wr1159
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow wr1159</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* TODO: use next-themes for theming */}
                            <Sun className="h-4 w-4" />
                            <Switch
                                id="dark-mode"
                                checked={isDarkMode}
                                onCheckedChange={setIsDarkMode}
                            />
                            <Moon className="h-4 w-4" />
                            <Label htmlFor="dark-mode" className="sr-only">
                                Toggle dark mode
                            </Label>
                        </div>
                    </div>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Made for{" "}
                        <a
                            href="https://ethglobal.com/events/agents"
                            className="transition-colors hover:text-primary"
                        >
                            Agentic Ethereum
                        </a>
                    </p>
                    <nav className="flex gap-4 text-sm text-muted-foreground">
                        <a
                            href="https://x.com/0xsamoyed"
                            className="transition-colors hover:text-primary"
                        >
                            0xsamoyed
                        </a>
                        <a
                            href="https://x.com/sknai_btc"
                            className="transition-colors hover:text-primary"
                        >
                            sknai_btc
                        </a>
                        <a
                            href="https://x.com/wr1159"
                            className="transition-colors hover:text-primary"
                        >
                            wr1159
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

export { Footer as Footerdemo };
