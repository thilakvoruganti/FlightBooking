# Azure Deployment Guide - Backend Only

This guide will help you deploy the Flight Booking backend to Azure App Service.

## Prerequisites

1. Azure Account ([Create free account](https://azure.microsoft.com/free/))
2. GitHub Account
3. Azure CLI installed (optional, for command-line deployment)

## Step 1: Create Azure App Service

### Via Azure Portal:

1. **Login to Azure Portal**: https://portal.azure.com
2. **Create a new Web App**:
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"

3. **Configure the Web App**:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `flightbooking-backend` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose closest to your users
   - **Pricing plan**: Choose appropriate tier (F1 Free or B1 Basic recommended)

4. Click **Review + Create**, then **Create**

## Step 2: Configure Environment Variables in Azure

1. Go to your Web App in Azure Portal
2. Navigate to **Settings > Configuration**
3. Click **New application setting** and add each variable:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_token
   AMADEUS_CLIENT_ID=your_amadeus_client_id
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
   AMADEUS_BASE_URL=https://test.api.amadeus.com
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   PORT=8080
   FRONTEND_URL=https://your-frontend-url.com
   NODE_ENV=production
   ```

4. Click **Save** after adding all variables

## Step 3: Set Up Deployment

### Option A: GitHub Actions (Recommended)

1. **Get Publish Profile**:
   - In Azure Portal, go to your Web App
   - Click **Get publish profile** (download the file)
   - Open the file and copy its contents

2. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to **Settings > Secrets and variables > Actions**
   - Click **New repository secret**
   - Add these secrets:
     - Name: `AZURE_WEBAPP_NAME`
       Value: `flightbooking-backend` (your app name)
     - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
       Value: (paste the publish profile content)

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Azure deployment"
   git push origin main
   ```

4. The GitHub Action will automatically deploy your backend

### Option B: Direct Deployment via Azure CLI

1. **Install Azure CLI**: https://docs.microsoft.com/cli/azure/install-azure-cli

2. **Login to Azure**:
   ```bash
   az login
   ```

3. **Deploy from local**:
   ```bash
   cd backend
   zip -r deploy.zip .
   az webapp deployment source config-zip \
     --resource-group your-resource-group \
     --name flightbooking-backend \
     --src deploy.zip
   ```

### Option C: Deploy from Azure Portal

1. In Azure Portal, go to your Web App
2. Navigate to **Deployment > Deployment Center**
3. Choose deployment source:
   - **GitHub**: Connect your repository
   - **Local Git**: Use Git commands to push
   - **FTP**: Upload files manually

## Step 4: Configure CORS

If your frontend is on a different domain:

1. In Azure Portal, go to your Web App
2. Navigate to **API > CORS**
3. Add your frontend URL(s):
   - `http://localhost:3000` (for local testing)
   - `https://your-frontend-domain.com` (production)
4. Click **Save**

## Step 5: Configure Startup Command (if needed)

1. In Azure Portal, go to your Web App
2. Navigate to **Settings > Configuration**
3. Click **General settings** tab
4. Set **Startup Command**: `node backend/index.js`
5. Click **Save**

## Step 6: Verify Deployment

1. **Check Application Logs**:
   - Navigate to **Monitoring > Log stream**
   - Watch for startup messages

2. **Test the API**:
   ```bash
   curl https://flightbooking-backend.azurewebsites.net/api/v1/health
   ```

3. **Browse to your app**:
   - URL: `https://flightbooking-backend.azurewebsites.net`

## Step 7: Update Frontend URL

Update your frontend to use the Azure backend URL:
- In `src/context/Flight/index.js`, change:
  ```javascript
  axios.defaults.baseURL = "https://flightbooking-backend.azurewebsites.net/api/v1"
  ```

## Troubleshooting

### Check Logs
```bash
az webapp log tail --name flightbooking-backend --resource-group your-resource-group
```

### Common Issues:

1. **Port Issues**: Azure uses port 8080 by default, ensure `PORT` env variable is set
2. **Module Not Found**: Ensure all dependencies are in `package.json`
3. **MongoDB Connection**: Whitelist Azure IPs in MongoDB Atlas
4. **CORS Errors**: Add frontend URL to CORS settings

## MongoDB Atlas Configuration

1. Login to MongoDB Atlas
2. Go to **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (for Azure)
   - Or add specific Azure datacenter IPs

## Cost Optimization

- **Free Tier (F1)**: Good for testing, limited resources
- **Basic (B1)**: $13/month, better for production
- **Scale up/down**: Adjust in **Settings > Scale up**

## Monitoring

1. **Application Insights** (recommended):
   - Add Application Insights to your Web App
   - Monitor performance, errors, and requests

2. **Metrics**:
   - Navigate to **Monitoring > Metrics**
   - Track CPU, memory, and response times

## Security Best Practices

1. ✅ Environment variables stored in Azure Configuration (not in code)
2. ✅ HTTPS enabled by default
3. ✅ Keep secrets in Azure Key Vault (advanced)
4. ✅ Use managed identities for Azure resources
5. ✅ Enable authentication if needed

## Continuous Deployment

The GitHub Action in `.github/workflows/azure-deploy.yml` will:
- Trigger on push to `main` branch
- Install dependencies
- Deploy to Azure automatically

## Manual Deployment Commands

```bash
# Build backend
cd backend
npm install --production

# Deploy via ZIP
az webapp deployment source config-zip \
  --resource-group <resource-group> \
  --name flightbooking-backend \
  --src deploy.zip
```

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificate
3. Set up CI/CD monitoring
4. Configure auto-scaling rules
5. Set up staging slot for testing

## Support

- Azure Documentation: https://docs.microsoft.com/azure/app-service/
- Azure CLI Reference: https://docs.microsoft.com/cli/azure/
- Node.js on Azure: https://docs.microsoft.com/azure/app-service/quickstart-nodejs
