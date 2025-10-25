'use client'
import { Chip, Spinner, Button, Link } from "@heroui/react";
import { getTranslation } from "@/lib/i18n";
import TweetCard from './TweetCard';
import { useEffect, useState } from 'react';

export default function HotTweets({ locale = 'en' }) {
    const t = function (key) {
        return getTranslation(locale, key);
    }

    const [tweets, setTweets] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTweets = async () => {
            const tweetsResp = await fetch(`/api/requestdb?action=recent`,{
                cache: 'no-store'
            });
            const tweetsData = await tweetsResp.json();
            const totalCount = tweetsData.count;
            const tweets = [[], [], []];
            tweetsData.data.forEach((tweet, index) => {
                tweets[index % 3].push({
                    ...tweet,
                    tweet_media: tweet.tweet_media ? tweet.tweet_media.split(',') : []
                });
            });
            setTweets(tweets);
            setTotalCount(totalCount);
            setIsLoading(false);
        }
        fetchTweets();
    }, []);

    if (isLoading) {
        return (
            <>
                <div className="text-2xl font-bold px-2 py-4 flex">
                    <div>{t('Hot Tweets')}</div>
                    <Spinner size="sm" color="primary" className="ml-2" />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="text-2xl font-bold px-2 py-4 flex">
                <div>{t('Hot Tweets')}</div>
                <Chip color="primary" size="sm" variant="flat" className="ml-2 mt-1">{totalCount}</Chip>
                <div className="ml-auto">
                    <Button color="primary" size="sm" variant="light" as={Link} href="/tweets">
                        {t('Search')}
                    </Button>
                </div>
            </div>
            <div className="flex justify-between gap-5 flex-wrap md:flex-nowrap">
                {tweets.map((row, index) => (
                    <div key={index} className="md:w-1/3 w-full flex flex-col gap-5">
                        {row.map((tweet) => (
                            <TweetCard locale={locale} key={tweet.tweet_id} tweet={tweet} />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}