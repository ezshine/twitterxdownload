'use client';

import { Button } from "@heroui/react";
import { RiDownloadLine,RiFileCopyLine,RiTwitterXLine,RiFacebookFill,RiRedditLine } from "@remixicon/react";
import Utils from "@/lib/utils"

export default function ShareButtons({tweets=[]}) {

    const handleCopy = () => {
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;
        
        // 使用剪贴板API复制内容
        document.addEventListener('copy', function(e) {
            e.clipboardData.setData('text/html', articleContent.innerHTML);
            e.clipboardData.setData('text/plain', articleContent.innerHTML);
            e.preventDefault();
        });
        document.execCommand('copy');
    }
    const handleShareToTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank');
    }
    const handleShareToFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
    const handleShareToReddit = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.reddit.com/submit?url=${url}`, '_blank');
    }
    const handleDownloadAll = () =>{
        Utils.downloadAllMedia(tweets);
    }

    return (
        <div className="flex flex-row gap-1 mt-6 justify-between">
            <Button isIconOnly color="primary" size="md" title="Copy" aria-label="Copy" onPress={handleCopy}>
                <RiFileCopyLine className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Download All" aria-label="Download All" onPress={handleDownloadAll}>
                <RiDownloadLine className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Twitter" aria-label="Share to Twitter" onPress={handleShareToTwitter}>
                <RiTwitterXLine className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Facebook" aria-label="Share to Facebook" onPress={handleShareToFacebook}>
                <RiFacebookFill className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Reddit" aria-label="Share to Reddit" onPress={handleShareToReddit}>
                <RiRedditLine className="w-5 h-5"/>
            </Button>
        </div>
    )
}