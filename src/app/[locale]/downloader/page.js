'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTranslation, locales } from '@/lib/i18n';
import Hero from '@/app/components/ui/Hero';
import { useState, useEffect, useRef } from 'react';
import { addToast,Link,Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,Button, Drawer, DrawerContent, DrawerBody, DrawerHeader, useDisclosure } from '@heroui/react';
import RePublishPanel from '@/app/components/ui/RePublishPanel';
import { RiArrowDropDownLine,RiDownloadLine } from "@remixicon/react";
import { parseTweetData } from '@/lib/parser';
import TweetCard from '@/app/components/ui/TweetCard';
import { translate } from '@/lib/translator';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import Script from 'next/script';
import Utils from '@/lib/utils';

export default function Downloader({ params: { locale } }) {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [remainApiCount, setRemainApiCount] = useState(0);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [tweetData, setTweetData] = useState(null);
    const [originTweets, setOriginTweets] = useState([]);
    const [tweets, setTweets] = useState([]);

    const [isPackaging, setIsPackaging] = useState(false);

    const [turnstileToken, setTurnstileToken] = useState('');
    const turnstileRef = useRef(null);

    const t = function (key) {
        return getTranslation(locale, key);
    }

    useEffect(() => {
        if(url) {
            fetchTweet(url);
        }
        fetchRemainApiCount();

        // 监听 Turnstile 验证成功的全局事件
        if(typeof window !== 'undefined') {
            window.addEventListener('turnstile-success', handleTurnstileSuccess);
            return () => {
                window.removeEventListener('turnstile-success', handleTurnstileSuccess);
            }
        }
    }, []);

    // Turnstile 验证成功的回调
    const handleTurnstileSuccess = (e) => {
        const token = e.detail;
        setTurnstileToken(token);
    };

    const fetchRemainApiCount = async () => {
        const response = await fetch('/api/remains');
        const data = await response.json();
        setRemainApiCount(data.data);
    }

    let retryTimes = 0;
    const fetchTweet = async (url) => {
        setIsLoading(true);

        const tweet_id = url.match(/status\/(\d{19})/)?.[1] || url.split('/').pop();
        const response = await fetch(`/api/requestx?tweet_id=${tweet_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-turnstile-token': turnstileToken
            }
        });
        const data = await response.json();
        

        if(!data.success){
            if(data.error_code===1003){
                resetTurnstile();
                setIsLoading(false);
                addToast({
                    title: t('Please verify you are human'),
                    color: 'danger',
                    hideCloseButton: true,
                    shouldShowTimeoutProgress: true,
                    variant: 'bordered',
                });
                return;
            }
            // 如果请求失败,最多重试3次
            // 每次重试的间隔时间需要随机在 1000-1500ms 之间
            if(retryTimes < 3){
                setTimeout(() => {
                    console.log("retry fetch " + (retryTimes+1));
                    fetchTweet(url);
                    retryTimes++;
                }, 1000 + Math.random() * 500);
            }else{
                retryTimes = 0;
                setIsLoading(false);
                resetTurnstile();
            }
            return;
        }

        setIsLoading(false);
        setTweetData(data.data);

        const tempOriginTweets = parseTweetData(data.data);
        setOriginTweets(tempOriginTweets);

        const tempTweets = tempOriginTweets.map((tweet) => {
            return {
                name: "name",
                screen_name: "screen_name",
                profile_image: "",
                tweet_text: tweet.text,
                tweet_media: tweet.medias.map((media) => media.url),
                medias_info: tweet.medias
            }
        });
        setTweets(tempTweets);

        fetchRemainApiCount();

        router.replace(`/downloader?url=${url}`);

        // 滚动到指定位置，向下偏移100px
        setTimeout(() => {
            const element = document.getElementById('tweet-editor');
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: elementPosition - 80, // 向下偏移80px
                    behavior: 'smooth'
                });
            }
        }, 200);

        resetTurnstile();
    }

    const resetTurnstile = () => {
        if (typeof window !== 'undefined' && window.turnstile && turnstileRef.current) {
            window.turnstile.reset(turnstileRef.current);
            setTurnstileToken(''); // 清空 token，准备下次使用
        }
    }

    const translateTweet = async (targetLang) => {

        const tempTweets = [...tweets];
        for(let i = 0; i < tempTweets.length; i++){
            const tweet = tempTweets[i];
            const translatedText = await translate(tweet.tweet_text, targetLang);

            tempTweets[i].tweet_text = translatedText;
        }
        setTweets(tempTweets);
    }

    const handleDeleteTweet = async (index) => {
        const confirmed = await ConfirmModal.show({
            title: t('Warning'),
            description: t('Are you sure you want to delete this tweet?'),
            cancelText: t('Cancel'),
            confirmText: t('Confirm')
        });
        if(!confirmed) return;
        
        const tempTweets = [...tweets];
        tempTweets.splice(index, 1);
        setTweets(tempTweets);
    }

    const handleInsertTweet = (index) => {
        const tempTweets = [...tweets];
        tempTweets.splice(index+1, 0, {
            name: "name",
            screen_name: "screen_name",
            profile_image: "",
            tweet_text: "",
            tweet_media: [],
            medias_info: []
        });
        setTweets(tempTweets);
    }

    const handleAddMedia = (index) => {

        if(tweets[index].tweet_media.length >= 4) {
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.mp4';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if(!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const tempTweets = [...tweets];
                tempTweets[index].tweet_media.push(e.target.result);
                tempTweets[index].medias_info.push({});
                setTweets(tempTweets);
            }
            reader.readAsDataURL(file);
        }
        
        input.click();
    }

    const handleDeleteMedia = async (index, mediaIndex) => {
        const confirmed = await ConfirmModal.show({
            title: t('Warning'),
            description: t('Are you sure you want to delete this media?'),
            cancelText: t('Cancel'),
            confirmText: t('Confirm')
        });
        if(!confirmed) return;

        const tempTweets = [...tweets];
        tempTweets[index].tweet_media.splice(mediaIndex, 1);
        tempTweets[index].medias_info.splice(mediaIndex, 1);
        setTweets(tempTweets);
    }

    const handleUpdateText = (index, text) => {
        const tempTweets = [...tweets];
        tempTweets[index].tweet_text = text;
        setTweets(tempTweets);
    }    

    const handlePasteMedia = (index, dataUrl, file) => {
        if (tweets[index].tweet_media.length >= 4) return;
        const next = [...tweets];
        next[index].tweet_media.push(dataUrl);
        next[index].medias_info.push({ type: file?.type || 'image' });
        setTweets(next);
    };

    const handleDownloadAllMedia = async () => {
        if(isPackaging) return;
        setIsPackaging(true);
        await Utils.downloadAllMedia(tweets);
        setIsPackaging(false);
    }

    return (
        <div className="page-container">
            {/* 加载 Turnstile 脚本 */}
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="lazyOnload"
            />

            {/* 全局回调函数 */}
            <Script id="turnstile-callback">
                {`
                    window.onTurnstileSuccess = function(token) {
                        window.dispatchEvent(new CustomEvent('turnstile-success', { detail: token }));
                    }
                `}
            </Script>
            <Drawer isOpen={isOpen} isDismissable={false} hideCloseButton={true} size="md" radius="none" onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <div className="text-medium font-semibold">{t('Re-Publish')}</div>
                    </DrawerHeader>
                    <DrawerBody>
                        <RePublishPanel locale={locale} tweets={tweets} onClose={()=>{
                            onOpenChange(false);
                        }} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
            <div className="flex flex-col gap-4 justify-center items-center">
                <div></div>
                <div className="">
                    <Hero
                        locale={locale}
                        downloadButtonLabel="Fetch"
                        downloadButtonIsLoading={isLoading}
                        remainApiCount={remainApiCount}
                        url={url}
                        isFetchMode={true}
                        onDownload={(url) => {
                            fetchTweet(url);
                        }}
                    />
                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <div
                        ref={turnstileRef}
                        className="cf-turnstile w-fit mx-auto h-[65px] overflow-hidden mb-3"
                        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        data-callback="onTurnstileSuccess"
                        data-theme="light"
                    />}
                </div>
                <div></div>
            </div>
            <div id="tweet-editor" className="flex gap-4 justify-center items-start">
                { tweetData && originTweets.length > 0 && (
                    <>
                        <div className="w-1/3 md:block hidden box-border border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
                            <div className="text-medium font-semibold flex items-center">
                                <div className="flex-1">{t('Parse Result')}</div>
                                <Button href={`/tweets/${originTweets[0].id_str}`} target="_blank" as={Link} color="primary" size="sm" radius="full">
                                    {t('Goto Article')}
                                </Button>
                            </div>
                            <div className="w-full h-[1px] bg-foreground/10 mt-3"/>
                            <div className="w-full mt-3">
                                {originTweets.map((tweet, index) => (
                                    <div key={index} className="w-full overflow-hidden border-[1px] border-foreground/10 py-2 mb-2 whitespace-nowrap">
                                        <div>{tweet.text}</div>
                                        {
                                            tweet.medias.map((media,index) => {
                                                return <div key={index}>[{media.type}] {media.url}</div>
                                            })
                                        }
                                    </div>
                                ))}
                            </div>
                            <div className="w-full flex justify-center items-center">
                                <Button onPress={handleDownloadAllMedia} size="md" radius="full" color="primary" className="mt-3" isLoading={isPackaging} startContent={<RiDownloadLine className='w-4 h-4'/>}>{t('Download All')}</Button>
                            </div>
                        </div>
                        <div className="w-full box-border border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
                            <div className="text-medium font-semibold flex items-center">
                                <div className="flex-1">{t('Tweets Editor')}</div>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button disableRipple variant="flat" color="primary" radius="full" size="sm" className="pl-5 mr-3">
                                            {t('Translate to')}
                                            <RiArrowDropDownLine className="w-4 h-4" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Action event example" 
                                    onAction={(key) => {translateTweet(key)}}>
                                        {Object.entries(locales).map(([key, locale]) => (
                                            <DropdownItem key={key}>
                                                {locale.name}
                                            </DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                                <Button onPress={onOpen} color="primary" size="sm" radius="full" asChild>
                                    {t('Re-Publish')}
                                </Button>
                            </div>
                            <div className="w-full h-[1px] bg-foreground/10 mt-3"/>
                            <div className="w-full mt-3">
                                {tweets.map((tweet, index) => {
                                    return <TweetCard key={index} tweet={tweet} locale={locale} enableEdit={true} onDeleteTweet={() => handleDeleteTweet(index)} onInsertTweet={() => handleInsertTweet(index)} onAddMedia={() => handleAddMedia(index)} onDeleteMedia={(mediaIndex) => handleDeleteMedia(index, mediaIndex)} onUpdateText={(text) => handleUpdateText(index, text)} onPasteImage={(dataUrl, file) => handlePasteMedia(index, dataUrl, file)} className="mb-2 cursor-auto select-text"/>
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}