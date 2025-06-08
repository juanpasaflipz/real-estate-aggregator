# 🚀 Deployment Guide - Real Estate API

This guide will walk you through deploying your Real Estate API to Render.com (free tier).

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. API keys for the real estate services you want to use

## Step 1: Push to GitHub

First, commit and push your code:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (easiest option)
3. Authorize Render to access your repositories

## Step 3: Deploy Your API

1. Click "New +" button in Render dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure your service:
   - **Name**: `real-estate-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

## Step 4: Add Environment Variables

In Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
REST_API_PORT=3002
API_BASE_URL=https://your-app.onrender.com
INMUEBLES24_API_KEY=your_actual_key_here
VIVANUNCIOS_API_KEY=your_actual_key_here
EASYBROKER_API_KEY=your_actual_key_here
```

⚠️ **Important**: Replace `your_actual_key_here` with real API keys!

## Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment (first deploy takes ~5-10 minutes)
3. Your API will be available at: `https://your-app-name.onrender.com`

## Step 6: Test Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Search properties
curl "https://your-app-name.onrender.com/properties?city=Mexico%20City"
```

## Monitoring & Logs

- View logs in Render dashboard → "Logs" tab
- Monitor health at: `https://your-app-name.onrender.com/health`
- Render automatically restarts if your app crashes

## Free Tier Limitations

- Your API may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Limited to 750 hours/month

## Upgrading Later

When ready for production:
1. Upgrade to Render paid plan ($7/month) for always-on service
2. Or migrate to AWS/Google Cloud/Azure for more control

## Troubleshooting

### API not responding?
- Check logs in Render dashboard
- Verify environment variables are set
- Ensure build succeeded

### Getting CORS errors?
- The API already has CORS enabled for all origins
- Check your frontend is using the correct URL

### Need help?
- Check Render docs: https://render.com/docs
- Review your logs for error messages

---

🎉 **Congratulations!** Your API is now live and accessible from anywhere!