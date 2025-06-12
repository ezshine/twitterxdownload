<div align="center">
  <img src="https://twitterxdownload.com/images/logo.png" alt="TwitterXDownload" width="80" height="80">
  <h1>TwitterXDownload</h1>
</div>

<p align="center">
  <!-- Keep these links. Translations will automatically update with the README. -->
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=de">Deutsch</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=es">Español</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=fr">français</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=ja">日本語</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=ko">한국어</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=pt">Português</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=ru">Русский</a> | 
  <a href="https://www.readme-i18n.com/ezshine/twitterxdownload?lang=zh">中文</a>
</p>

TwitterXDownload is a powerful Twitter video downloader (not only video). And it's also a marketing tool that helps you republish the content efficiently. You can translate threads with one click. 

So, its perfect for content creators, marketers.

BTW: also a best project for Developers to learn Next.js, HeroUI, TailwindCSS, MongoDB, etc.

## ✨ Key Features

- 🎥 **Advanced Media Extraction**: Extract videos and other media from tweets, with support for batch extraction from thread tweets.
- 🔍 **Smart Search**: Search tweets by creator, date, and media type (images/videos)
- 🌐 **Translation & Republishing**: One-click translation and republishing of tweets - an essential tool for Twitter thread marketing
- 🌍 **Multi-language Support**: Available in 12 languages for global accessibility
- 📦 **Self Hosted**:
  - 💰 **AdSense Ready**: optimized for AdSense approval
  - 📈 **SEO Optimized**: optimized for SEO

## 🚀 Self Hosted Guide

### Prerequisites

- Node.js 20+ 
- Git
- A server with Coolify installed
> Get a supercheap and stable server from RackNerd (https://my.racknerd.com/aff.php?aff=10399)

### Local Development Setup

`Star` and `Fork` this repository to your own GitHub account.

1. Clone the repository:
```bash
git clone https://github.com/your-github-username/twitterxdownload.git
cd twitterxdownload
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and configure environment variables:
```bash
cp .env.example .env.local
```

```
# MONGODB URI is required
MONGODB_URI=your-mongodb-uri
```

4. Start the development server:
```bash
npm run dev
```

### Production Deployment with Coolify

`You can skip this step if you use another deployment service like Vercel, Dokploy, etc.`

#### 1. Setting up Coolify Server

1. Install Coolify on your server:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

2. Access Coolify dashboard through your server IP:
```
http://YOUR_SERVER_IP:3000
```

#### 2. Database Setup in Coolify

`You can skip this step if you use another MongoDB service`

1. Navigate to `Projects` in Coolify side menu
2. Click `New Resource` and select `MongoDB`
3. Configure MongoDB settings:
   - Make it publicly available [✔]
   - Copy the Mongo URL (public)
4. Paste the Mongo URL to your `.env.local` file

#### 3. Environment Variables in Coolify

1. Navigate to `Projects` in Coolify side menu
2. Click `New Resource` and select `Public` or `Private` Repository
3. Select your repository (keep the default settings)
4. Click `Environment Variables` and set the variables same as `.env.local` file

#### 4. Deploying Your Site

1. Click `Deploy` button in Project's page

## 💡 Making Money with AdSense

it's perfect designed for SEO, so you can make money with AdSense easily.

1. Deploy your instance following the guide above
2. Apply for Google AdSense
3. Set up your custom domain and fill the `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` in `.env.local` file
4. Monitor and optimize your earnings through the AdSense dashboard

## 🌟 Support

If you find this project helpful, please consider giving it a star ⭐️

For support, please contact me at Twitter: [@ezshine](https://x.com/intent/follow?screen_name=ezshine)

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
