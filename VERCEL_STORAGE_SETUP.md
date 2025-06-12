# 🗄️ Vercel Storage Setup Guide

## ✅ **Fixed Build Issue**

The `vercel.json` has been corrected to remove the invalid `storage` property. Vercel storage must be configured through the dashboard or CLI, not in `vercel.json`.

## 🚀 **Correct Setup Process**

### **Option 1: Vercel Dashboard (Recommended)**

1. **Deploy Your App First**:
   ```bash
   git add .
   git commit -m "Fix vercel.json and add storage support"
   git push
   ```

2. **Create Storage in Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com) → Your Project
   - Click **Storage** tab
   - Create **KV Database**: Name it `oms-cache`
   - Create **Blob Store**: Name it `oms-files`

3. **Connect Storage to Project**:
   - In Storage tab, click **Connect** for each storage
   - This automatically adds environment variables

4. **Redeploy** (automatic if connected to Git)

### **Option 2: CLI Setup**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Run Storage Setup Script**:
   ```bash
   node scripts/setup-vercel-storage.js
   ```

3. **Link Storage to Project**:
   ```bash
   # Connect KV database
   vercel env add KV_REST_API_URL
   vercel env add KV_REST_API_TOKEN
   
   # Connect Blob store  
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## 📋 **Required Environment Variables**

After setting up storage, ensure these variables are set in Vercel:

### **Required (Manual Setup)**:
- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to `production`

### **Auto-Added by Storage Connection**:
- `KV_REST_API_URL` - KV database endpoint
- `KV_REST_API_TOKEN` - KV database token
- `BLOB_READ_WRITE_TOKEN` - Blob storage token

## 🔍 **Verification Steps**

1. **Check Storage Connection**:
   - Visit: `https://your-app.vercel.app/api/orders/health`
   - Should show all storage services as connected

2. **Test Caching**:
   - Visit: `https://your-app.vercel.app/api/orders/stats`
   - First load: slower (cache miss)
   - Second load: faster (cache hit)

3. **Run Test Script**:
   ```bash
   node scripts/test-storage.js https://your-app.vercel.app
   ```

## 🎯 **What Each Storage Does**

### **KV Database (`oms-cache`)**:
- Caches dashboard statistics (5 min)
- Caches order lists (1 min)
- Caches search results (3 min)
- **Performance**: 5-10x faster API responses

### **Blob Store (`oms-files`)**:
- Stores order attachments
- Stores generated invoices/reports
- Stores export files
- **Performance**: Global CDN delivery

## 💰 **Storage Costs**

### **KV Database**:
- **Hobby**: Free (100K requests/month)
- **Pro**: $20/month (1M requests)

### **Blob Storage**:
- **Storage**: $0.15/GB/month
- **Bandwidth**: $0.30/GB transfer

### **Typical Monthly Cost**: $0-30 depending on usage

## 🐛 **Troubleshooting**

### **Build Fails with "storage" Error**:
✅ **Fixed** - Removed invalid `storage` property from `vercel.json`

### **Storage Not Working**:
1. Check environment variables in Vercel dashboard
2. Ensure storage is connected to your project
3. Redeploy after connecting storage

### **Cache Not Working**:
1. Check KV database connection
2. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
3. Check function logs in Vercel dashboard

### **Files Not Uploading**:
1. Check Blob store connection
2. Verify `BLOB_READ_WRITE_TOKEN` is set
3. Check file size limits (Vercel Blob: 500MB max)

## 📊 **Monitoring**

### **Vercel Dashboard**:
- Functions → `backend/index.js` → View logs
- Storage → Monitor usage and performance

### **API Endpoints for Monitoring**:
- `GET /api/orders/health` - Storage health check
- `GET /api/orders/stats` - Cached statistics
- `GET /api/orders/analytics` - Performance analytics

## 🎉 **Success Indicators**

✅ **Build Completes**: No more `vercel.json` schema errors
✅ **Storage Connected**: Health check shows all green
✅ **Caching Working**: Stats endpoint responds in <50ms
✅ **Files Working**: Can upload/download from Blob storage

---

**Next Step**: Deploy your app and set up storage through the Vercel dashboard for the easiest experience!
