# Hackathon Submission Checklist

Use this checklist to ensure everything is ready before submitting to the hackathon.

---

## Pre-Deployment Checklist

### Code Quality
- [x] All code is committed to GitHub
- [x] No syntax errors
- [x] Frontend builds successfully (`npm run build`)
- [x] Backend starts without errors
- [x] All tests pass (where applicable)
- [x] No security vulnerabilities (`npm audit`)
- [x] Code is well-commented
- [x] Follows best practices

### Documentation
- [x] README.md is complete and clear
- [x] HACKATHON_SUBMISSION.md is comprehensive
- [x] DEMO_GUIDE.md for judges
- [x] DEPLOYMENT_CHECKLIST.md with instructions
- [x] LICENSE file exists (MIT)
- [x] CONTRIBUTING.md guidelines
- [x] All guides are up-to-date

### Configuration
- [x] Environment variable examples provided
- [x] .gitignore excludes sensitive files
- [x] Deployment config files present (render.yaml, Procfile, etc.)
- [x] CORS configuration ready
- [x] Security headers configured
- [x] Rate limiting implemented

---

## Deployment Checklist

### Backend Deployment
- [ ] Backend deployed to Render/Railway/Heroku
- [ ] Health endpoint accessible (`/health`)
- [ ] Captcha endpoints working
- [ ] Fraud detection API functional
- [ ] Environment variables set correctly:
  - [ ] `GEMINI_API_KEY`
  - [ ] `NODE_ENV=production`
  - [ ] `ALLOWED_ORIGINS` (with frontend URL)
  - [ ] `PORT=3001`
- [ ] Backend URL copied: `___________________________________`

### Frontend Deployment
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Site loads correctly
- [ ] No console errors
- [ ] Environment variables set correctly:
  - [ ] `VITE_BACKEND_URL` (backend URL)
  - [ ] `VITE_NETWORK_NAME`
  - [ ] `VITE_RPC_ENDPOINT`
  - [ ] `VITE_CONTRACT_ADDRESS`
  - [ ] `VITE_APP_VERSION`
- [ ] Frontend URL copied: `___________________________________`

### CORS Configuration
- [ ] Backend `ALLOWED_ORIGINS` updated with frontend URL
- [ ] Backend service restarted after CORS update
- [ ] CORS tested (no errors in browser console)

---

## Functionality Testing

### Core Features (Must Work)
- [ ] Landing page loads
- [ ] Navigation works (all links)
- [ ] Wallet connection works
- [ ] Browse campaigns page loads
- [ ] Campaign cards display correctly
- [ ] Campaign details page loads
- [ ] Create campaign form appears
- [ ] Captcha modal works
- [ ] Captcha verification succeeds
- [ ] Backend API calls succeed

### Advanced Features (Nice to Have)
- [ ] Campaign creation succeeds (if testnet active)
- [ ] Donation flow works
- [ ] Dashboard displays data
- [ ] Batch operations UI functional
- [ ] Search/filter works
- [ ] Pagination works
- [ ] AI features work (if API key active)

### Security Features (Critical)
- [ ] Captcha appears on protected actions
- [ ] Rate limiting prevents spam
- [ ] Input validation works
- [ ] Error handling is graceful
- [ ] No sensitive data exposed in errors
- [ ] HTTPS enforced on production

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No console warnings/errors
- [ ] Images load properly
- [ ] Responsive on mobile
- [ ] Smooth animations
- [ ] API responses < 1 second

---

## Documentation Updates

### README.md
- [ ] Live demo URLs updated
- [ ] Frontend URL added
- [ ] Backend URL added
- [ ] Smart contract address confirmed
- [ ] Badges working (CI/CD)
- [ ] Quick start instructions accurate

### HACKATHON_SUBMISSION.md
- [ ] Live demo section updated (lines 46-54)
- [ ] Frontend URL added
- [ ] Backend URL added
- [ ] Smart contract address added
- [ ] Demo video link added (if available)
- [ ] Screenshots added (if available)
- [ ] All placeholders replaced

### Other Documentation
- [ ] DEMO_GUIDE.md URLs updated
- [ ] DEPLOYMENT_CHECKLIST.md reviewed
- [ ] QUICKSTART.md accurate
- [ ] Architecture diagrams current

---

## Visual Assets (Recommended)

### Screenshots
- [ ] Landing page screenshot
- [ ] Campaign browsing screenshot
- [ ] Campaign details screenshot
- [ ] Create campaign form screenshot
- [ ] Captcha modal screenshot
- [ ] Dashboard screenshot
- [ ] Screenshots added to docs

### Demo Video (Highly Recommended)
- [ ] Video recorded (3-5 minutes)
- [ ] Shows key features:
  - [ ] Landing page overview
  - [ ] Wallet connection
  - [ ] Campaign browsing
  - [ ] Captcha security
  - [ ] Campaign creation
  - [ ] Donation flow
  - [ ] Dashboard
- [ ] Uploaded to YouTube
- [ ] Video link added to HACKATHON_SUBMISSION.md
- [ ] Video link added to README.md

### Social Assets (Optional)
- [ ] Twitter card image (1200x630)
- [ ] GitHub social preview image
- [ ] Thumbnail for video
- [ ] Architecture diagram image

---

## Smart Contract Verification

### Contract Deployment
- [x] Contract deployed to testnet
- [x] Contract address: `5EjvrkfMmsRzog1BcvwrPcwCnVvxfQMpChtDKKpS6zQTKkxu`
- [x] Network: Shibuya (Astar)
- [x] Contract verified on explorer (if available)
- [x] Test transactions successful

