"use client";

import { getTranslation } from '@/lib/i18n';
import { Link,Chip } from '@heroui/react';
import { RiGithubFill } from "@remixicon/react"
import { locales } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from "./ThemeSwitcher";

export default function MyFooter({ locale = 'en' }) {
    const t = function(key){
        return getTranslation(locale, key);
    }
    const pathname = usePathname();
    
    const convertLocaleLink = (key) => {
        // 如果选择的语言和当前语言相同，返回当前路径
        if (key === locale) {
            return pathname;
        }

        // 检查当前路径是否已经包含语言代码
        const hasLocale = Object.keys(locales).some(loc => pathname.startsWith(`/${loc}`));

        // 获取当前URL的查询参数
        const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const queryString = searchParams.toString();
        
        let newPath;
        if (hasLocale) {
            // 如果已有语言代码，替换它
            newPath = pathname.replace(/^\/[^/]+/, `/${key}`);
        } else {
            // 如果没有语言代码，添加新的语言代码
            newPath = `/${key}${pathname}`;
        }
        
        // 添加查询参数（如果有）
        return `${newPath}${queryString ? `?${queryString}` : ''}`;
    }
    return (
        <>
        <div className="page-container p-10 flex justify-between">
            <div className="flex flex-col gap-2 w-full md:w-1/3">
                <div className="flex items-center gap-1">
                    <p className="text-xl font-bold mb-2 w-fit">{t('TwitterXDownload')}</p>
                    <Link href="https://github.com/ezshine/twitterxdownload" target="_blank"><Chip color="danger" size="sm" variant="flat" className="ml-2 -mt-1.5">v{process.env.APP_VERSION}</Chip></Link>
                    <Link href="https://github.com/ezshine/twitterxdownload" target="_blank"><RiGithubFill className="mt-[-6px]"/></Link>
                </div>
                <p className="text-sm text-gray-500 mb-7">{t('The fastest and most reliable Twitter video downloader. Free to use, no registration required.')}</p>
                <p className="text-sm text-gray-500">© 2024 <a href="https://twitterxdownload.com" target="_blank">TwitterXDownload</a> {t('All rights reserved.')}</p>
            </div>
            <div className="hidden md:flex flex-col gap-4">
                <div>
                    <p className="font-bold mb-2">{t('Other Links')}</p>
                    <ul className="flex flex-col gap-1">
                        <li><Link href="/about-us" className="text-sm hover:text-primary">{t('About Us')}</Link></li>
                        <li><Link href="/privacy-policy" className="text-sm hover:text-primary">{t('Privacy Policy')}</Link></li>
                        <li><Link href="/terms-of-service" className="text-sm hover:text-primary">{t('Terms of Service')}</Link></li>
                        <li><Link href="/friends-link" className="text-sm hover:text-primary">{t('Friends Link')}</Link></li>
                        <li><Link href="https://github.com/ezshine/twitterxdownload" target='_blank' className="text-sm hover:text-primary">{t('Self Hosted')}</Link></li>
                    </ul>
                </div>
            </div>
            <div className="hidden md:flex flex-col gap-4">
                <div>
                    <p className="font-bold mb-2">{t('Contact Us')}</p>    
                    <Link href="mailto:support@twitterxdownload.com" className="text-sm hover:text-primary mb-4">support@twitterxdownload.com</Link>
                    <a href="https://supadr.com?utm_source=twitterxdownload.com&utm_medium=badge&utm_campaign=supadr" target="_blank">
                        <img src="https://supadr.com/api/badge/twitterxdownload.com.svg?theme=blue" alt="Domain Rating for twitterxdownload.com" width="280" height="64" />
                    </a>
                </div>
            </div>
        </div>
        <div className="page-container flex flex-row  justify-between items-center py-4">
            <div className="flex flex-row flex-wrap gap-2">
                {Object.entries(locales).map(([key, locale]) => (
                    <Link href={convertLocaleLink(key)} key={key}>{locale.name}</Link>
                ))}
            </div>
            <div>
                <ThemeSwitcher />
            </div>
        </div>
        </>
    )
}