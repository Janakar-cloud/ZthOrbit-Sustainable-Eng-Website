#!/bin/bash

# Test Validation Script
# Run this to execute all tests for the project

echo "====================================="
echo "ZthOrbit Test Suite Runner"
echo "====================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_FAILED=0
FRONTEND_FAILED=0

# Backend Tests
echo "Running Backend Tests..."
echo "Location: $SCRIPT_DIR/server"
echo ""

cd "$SCRIPT_DIR/server"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm ci
fi

# Run tests
npm run test:run

if [ $? -ne 0 ]; then
    BACKEND_FAILED=1
    echo "Backend tests FAILED"
else
    echo "Backend tests PASSED"
fi

echo ""
echo "====================================="
echo ""

# Frontend Tests
echo "Running Frontend Tests..."
echo "Location: $SCRIPT_DIR"
echo ""

cd "$SCRIPT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm ci
fi

# Run tests
npm run test:run

if [ $? -ne 0 ]; then
    FRONTEND_FAILED=1
    echo "Frontend tests FAILED"
else
    echo "Frontend tests PASSED"
fi

echo ""
echo "====================================="
echo "Test Summary"
echo "====================================="

if [ $BACKEND_FAILED -eq 1 ]; then
    echo "❌ Backend Tests: FAILED"
else
    echo "✅ Backend Tests: PASSED"
fi

if [ $FRONTEND_FAILED -eq 1 ]; then
    echo "❌ Frontend Tests: FAILED"
else
    echo "✅ Frontend Tests: PASSED"
fi

echo ""

if [ $BACKEND_FAILED -eq 1 ] || [ $FRONTEND_FAILED -eq 1 ]; then
    echo "Some tests failed. Please review the output above."
    exit 1
else
    echo "All tests passed! 🎉"
    exit 0
fi
