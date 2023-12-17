#!/bin/bash

# Exit if any command fails
set -e

# Step 1: Create a temporary directory for the build
TEMP_OUTDIR=$(mktemp -d)
echo "Temporary output directory: $TEMP_OUTDIR"

# Step 2: Build the project
node_modules/.bin/parcel build assets/index.html --no-cache --out-dir "$TEMP_OUTDIR" --public-url "./" --detailed-report

# Step 3: Checkout gh-pages branch and remove existing files
git checkout gh-pages
git rm -rf .

# Step 4: Copy only files from the temporary output directory to the root of gh-pages branch, excluding node_modules
find "$TEMP_OUTDIR" -type f ! -path "$TEMP_OUTDIR/node_modules/*" -exec cp {} . \;

# Step 5: Commit and push changes
git add .
git commit -m "Deploying to GitHub Pages"
git push origin gh-pages

# Checkout back to the original branch
git checkout -

# Optional: Clean up the temporary directory
rm -rf "$TEMP_OUTDIR"