---
layout: post
title:  "GitHub Pages Cache Fix - Force Deployment Guide"
date:   2025-08-22 12:12:00 +0000
categories: deployment
---

# GitHub Pages Cache Refresh

## Problem
After merging the neural glow theme, GitHub Pages appeared to be "hours out of date" despite the automatic deployment working correctly. This was due to CDN/browser caching preventing users from seeing the updated theme.

## Root Cause
- GitHub Pages workflow was functioning correctly
- Latest neural glow theme was deployed at 12:04:12Z
- CDN and browser caching was serving old versions of CSS files

## Solution Implemented

### 1. Cache Busting
Added timestamp-based cache busting to CSS files using Jekyll's `site.time` variable:
```scss
/* Cache bust: {{ site.time | date: "%Y%m%d%H%M%S" }} */
```

### 2. Manual Deployment Trigger
Enhanced the GitHub Pages workflow with a manual dispatch option:
- Go to Actions > Deploy GitHub Pages
- Click "Run workflow"
- Optionally check "Force deployment to refresh cache"

### 3. Build Timestamping
Added build timestamps to help track deployment times and ensure cache refresh.

## How to Force Cache Refresh

1. **Manual Workflow Dispatch**: Navigate to GitHub Actions and manually trigger the "Deploy GitHub Pages" workflow
2. **Make a Small Change**: Edit any file in the `docs/` directory to trigger automatic deployment
3. **Browser Cache**: Use Ctrl+F5 or Cmd+Shift+R to hard refresh your browser

## Prevention
The implemented cache-busting mechanism should prevent this issue in the future by ensuring each deployment generates CSS with unique timestamps.