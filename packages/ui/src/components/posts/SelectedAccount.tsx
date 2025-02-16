'use client';

import { useState } from "react";
import { Card, CardContent } from "../../shadcn/card";
import { Button } from '../../shadcn/button';
import { Switch } from '../../shadcn/switch';
import { Avatar, AvatarFallback } from '../../shadcn/avatar';
import { Separator } from '../../shadcn/separator';
import { RefreshCcw, X } from "lucide-react";
import facebookIcon from "../../../../../apps/web/public/icons/facebook-icon.svg";
import youtubeIcon from "../../../../../apps/web/public/icons/youtube-icon.svg";
import instaIcon from "../../../../../apps/web/public/icons/instagram-icon.svg";
import twitterIcon from "../../../../../apps/web/public/icons/twitter-icon.svg";
import Image from "next/image";

const platforms = [
    { id: "twitter", name: "Twitter", icon: twitterIcon },
    { id: "linkedin", name: "LinkedIn", icon: instaIcon },
    { id: "youtube", name: "YouTube", icon: youtubeIcon },
    { id: "facebook", name: "Facebook", icon: facebookIcon },
];

const initialAccounts = {
    twitter: [
        { id: 1, name: "John Doe", active: true },
        { id: 2, name: "Tony Mark", active: true },
    ],
    linkedin: [
        { id: 3, name: "John Doe", active: true },
        { id: 4, name: "Tony Mark", active: true },
    ],
    youtube: [
        { id: 5, name: "John Doe", active: true },
        { id: 6, name: "Tony Mark", active: true },
    ],
    facebook: [
        { id: 7, name: "John Doe", active: true },
        { id: 8, name: "Tony Mark", active: true },
    ],
};

export default function SelectAccounts() {
    const [accounts, setAccounts] = useState(initialAccounts);

    const toggleAccount = (platform: string, id: number) => {
        setAccounts((prev) => ({
            ...prev,
            [platform]: prev[platform].map((acc) =>
                acc.id === id ? { ...acc, active: !acc.active } : acc
            ),
        }));
    };

    const removeAccount = (platform: string, id: number) => {
        setAccounts((prev) => ({
            ...prev,
            [platform]: prev[platform].filter((acc) => acc.id !== id),
        }));
    };

    const refreshAccount = (platform: string, id: number) => {
        console.log(`Refreshing account ${id} on ${platform}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-start mb-6">Select Accounts</h1>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform) => (
                    <Card key={platform.id} className="p-4 shadow-lg">
                        <CardContent>
                            <div className="flex items-center space-x-2 mb-4">
                                <Image
                                    src={platform.icon}
                                    alt={platform.name}
                                    width={30}
                                    height={30}
                                    className="w-6 h-6"
                                />
                                <h2 className="text-lg font-semibold">{platform.name}</h2>
                            </div>

                            {accounts[platform.id]?.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-2 border rounded-lg mb-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={account.active}
                                            onCheckedChange={() => toggleAccount(platform.id, account.id)}
                                        />
                                        <Avatar>
                                            <AvatarFallback>{account.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>{account.name}</span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => refreshAccount(platform.id, account.id)}
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => removeAccount(platform.id, account.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button className="w-full mt-2">Add New</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
