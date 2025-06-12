# 🚀 Vercel Deployment Guide - Order Management System

## ✅ Current Deployment Status

Your Order Management System monorepo is configured and ready for Vercel deployment with:

- ✅ **Monorepo Structure**: Frontend and backend properly configured
- ✅ **Build Configuration**: Unified build process with workspace management
- ✅ **Vercel Configuration**: Optimized `vercel.json` for monorepo deployment
- ✅ **CORS Configuration**: Updated for production with Vercel URL support

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables in Vercel Dashboard

Your `vercel.json` is now configured to automatically provision storage. Set these environment variables in your Vercel project settings:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/order-management?retryWrites=true&w=majority
NODE_ENV=production
PRODUCTION_URL=https://your-app.vercel.app
```

**Storage variables are auto-configured by vercel.json:**
- `KV_REST_API_URL` - Auto-linked to oms-cache KV database
- `KV_REST_API_TOKEN` - Auto-linked to oms-cache KV database
- `BLOB_READ_WRITE_TOKEN` - Auto-linked to oms-files Blob store

### 2. Verify Build Configuration

Your current setup:
- **Root Build Command**: `npm run build`
- **Frontend Output**: `frontend/dist`
- **Backend Function**: `backend/index.js`

## 🌐 Deployment Process

### Option 1: Automatic Deployment with Storage (Recommended)

1. **Connect Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub/GitLab repository
   - Vercel will auto-detect the monorepo structure

2. **Storage Auto-Provisioning**:
   - Your `vercel.json` automatically creates:
     - **KV Database**: `oms-cache` for caching
     - **Blob Store**: `oms-files` for file storage
   - Environment variables are auto-linked

3. **Set Required Environment Variables**:
   - Add `MONGODB_URI` with your MongoDB connection string
   - Add `PRODUCTION_URL` with your Vercel app URL
   - Storage variables are automatically configured

4. **Deploy**: Click "Deploy" - Vercel will:
   - Create storage resources
   - Build and deploy your app
   - Link storage to your functions

### Option 2: Manual Deployment via CLI with Storage Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run storage setup script (optional - auto-creates storage)
node scripts/setup-vercel-storage.js

# Deploy from project root
vercel

# Pull environment variables locally
vercel env pull .env.local
```

## 🔍 Post-Deployment Verification

### 1. Test Your Deployment

Use the verification script:

```bash
# Test your deployed app
node scripts/verify-deployment.js https://your-app.vercel.app
```

### 2. Manual Testing

#### Frontend Test:
- Visit: `https://your-app.vercel.app`
- Should load the React application
- Check browser console for errors

#### Backend API Test:
- Visit: `https://your-app.vercel.app/api`
- Should return JSON health check response
- Test orders endpoint: `https://your-app.vercel.app/api/orders`

### 3. Check Vercel Function Logs

- Go to Vercel Dashboard → Your Project → Functions
- Click on `backend/index.js` function
- Check logs for MongoDB connection status

## 🐛 Common Issues & Solutions

### Issue 1: Build Failures

**Symptoms**: Deployment fails during build
**Solutions**:
- Check Vercel build logs
- Verify all dependencies are in correct package.json files
- Ensure Node.js version compatibility (18+)

### Issue 2: API Routes Return 404

**Symptoms**: Frontend loads but API calls fail
**Solutions**:
- Verify `vercel.json` routing configuration
- Check function logs in Vercel dashboard
- Ensure backend environment variables are set

### Issue 3: MongoDB Connection Errors

**Symptoms**: API returns 500 errors, database connection fails
**Solutions**:
- Verify `MONGODB_URI` environment variable
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has proper permissions

### Issue 4: CORS Errors

**Symptoms**: Frontend can't connect to API
**Solutions**:
- Backend CORS is already configured for Vercel
- Set `PRODUCTION_URL` environment variable
- Check browser network tab for specific CORS errors

## 📊 Monitoring & Maintenance

### 1. Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and usage

### 2. Function Logs
- Regularly check function logs for errors
- Monitor MongoDB connection health

### 3. Environment Variables
- Keep MongoDB credentials secure
- Rotate database passwords periodically

## 🚀 Optimization Tips

### 1. Performance
- Frontend is already optimized with code splitting
- Backend uses efficient MongoDB connection pooling

### 2. Caching
- Static assets are automatically cached by Vercel
- Consider adding API response caching if needed

### 3. Monitoring
- Set up Vercel monitoring alerts
- Monitor MongoDB Atlas metrics

## 📞 Support

If you encounter issues:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **MongoDB Atlas Support**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
3. **Project Issues**: Check the repository issues page

---

🎉 **Your Order Management System is now production-ready on Vercel!**
