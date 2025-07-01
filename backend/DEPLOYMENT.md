# LaserStrike Backend Deployment Guide for Render

## ✅ Backend Status: Ready for Deployment
The backend has been tested locally and is working with full computer vision support.

## Prerequisites
- GitHub account
- Render account (free at render.com)
- Backend code pushed to GitHub repository

## Option 1: Deploy via Render Dashboard (Recommended)

### Step 1: Push to GitHub
```bash
cd s:\Projects\laserstrike-v2
git add .
git commit -m "Prepare backend for Render deployment with full CV support"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `laserstrike-backend`
   - **Environment**: `Python 3`
   - **Region**: `Ohio` (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Advanced Settings
- **Auto-Deploy**: `Yes` (deploys automatically on git push)
- **Python Version**: `3.11`

### Step 4: Deploy
Click **"Create Web Service"** and wait for deployment to complete (~5-10 minutes for first deploy due to CV dependencies).

## Option 2: Deploy with render.yaml (Infrastructure as Code)

1. Ensure `render.yaml` is in your repository root
2. Go to Render Dashboard > **"New +"** > **"Blueprint"**
3. Connect your repository and select the `render.yaml` file

## Expected Deployment
Your backend will be deployed to: `https://laserstrike-backend-[random-id].onrender.com`

## Update Frontend Environment Variables
After successful deployment:

### Vercel Dashboard
1. Go to [vercel.com/sphercodes-projects/laserstrike](https://vercel.com/sphercodes-projects/laserstrike)
2. Navigate to **Settings** > **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` with your new Render URL:
   ```
   NEXT_PUBLIC_API_URL=https://laserstrike-backend-[your-id].onrender.com
   ```
4. **Redeploy** your frontend to apply changes

## Testing Deployment
Test these endpoints after deployment:
- Health check: `GET https://your-backend-url.onrender.com/`
- Create user: `POST https://your-backend-url.onrender.com/users`
- WebSocket: `wss://your-backend-url.onrender.com/ws/{user_id}`

## Important Notes
- 🕐 **Free Tier**: Spins down after 15 minutes of inactivity
- 🔄 **Cold Starts**: First request after sleep may take 30+ seconds
- 🖼️ **Computer Vision**: Full OpenCV + EasyOCR support included
- 🌐 **WebSockets**: Native WebSocket support for real-time gaming
- 🔒 **HTTPS**: Free SSL certificates provided
- 📦 **Dependencies**: ~76 packages including CV libraries (~500MB+ build)

## Deployment Time Estimate
- **First Deploy**: 5-10 minutes (installing CV dependencies)
- **Subsequent Deploys**: 2-3 minutes (cached dependencies)

## Troubleshooting
- **Build Timeout**: CV dependencies are large, expect longer build times
- **Memory Issues**: Free tier has 512MB RAM limit
- **Import Errors**: Check logs in Render dashboard
- **WebSocket Issues**: Ensure frontend URL is updated

## Next Steps After Deployment
1. ✅ Get your Render backend URL
2. ✅ Update Vercel environment variables
3. ✅ Redeploy frontend
4. ✅ Test full application flow
5. ✅ Test camera capture and WebSocket communication