### Contract Integration
- [ ] Frontend connects to contract
- [ ] Campaign creation works
- [ ] Donations work
- [ ] Withdrawals work
- [ ] Events are captured
- [ ] Error handling works

---

## Repository Verification

### GitHub
- [ ] All code pushed to main branch
- [ ] No uncommitted changes
- [ ] .gitignore working correctly
- [ ] No sensitive data in repo
- [ ] README renders correctly on GitHub
- [ ] License file visible
- [ ] Topics/tags added to repo

### CI/CD
- [ ] All GitHub Actions passing
- [ ] Contract CI passing
- [ ] Frontend CI passing
- [ ] Backend CI passing
- [ ] Security audit passing

---

## Submission Preparation

### Team Information
- [ ] Team name confirmed
- [ ] Team members listed
- [ ] Roles defined
- [ ] Contact information provided
- [ ] GitHub usernames added

### Project Information
- [ ] Project name: **DotNation**
- [ ] Tagline: "Decentralized, AI-powered crowdfunding on Polkadot"
- [ ] Category/Track selected
- [ ] Description (short): `___________________________________`
- [ ] Description (long): See HACKATHON_SUBMISSION.md
- [ ] Keywords: Polkadot, Crowdfunding, DeFi, AI, ink!, Web3

### Links
- [ ] GitHub repository: https://github.com/Elactrac/dotnation
- [ ] Live frontend: `___________________________________`
- [ ] Live backend: `___________________________________`
- [ ] Demo video: `___________________________________` (optional)
- [ ] Documentation: All in repository

### Hackathon-Specific
- [ ] Submission form completed
- [ ] All required fields filled
- [ ] Correct track/category selected
- [ ] Terms and conditions accepted
- [ ] Submission deadline confirmed: `___________________________________`

---

## Final Verification (Do This Right Before Submitting)

### 5-Minute Live Test
1. [ ] Open frontend URL in **incognito/private window**
2. [ ] Landing page loads without errors
3. [ ] Click "Browse Campaigns" → page loads
4. [ ] Click "Create Campaign" → captcha appears
5. [ ] Complete captcha → form appears
6. [ ] Check browser console → no red errors
7. [ ] Click "Connect Wallet" → extension opens
8. [ ] Test on mobile device (optional)

### Documentation Quick Review
1. [ ] Open README.md on GitHub
2. [ ] Verify all links work
3. [ ] Verify images load
4. [ ] Check for typos
5. [ ] Verify live demo links

### Repository Cleanliness
1. [ ] Run: `git status` → should be clean
2. [ ] Run: `npm run build` → should succeed
3. [ ] Check for debug logs, console.logs, TODOs
4. [ ] Verify no test files in production
5. [ ] Verify .env files not committed

---

## Submission Checklist Summary

### Must Have (Critical) ✅
- [x] Code complete and working
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Documentation complete
- [ ] README.md with live URLs
- [ ] HACKATHON_SUBMISSION.md complete
- [ ] All features tested
- [ ] GitHub repository clean

### Should Have (Important) 📝
- [ ] Demo video created
- [ ] Screenshots added
- [ ] All placeholders replaced
- [ ] Social assets created
- [ ] Team information complete

### Nice to Have (Optional) ⭐
- [ ] Architecture diagrams
- [ ] Detailed analytics
- [ ] Multi-language support
- [ ] Additional documentation

---

## Post-Submission

### After Submitting
- [ ] Confirmation email received
- [ ] Submission visible in hackathon dashboard
- [ ] All links work in submission
- [ ] Team notified of submission
- [ ] Backup copy of submission saved

### Monitoring
- [ ] Monitor deployment status
- [ ] Check error logs
- [ ] Respond to judge questions
- [ ] Be available during judging period

### Prepare for Demo (If Required)
- [ ] Rehearse demo (5-10 minutes)
- [ ] Prepare slides (optional)
- [ ] Test screen sharing
- [ ] Have backup internet connection
- [ ] Know your key talking points

---

## Emergency Contacts & Resources

### If Something Breaks
1. **Backend down**: Check Render/Railway dashboard for logs
2. **Frontend errors**: Check Vercel deployment logs
3. **Contract issues**: Check Polkadot.js explorer
4. **CORS errors**: Update backend ALLOWED_ORIGINS

### Quick Fixes
```bash
# Rebuild and redeploy frontend
cd frontend && npm run build

# Restart backend
# (Use platform dashboard to restart service)

# Check backend health
curl https://YOUR-BACKEND-URL/health

# Check frontend build locally
cd frontend && npm run preview
```

### Support Resources
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Polkadot Docs: https://docs.polkadot.network
- ink! Docs: https://use.ink

---

## Notes Section

Use this space for any additional notes, URLs, or reminders:

```
Backend URL: ___________________________________________________

Frontend URL: ___________________________________________________

Contract Address: 5EjvrkfMmsRzog1BcvwrPcwCnVvxfQMpChtDKKpS6zQTKkxu

Demo Video: ___________________________________________________

Submission ID: ___________________________________________________

Hackathon Deadline: ___________________________________________________

Additional Notes:
___________________________________________________
___________________________________________________
___________________________________________________
```

---

## Completion Status

**Overall Progress: ~98% Complete**

**Remaining Critical Tasks:**
1. Deploy backend (15 min)
2. Deploy frontend (10 min)
3. Update documentation URLs (5 min)
4. Test live deployment (5 min)

**Estimated Time to Complete: 35-45 minutes**

---

**Good luck with your submission!** 🚀

Remember: It's better to submit a working demo with placeholder screenshots than a perfect submission that's late!
