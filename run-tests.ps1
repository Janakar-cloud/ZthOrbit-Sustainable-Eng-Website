# Test Validation Script
# Run this to execute all tests for the project

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "ZthOrbit Test Suite Runner" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
$backendTestsFailed = $false
$frontendTestsFailed = $false

# Backend Tests
Write-Host "Running Backend Tests..." -ForegroundColor Yellow
Write-Host "Location: $rootDir\server" -ForegroundColor Gray
Write-Host ""

Push-Location "$rootDir\server"
try {
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        npm ci
    }
    
    # Run tests
    npm run test:run --if-present
    
    if ($LASTEXITCODE -ne 0) {
        $backendTestsFailed = $true
        Write-Host "Backend tests FAILED" -ForegroundColor Red
    } else {
        Write-Host "Backend tests PASSED" -ForegroundColor Green
    }
} catch {
    $backendTestsFailed = $true
    Write-Host "Error running backend tests: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Frontend Tests
Write-Host "Running Frontend Tests..." -ForegroundColor Yellow
Write-Host "Location: $rootDir" -ForegroundColor Gray
Write-Host ""

Push-Location $rootDir
try {
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm ci
    }
    
    # Run tests
    npm run test:run --if-present
    
    if ($LASTEXITCODE -ne 0) {
        $frontendTestsFailed = $true
        Write-Host "Frontend tests FAILED" -ForegroundColor Red
    } else {
        Write-Host "Frontend tests PASSED" -ForegroundColor Green
    }
} catch {
    $frontendTestsFailed = $true
    Write-Host "Error running frontend tests: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if ($backendTestsFailed) {
    Write-Host "❌ Backend Tests: FAILED" -ForegroundColor Red
} else {
    Write-Host "✅ Backend Tests: PASSED" -ForegroundColor Green
}

if ($frontendTestsFailed) {
    Write-Host "❌ Frontend Tests: FAILED" -ForegroundColor Red
} else {
    Write-Host "✅ Frontend Tests: PASSED" -ForegroundColor Green
}

Write-Host ""

if ($backendTestsFailed -or $frontendTestsFailed) {
    Write-Host "Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All tests passed! 🎉" -ForegroundColor Green
    exit 0
}
