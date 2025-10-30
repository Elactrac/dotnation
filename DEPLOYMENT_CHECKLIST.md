# Quick Deployment Checklist

## Status: Ready to Deploy! ✅

All code is tested and working locally. Follow these steps to deploy for the hackathon.

---

## 1. Deploy Backend to Render (15 minutes)

### Option A: One-Click Deploy
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo: `Elactrac/dotnation`
5. Configure:
   - **Name**: `dotnation-backend`
   - **Root Directory**: `gemini-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

6. **Add Environment Variables**:
   ```
   GEMINI_API_KEY=AIzaSyB8D-ifMbxXuSBeueT7672UlgAXvv0wcHU
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173
   ```

7. Click "Create Web Service"
8. Wait 3-5 minutes for deployment
9. **Copy the backend URL** (e.g., `https://dotnation-backend.onrender.com`)

### Verify Backend
```bash
curl https://dotnation-backend.onrender.com/health
# Should return: {"status":"ok","message":"Gemini backend is running"}
```

---

## 2. Deploy Frontend to Vercel (10 minutes)

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import `Elactrac/dotnation`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. **Add Environment Variables**:
   ```
   VITE_BACKEND_URL=https://dotnation-backend.onrender.com
   VITE_NETWORK_NAME=Shibuya Testnet
   VITE_RPC_ENDPOINT=wss://shibuya.public.blastapi.io
   VITE_CONTRACT_ADDRESS=5EjvrkfMmsRzog1BcvwrPcwCnVvxfQMpChtDKKpS6zQTKkxu
   VITE_APP_VERSION=1.0.0
   ```

7. Click "Deploy"
8. Wait 2-3 minutes for build
9. **Copy the frontend URL** (e.g., `https://dotnation.vercel.app`)

### Update Backend CORS
Go back to Render dashboard and update backend environment variables:
```
ALLOWED_ORIGINS=https://dotnation.vercel.app,http://localhost:5173
```

---

## 3. Test Live Deployment (5 minutes)

1. Open your frontend URL in browser
2. Test these features:
   - ✅ Landing page loads
   - ✅ Wallet connection works
   - ✅ Browse campaigns page loads
   - ✅ Captcha modal appears (test on create campaign)
   - ✅ AI features work (if Gemini API active)

---

## 4. Update Documentation (5 minutes)

### Update HACKATHON_SUBMISSION.md

Replace the placeholder URLs:

```markdown
## 🌐 Live Demo

- **Frontend**: https://dotnation.vercel.app
- **Backend API**: https://dotnation-backend.onrender.com
- **Smart Contract**: 5EjvrkfMmsRzog1BcvwrPcwCnVvxfQMpChtDKKpS6zQTKkxu (Shibuya)
```

### Update README.md

Add deployment section:

```markdown
## 🚀 Live Demo

Try DotNation now: **https://dotnation.vercel.app**
```

---

## 5. Create Demo Assets (Optional but Recommended)

### Take Screenshots
- Landing page
- Campaign browsing
- Create campaign form
- Captcha modal
- Dashboard view

### Record Quick Demo Video (5 minutes)
Use Loom or OBS to record:
1. Landing page overview (30 sec)
2. Browse campaigns (30 sec)
3. Connect wallet (30 sec)
4. Captcha system demo (1 min)
5. Create campaign flow (1 min)
6. AI features if available (1 min)

Upload to YouTube (unlisted) and add link to docs.

---

## 6. Final Checklist

Before submission, verify:

- [ ] Backend is deployed and health check passes
- [ ] Frontend is deployed and loads correctly
- [ ] All environment variables are set correctly
- [ ] CORS is configured to allow frontend URL
- [ ] Documentation has live URLs updated
- [ ] README.md has live demo link
- [ ] HACKATHON_SUBMISSION.md is complete
- [ ] Screenshots added to docs (optional)
- [ ] Demo video created and linked (optional)

---

## Deployment Commands Reference

### Backend Testing
```bash
# Health check
curl https://YOUR-BACKEND-URL/health

# Test captcha
curl -X POST https://YOUR-BACKEND-URL/api/captcha/create-session

# Check stats
curl https://YOUR-BACKEND-URL/api/captcha/stats
```

### Frontend Testing
```bash
# Local build test
cd frontend
npm run build

# Test production build locally
npm run preview
```

---

## Troubleshooting

### Backend Issues

**"Module not found" error**
- Verify `gemini-backend` is set as root directory
- Check all dependencies are in `gemini-backend/package.json`

**CORS errors**
- Update `ALLOWED_ORIGINS` in backend to include frontend URL
- Restart backend service after environment variable changes

**Captcha not working**
- Verify `VITE_BACKEND_URL` in frontend matches backend URL
- Check backend `/api/captcha/stats` endpoint is accessible

### Frontend Issues

**Blank page after deployment**
- Check browser console for errors
- Verify all `VITE_*` environment variables are set
- Ensure build output directory is `dist`

**"Network error" messages**
- Check `VITE_RPC_ENDPOINT` is correct
- Try connecting wallet first
- Check smart contract address is valid

**Backend API not connecting**
- Verify `VITE_BACKEND_URL` matches deployed backend
- Check CORS configuration in backend
- Test backend health endpoint directly

---

## Alternative Deployment Options

### Railway (Backend)
```bash
npm install -g @railway/cli
railway login
cd gemini-backend
railway init
railway up
```

### Netlify (Frontend)
Similar to Vercel:
1. Connect GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## Environment Variables Quick Copy

### Backend (Render/Railway/Heroku)
```
GEMINI_API_KEY=AIzaSyB8D-ifMbxXuSBeueT7672UlgAXvv0wcHU
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://dotnation.vercel.app,http://localhost:5173
```

### Frontend (Vercel/Netlify)
```
VITE_BACKEND_URL=https://dotnation-backend.onrender.com
VITE_NETWORK_NAME=Shibuya Testnet
VITE_RPC_ENDPOINT=wss://shibuya.public.blastapi.io
VITE_CONTRACT_ADDRESS=5EjvrkfMmsRzog1BcvwrPcwCnVvxfQMpChtDKKpS6zQTKkxu
VITE_APP_VERSION=1.0.0
```

---

## Next Steps After Deployment

1. **Test thoroughly** - Spend 10-15 minutes testing all features
2. **Update documentation** - Add live URLs to all docs
3. **Create demo video** - 3-5 minute walkthrough
4. **Take screenshots** - Add to HACKATHON_SUBMISSION.md
5. **Submit to hackathon** - Follow submission guidelines

---

## Support

If you encounter issues:
1. Check logs in Render/Vercel dashboard
2. Verify all environment variables are correct
3. Test backend health endpoint directly
4. Check browser console for frontend errors

---

**Estimated Total Time: 30-45 minutes**

Ready to deploy! 🚀
