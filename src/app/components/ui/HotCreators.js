'use client'
import { Card, CardFooter, CardHeader, Button, Avatar, Skeleton,ScrollShadow, Spinner,Chip } from "@heroui/react";
import { getTranslation } from "@/lib/i18n";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HotCreators({ locale = 'en' }) {
    const t = function (key) {
        return getTranslation(locale, key);
    }
    const [count, setCount] = useState(0);
    const [creators, setCreators] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchCreators = async () => {
            const creatorsResp = await fetch(`/api/requestdb?action=creators`);
            const creatorsData = await creatorsResp.json();
            setCreators(creatorsData.data||[]);
            setCount(creatorsData.count||0);
            setIsLoading(false);
        }
        fetchCreators();
    }, []);

    if (isLoading) {
        return (
            <>
            <div className="text-2xl font-bold px-2 py-4 flex">
                <div>{t('Hot Creators')}</div>
                <Spinner size="sm" color="primary" className="ml-2" />
            </div>
            <ScrollShadow className="w-full flex gap-5" orientation="horizontal">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card
                    shadow="none"
                    disableRipple
                    className="select-none box-border border-foreground/10 border-[1px] min-w-[200px] max-w-[20%] p-2 flex-shrink-0"
                    radius="lg"
                    key={index}
                >
                    <CardHeader className="justify-between gap-5">
                        <Skeleton className="rounded-full w-10 h-10" />
                        <div className="flex flex-col gap-1 items-start justify-center overflow-hidden flex-1">
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-3" />
                        </div>
                    </CardHeader>
                    <CardFooter className="justify-between before:bg-white/10 overflow-hidden w-[calc(100%_-_8px)]">
                        
                            <Skeleton className="w-[100px] h-8" />
                    </CardFooter>
                </Card>
                ))}
            </ScrollShadow>
            </>
        );
    }

    return (
        <>
            <div className="text-2xl font-bold px-2 py-4 flex items-center">
                <div>{t('Hot Creators')}</div>
                <Chip color="primary" size="sm" variant="flat" className="ml-2 mt-1">{count}</Chip>
                <div className="ml-auto">
                    <Button color="primary" size="sm" variant="light" as={Link} href="/creators">
                        {t('View All')}
                    </Button>
                </div>
            </div>
            <ScrollShadow className="w-full flex gap-5" orientation="horizontal">
                {creators.map((creator) => (
                    <Card
                        shadow="none"
                        disableRipple
                        className="select-none box-border border-foreground/10 border-[1px] min-w-[160px] max-w-[20%] p-2 flex-shrink-0"
                        radius="lg"
                        key={creator.screen_name}
                        as={Link}
                        href={`/creators/${creator.screen_name}`}
                        target="blank"
                    >
                        <CardHeader className="justify-between gap-5">
                            <Avatar
                                isBordered
                                radius="full"
                                size="md"
                                alt={`${creator.name} avatar`}
                                src={creator.profile_image}
                            />
                            <div className="flex flex-col gap-1 items-start justify-center overflow-hidden flex-1">
                                <h4 className="w-full text-small font-semibold leading-none text-default-600 text-ellipsis overflow-hidden whitespace-nowrap">{creator.name}</h4>
                                <h5 className="w-full text-small tracking-tight text-default-400 text-ellipsis overflow-hidden whitespace-nowrap">@{creator.screen_name}</h5>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </ScrollShadow>
        </>
    );
}