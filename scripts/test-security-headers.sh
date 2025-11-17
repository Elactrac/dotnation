#!/bin/bash

# Security Headers Test Script
# Tests that all required security headers are present in the deployed application
# Usage: ./test-security-headers.sh [URL]
# Example: ./test-security-headers.sh https://dotnation.vercel.app

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default URL (can be overridden with command line argument)
URL="${1:-https://dotnation.vercel.app}"

echo "=================================================="
echo "  Security Headers Test for DotNation"
echo "=================================================="
echo ""
echo "Testing URL: $URL"
echo ""

# Function to check if a header exists
check_header() {
    local header_name="$1"
    local header_value=$(curl -s -I "$URL" | grep -i "^$header_name:" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [ -z "$header_value" ]; then
        echo -e "${RED}✗${NC} $header_name: ${RED}MISSING${NC}"
        return 1
    else
        echo -e "${GREEN}✓${NC} $header_name: $header_value"
        return 0
    fi
}

# Function to check if CSP contains required directives
check_csp_directive() {
    local directive="$1"
    local csp=$(curl -s -I "$URL" | grep -i "^Content-Security-Policy:" | cut -d' ' -f2-)
    
    if echo "$csp" | grep -q "$directive"; then
        echo -e "  ${GREEN}✓${NC} CSP contains '$directive'"
        return 0
    else
        echo -e "  ${RED}✗${NC} CSP missing '$directive'"
        return 1
    fi
}

echo "----------------------------------------"
echo "Testing Required Security Headers"
echo "----------------------------------------"
echo ""

# Track pass/fail counts
PASSED=0
FAILED=0

# Check all required headers
if check_header "Content-Security-Policy"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "X-Frame-Options"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "X-Content-Type-Options"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "X-XSS-Protection"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "Referrer-Policy"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "Permissions-Policy"; then ((PASSED++)); else ((FAILED++)); fi
if check_header "Strict-Transport-Security"; then ((PASSED++)); else ((FAILED++)); fi

echo ""
echo "----------------------------------------"
echo "Testing CSP Directives"
echo "----------------------------------------"
echo ""

# Check critical CSP directives
check_csp_directive "default-src" && ((PASSED++)) || ((FAILED++))
check_csp_directive "script-src" && ((PASSED++)) || ((FAILED++))
check_csp_directive "style-src" && ((PASSED++)) || ((FAILED++))
check_csp_directive "img-src" && ((PASSED++)) || ((FAILED++))
check_csp_directive "connect-src" && ((PASSED++)) || ((FAILED++))
check_csp_directive "frame-ancestors" && ((PASSED++)) || ((FAILED++))
check_csp_directive "upgrade-insecure-requests" && ((PASSED++)) || ((FAILED++))

echo ""
echo "----------------------------------------"
echo "Additional Security Checks"
echo "----------------------------------------"
echo ""

# Check if site is served over HTTPS
if [[ "$URL" == https://* ]]; then
    echo -e "${GREEN}✓${NC} Site served over HTTPS"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Site not served over HTTPS (expected for localhost)"
fi

# Check if assets have cache headers
ASSETS_URL="$URL/assets/index.js"
CACHE_HEADER=$(curl -s -I "$ASSETS_URL" 2>/dev/null | grep -i "^Cache-Control:" | cut -d' ' -f2- | tr -d '\r\n')
if [ -n "$CACHE_HEADER" ]; then
    echo -e "${GREEN}✓${NC} Cache-Control for assets: $CACHE_HEADER"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Cache-Control header not found for assets (may not exist yet)"
fi

echo ""
echo "=========================================="
echo "           Test Results"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All security headers are properly configured! 🎉${NC}"
    exit 0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}Most security headers are configured ($PERCENTAGE%) ⚠️${NC}"
    exit 0
else
    echo -e "${RED}Security headers need attention ($PERCENTAGE% passed) ❌${NC}"
    exit 1
fi
