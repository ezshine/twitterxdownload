import dbConnect from '@/lib/db';
import Tweets from '@/lib/models/tweets';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const tweet_id = searchParams.get('tweet_id');

    if (!tweet_id) {
        return Response.json({
            success: false,
            error: 'Tweet ID is required'
        }, { status: 400 });
    }

    if(process.env.NEXT_PUBLIC_USE_SHARED_DB=='1'){
        const response = await fetch(`https://twitterxdownload.com/api/requestx?${tweet_id?`tweet_id=${tweet_id}`:''}`, {
            headers: {
                'x-api-key': `${process.env.API_KEY}`
            }
        });
        const data = await response.json();
        
        return Response.json({
          ...data,
          message: 'from shared database'
        });
    }

    try {
        await dbConnect();
        const tweet = await Tweets.findOne({ tweet_id: tweet_id });
        if (tweet) {
            return Response.json({
                success: true,
                message: 'Tweet found in database',
                data: JSON.parse(tweet.tweet_data)
            });
        }

        const response = await fetch(`https://twitterxdownload.com/api/requestx?tweet_id=${tweet_id}`, {
            method: 'GET',
            headers: {
                'x-api-key': `${process.env.API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const respData = await response.json();

        // 保存到数据库
        // name
        // screen_name
        // profile_image
        // tweet_id
        // tweet_text
        // tweet_media
        // tweet_threadscount
        // tweet_data
        // created_at

        // 获取推文数据
        let data_entries;
        for (const instruction of respData.data.data.threaded_conversation_with_injections_v2.instructions) {
            if (instruction.entries) {
                data_entries = instruction.entries;
                break;
            }
        }
        const resultTweet = data_entries[0].content.itemContent.tweet_results.result;
        
        // 获取主推文数据
        const first_tweet = resultTweet.legacy || resultTweet.tweet.legacy;
        
        // 获取用户信息
        const user = resultTweet.core?.user_results?.result?.legacy || resultTweet.tweet.core?.user_results?.result?.legacy;;
        const name = user.name;
        const screen_name = user.screen_name;
        const profile_image = user.profile_image_url_https;
        
        // 处理推文文本
        let tweet_text = first_tweet.full_text || '';
        
        // 处理媒体内容
        let tweet_media = '';
        if (first_tweet.extended_entities?.media) {
            const media_urls = first_tweet.extended_entities.media.map(media => {
                if (media.type === 'photo') {
                    return media.media_url_https;
                } else if (media.type === 'video' || media.type === 'animated_gif') {
                    // 获取最高质量的视频URL
                    const mp4Variants = media.video_info.variants.filter(v => 
                        v.content_type === 'video/mp4'
                    );
                    if (mp4Variants.length > 0) {
                        // 按比特率排序，选择最高质量
                        mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                        return mp4Variants[0].url;
                    }
                }
                return null;
            }).filter(url => url !== null);
            
            tweet_media = media_urls.join(',');
        }

        const card = resultTweet?.card || resultTweet?.tweet?.card;
        if(card && card.legacy&&card.legacy.binding_values){
            const value = card.legacy.binding_values[0].value.string_value;
            const valueJson = JSON.parse(value);
            const mediaId = valueJson.component_objects.media_1.data.id;
            const media = valueJson.media_entities[mediaId];
            const variants = media.video_info.variants;
            const mp4Variants = variants.filter(v => v.content_type === 'video/mp4');
            if (mp4Variants.length > 0) {
                // Sort by bitrate, choose highest quality
                mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                tweet_media = mp4Variants[0].url;
            }
        }
        
        // 计算线程中的推文数量
        let tweet_threadscount = 0;
        data_entries.forEach(entry => {
            if (entry.content.__typename === "TimelineTimelineModule") {
                // Process items in module, only process tweets in thread, not replies
                if (entry.content.items && Array.isArray(entry.content.items)) {
                    entry.content.items.forEach(item => {
                        // Check if it's a tweet in thread (not a reply)
                        if (item.item?.itemContent?.tweet_results?.result) {
                            const tweetDisplayType = item.item.itemContent.tweetDisplayType;
                            const isThreadTweet = tweetDisplayType === 'SelfThread';
                            if (isThreadTweet) {
                                tweet_threadscount++;
                            }
                        }
                    });
                }
            }
        });

        const tweetStructure = {
            name: name,
            screen_name: screen_name,
            profile_image: profile_image,
            tweet_id: tweet_id,
            tweet_text: tweet_text,
            tweet_media: tweet_media,
            tweet_threadscount: tweet_threadscount,
            tweet_data: JSON.stringify(respData.data),
            is_hidden: 1,
            post_at : new Date(first_tweet.created_at),
            created_at: new Date()
        }

        await Tweets.create(tweetStructure);

        return Response.json({
            success: true,
            message: 'Tweet fetched from API',
            data:respData.data
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}