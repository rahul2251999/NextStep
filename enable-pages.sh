#!/bin/bash

# Enable GitHub Pages via GitHub CLI
# Make sure you're authenticated: gh auth login

echo "Enabling GitHub Pages for NextStep repository..."

# Enable Pages with GitHub Actions as source
gh api repos/rahul2251999/NextStep/pages \
  -X POST \
  -f source='{"branch":"main","path":"/"}' \
  --jq '.html_url'

echo ""
echo "✅ GitHub Pages enabled!"
echo "Your site will be available at: https://rahul2251999.github.io/NextStep/"

