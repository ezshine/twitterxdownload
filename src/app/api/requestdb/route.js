// src/app/api/test-db/route.js
import dbConnect from '@/lib/db';
import Tweets from '@/lib/models/tweets';
import Hiddens from '@/lib/models/hiddens';
import { ObjectId } from 'mongodb';

const HIDDEN_KEYWORDS_REGEX = process.env.HIDDEN_KEYWORDS? process.env.HIDDEN_KEYWORDS.replace(/,/g, '|') : '';


let Storage = {};
// 设置缓存, 默认缓存24小时
function setStorage(key, value, expire=86400) {
  Storage[key] = {
    value: value,
    expire: Date.now() + expire * 1000
  };
}

// 获取缓存, 如果缓存过期, 则返回null
function getStorage(key) {
  if(Storage[key] && Storage[key].expire > Date.now()) {
    return Storage[key].value;
  }
  return null;
}


export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if(process.env.NEXT_PUBLIC_USE_SHARED_DB=='1'){
    const response = await fetch(`https://twitterxdownload.com/api/requestdb?${action?`action=${action}`:''}`);
    const data = await response.json();
    
    return Response.json({
      message: 'from shared database',
      ...data
    });
  }

  try {
    await dbConnect();

    const hiddenAccounts = await Hiddens.find().select('screen_name');
    const hiddenScreenNames = hiddenAccounts.map(account => account.screen_name).join('|');
    
    const baseFilter = {
        screen_name: { $not: { $regex: hiddenScreenNames, $options: 'i' } },
        name: { $not: { $regex: HIDDEN_KEYWORDS_REGEX, $options: 'i' } },
        tweet_text: { $not: { $regex: HIDDEN_KEYWORDS_REGEX, $options: 'i' } },
        tweet_media: { $ne: null, $ne: '' }
    };

    let allData;
    let count = 0;
    if (!action || action === 'recent') {
      const cachedData = getStorage('recent_tweets');
      let result;
      if(cachedData){
        result = cachedData;
      }else{
        result = await Tweets.aggregate([
          {
            $facet: {
              data: [
                { $match: { 
                  ...baseFilter,
                  is_hidden: { $ne: 1 }
                } },
                { $sort: { created_at: -1 } },
                { $project: {
                  tweet_data: 0
                }},
                { $limit: 15 }
              ],
              count: [
                { $count: "total" }
              ]
            }
          }
        ]);
        setStorage('recent_tweets', result, 3600);
      }
      
      allData = result[0].data;
      count = result[0].count[0]?.total || 0;
    } else if (action === 'all') {
      allData = await Tweets.find({ 
        ...baseFilter
      }).select('tweet_id post_at');
      count = allData.length;
    }else if (action === 'random') {
      allData = await Tweets.aggregate([
        { $match: {
          ...baseFilter
        } },
        { $sample: { size: 10 } }
      ]);
    } else if (action === 'creators') {
      const limit = searchParams.get('limit')||6;
      // 使用单一聚合管道优化性能，避免多次数据库查询
      const cachedData = getStorage('creators_'+limit);
      if(cachedData){
        allData = cachedData;
      }else{
        allData = await Tweets.aggregate([
          { $match: {
            ...baseFilter
          }},
          { $group: {
            _id: {
              screen_name: "$screen_name",
              tweet_text: "$tweet_text"
            },
            name: { $first: "$name" },
            screen_name: { $first: "$screen_name" },
            profile_image: { $first: "$profile_image" },
            tweet_text: { $first: "$tweet_text" },
            totalCount: { $sum: 1 },
            hiddenCount: { $sum: { $cond: [{ $eq: ["$is_hidden", 1] }, 1, 0] } }
          }},
          { $group: {
            _id: "$screen_name",
            name: { $first: "$name" },
            screen_name: { $first: "$screen_name" },
            profile_image: { $first: "$profile_image" },
            totalCount: { $sum: 1 },
            hiddenCount: { $sum: { $cond: [{ $gt: ["$hiddenCount", 0] }, 1, 0] } }
          }},
          { $project: {
            _id: 0,
            name: 1,
            screen_name: "$_id",
            profile_image: 1,
            count: "$totalCount",
            // 只有存在未隐藏推文的创作者才会被包含
            hasVisible: { $gt: [{ $subtract: ["$totalCount", "$hiddenCount"] }, 0] }
          }},
          { $match: {
            hasVisible: true
          }},
          { $sort: { count: -1 } },
          { $limit: parseInt(limit) },
          { $project: {
            hasVisible: 0
          }}
        ]);
        setStorage('creators_'+limit, allData);
      }
      
      const cachedCount = getStorage('creators_count');
      if(cachedCount){
        count = cachedCount;
      }else{
        count = await Tweets.distinct('screen_name', baseFilter).then(names => names.length);
        setStorage('creators_count', count);
      }
    } else if (action === 'detail') {
        const tweet_id = searchParams.get('tweet_id');
        allData = await Tweets.find({ tweet_id }).limit(1);
    } else if (action === 'search') {
        const name = searchParams.get('name');
        const screen_name = searchParams.get('screen_name');
        const text = searchParams.get('text');
        const content_type = searchParams.get('content_type');
        const date_range = searchParams.get('date_range');
        const cursor = searchParams.get('cursor') || null;
        const limit = 20;

        // 构建查询条件
        const query = {
            ...(name ? { name: { $regex: name, $options: 'i' } } : {}),
            ...(screen_name ? { screen_name: { $regex: screen_name, $options: 'i' } } : {}),
            ...(text ? { tweet_text: { $regex: text, $options: 'i' } } : {})
        };

        // 内容类型过滤
        if (content_type === 'video') {
            query.tweet_media = { $regex: '.mp4' };
        } else if (content_type === 'image') {
            query.tweet_media = { 
                $ne: null,
                $ne: '',
                $not: { $regex: '.mp4' }
            };
        }

        // 时间范围过滤
        if (date_range === 'week') {
            query.post_at = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        } else if (date_range === 'today') {
            query.post_at = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        } else if (date_range === 'month') {
            query.post_at = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
        } else if (date_range === 'quarter') {
            query.post_at = { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) };
        }

        // 如果有cursor，添加分页条件
        if (cursor && cursor !== '0') {
          try {
              // $lt: 小于
              // $gt: 大于
              // 我要取cursor之前的，所以用$lt
              query._id = { $lt: new ObjectId(cursor) };
          } catch (e) {
              // 如果cursor格式无效，忽略分页
              console.warn('Invalid cursor:', cursor);
          }
        }

        // 执行查询并获取结果
        const result = await Tweets.aggregate([
            { $match: query },
            { $project: { tweet_data: 0 } },
            { $sort: { post_at: -1 } },
            { 
                $group: {
                    _id: "$tweet_text",
                    doc: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sort: { post_at: -1 } },
            { $limit: limit }
        ]);

        allData = result;
    }
    
    return Response.json({ 
      success: true, 
      count: count,
      data: allData 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}