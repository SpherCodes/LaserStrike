# LaserStrike Frontend Deployment Guide

## Vercel Deployment Steps

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Have your backend deployed and get its URL

### 1. Manual Deployment via CLI

```bash
cd frontend/laserstrike
vercel
```

Follow the prompts:
- Link to existing project? **N**
- Project name: **laserstrike**
- Directory: **./frontend/laserstrike** (or just press Enter if already in the directory)

### 2. Environment Variables Setup

After deployment, set environment variables in Vercel Dashboard:

1. Go to your project dashboard on vercel.com
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url` | Production |
| `NODE_ENV` | `production` | Production |

### 3. GitHub Integration (Recommended)

1. Push your code to GitHub
2. Import project from GitHub in Vercel dashboard
3. Set environment variables as above
4. Enable automatic deployments

### 4. Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Important Notes

- ⚠️ **Backend Requirement**: You'll need to deploy your WebSocket backend separately (Railway, Render, or Fly.io)
- 🔒 **HTTPS Required**: Camera access requires HTTPS in production
- 🌐 **CORS**: Ensure your backend allows requests from your Vercel domain
- 📱 **Mobile Testing**: Test camera functionality on actual mobile devices

## Troubleshooting

### Common Issues:
1. **Camera not working**: Ensure HTTPS and proper permissions
2. **WebSocket connection failed**: Check backend URL and CORS settings
3. **Build failures**: Check dependencies and TypeScript errors

### Debug Commands:
```bash
# Local build test
npm run build

# Check for TypeScript errors
npm run lint
```
