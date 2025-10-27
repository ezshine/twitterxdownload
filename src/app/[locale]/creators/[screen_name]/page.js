import { getTranslation } from "@/lib/i18n";
import { headers } from 'next/headers'
import { Avatar, Button,Link } from "@heroui/react";
import TweetCard from '@/app/components/ui/TweetCard';
import { RiSearchLine,RiTwitterXFill } from "@remixicon/react";

async function getCreatorData(screen_name) {
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const detailResp = await fetch(`${baseUrl}/api/requestdb?action=creator&screen_name=${screen_name}`);
    const data = await detailResp.json();
    const tweetData = data.data;
    return tweetData;
}

export default async function CreatorDetail({params}) {
    const {screen_name, locale='en'} = params;
    const t = function(key){
        return getTranslation(locale, key);
    }
    
    const creator = await getCreatorData(screen_name);

    const tweet_data = JSON.parse(creator.tweet_data);

    let data_entries;
    for (const instruction of tweet_data.data.threaded_conversation_with_injections_v2.instructions) {
        if (instruction.entries) {
            data_entries = instruction.entries;
            break;
        }
    }

    // 获取推文数据
    const resultTweet = data_entries[0].content.itemContent.tweet_results.result;
    
    const user = resultTweet.core?.user_results?.result?.legacy || resultTweet.tweet.core?.user_results?.result?.legacy;
    const description = user.description;

    const tweet = {
        ...creator,
        tweet_media: creator.tweet_media ? creator.tweet_media.split(',') : []
    }

    return (
        <div className="page-container py-20 flex gap-4 flex-col items-center justify-center">
            <div className='w-full flex flex-col items-center'>
                <Avatar disableAnimation isBordered src={creator.profile_image||''} name={creator.name} alt={`${creator.name} avatar`} size="lg" radius="full"/>
                
                <div className="flex flex-col gap-1 pt-3 flex-1 overflow-hidden items-center">
                    <h1 className="text-medium font-semibold leading-none text-default-600 overflow-hidden text-ellipsis whitespace-nowrap">{creator.name}</h1>
                    <p className="text-small text-default-400 overflow-hidden text-ellipsis whitespace-nowrap">@{creator.screen_name}</p>
                    {description && <p className='max-w-[340px] mt-2 p-4 border-[1px] border-foreground/50 text-foreground rounded-md'>{description}</p>}
                </div>
            </div>
            <div className='max-w-[340px] flex flex-col gap-4'>
                <div className="w-full flex flex-row gap-2">
                    <Button as={Link} href={`/tweets?screen_name=${screen_name}`} color='primary' variant="solid" startContent={<RiSearchLine className='w-4 h-4'/>} className="w-full">{t('Search')}</Button>
                    <Button as={Link} href={`https://x.com/${screen_name}`} target="blank" color='primary' variant="solid" startContent={<RiTwitterXFill className='w-4 h-4'/>}>{t('')}</Button>
                </div>
                <div className="w-full text-center">{t('Recent Tweet')}</div>
                <TweetCard tweet={tweet} locale={locale} enableEdit={false} className="cursor-auto select-text"/>
            </div>
        </div>
    )
}