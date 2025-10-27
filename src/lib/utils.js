import JSZip from 'jszip';

const downloadAllMedia = async (tweets) => {
    const zip = new JSZip();
    // 先创建一个文件夹
    const folder = zip.folder('tweets_from_twitterxdownload.com');

    let markdown_content = '';
    const tempTweets = [...tweets];
    for(let i = 0; i < tempTweets.length; i++){
        const tweet = tempTweets[i];
        markdown_content += tweet.tweet_text+"\n\n";
        for(let j = 0; j < tweet.tweet_media.length; j++){
            const media = tweet.tweet_media[j];
            const {blob, filename} = await fetchMedia(media);
            folder.file(filename, blob);
        }
    }
    // 添加.URL文件和.webloc文件
    folder.file('twitterxdownload.com', 'https://twitterxdownload.com/');

    // 添加 markdown 文件
    folder.file('tweet_text.md', markdown_content);

    // 最后生成zip文件
    const content = await zip.generateAsync({type: 'blob'});
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'tweets_from_twitterxdownload.com.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const fetchMedia = async (media) => {
    try {
        const response = await fetch(media, {
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        return {
            blob: blob,
            filename: media.split('/').pop().split('?')[0] || 'downloaded_media'
        };
    } catch (error) {
        console.error('Error fetching media:', error);
        return null;
    }
}

export default {
    downloadAllMedia
};