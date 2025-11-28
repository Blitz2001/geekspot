# Geekspot Backend API - Comprehensive Test Script
# Tests all authentication, product, and order endpoints

Write-Host "`nGEEKSPOT BACKEND API TEST SUITE`n" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param($name, $scriptBlock)
    Write-Host "`n> Testing: $name" -ForegroundColor Yellow
    try {
        & $scriptBlock
        $script:testsPassed++
        Write-Host "  PASSED" -ForegroundColor Green
        return $true
    } catch {
        $script:testsFailed++
        Write-Host "  FAILED: $_" -ForegroundColor Red
        return $false
    }
}

# SECTION 1: HEALTH CHECK
Write-Host "`nSECTION 1: HEALTH CHECK" -ForegroundColor Cyan
Write-Host ("-" * 60)

Test-Endpoint "Health Check" {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($response.status -ne "OK") { throw "Health check failed" }
    Write-Host "  Server Status: $($response.status)"
}

Test-Endpoint "Root Endpoint" {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "  API Version: $($response.version)"
}

# SECTION 2: AUTHENTICATION
Write-Host "`nSECTION 2: AUTHENTICATION" -ForegroundColor Cyan
Write-Host ("-" * 60)

$testEmail = "apitest@geekspot.com"
$testPassword = "testpass123"
$accessToken = $null

Test-Endpoint "User Registration" {
    $body = @{
        name = "API Test User"
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method Post -ContentType "application/json" -Body $body
        Write-Host "  User ID: $($response.user.id)"
    } catch {
        Write-Host "  User already exists" -ForegroundColor Yellow
    }
}

Test-Endpoint "User Login" {
    $body = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post -ContentType "application/json" -Body $body
    
    $script:accessToken = $response.accessToken
    Write-Host "  User: $($response.user.name)"
}

# SECTION 3: PRODUCT ENDPOINTS
Write-Host "`nSECTION 3: PRODUCT ENDPOINTS (PUBLIC)" -ForegroundColor Cyan
Write-Host ("-" * 60)

$productSlug = $null

Test-Endpoint "Get All Products" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    Write-Host "  Total Products: $($response.pagination.total)"
    if ($response.products.Count -gt 0) {
        $script:productSlug = $response.products[0].slug
    }
}

Test-Endpoint "Get Featured Products" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products/featured" -Method Get
    Write-Host "  Featured Products: $($response.Count)"
}

Test-Endpoint "Get Products by Category" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products/category/laptops" -Method Get
    Write-Host "  Laptops Found: $($response.pagination.total)"
}

if ($productSlug) {
    Test-Endpoint "Get Product by Slug" {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/products/slug/$productSlug" -Method Get
        Write-Host "  Product: $($response.title)"
        Write-Host "  Price: LKR $($response.price)"
    }
}

Test-Endpoint "Search Products" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products?search=ASUS" -Method Get
    Write-Host "  Search Results: $($response.pagination.total)"
}

# SECTION 4: ORDER ENDPOINTS
Write-Host "`nSECTION 4: ORDER ENDPOINTS (USER)" -ForegroundColor Cyan
Write-Host ("-" * 60)

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$orderId = $null
$productId = $null

$products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
if ($products.products.Count -gt 0) {
    $productId = $products.products[0]._id
}

if ($productId) {
    Test-Endpoint "Create Order" {
        $orderData = @{
            items = @(
                @{
                    productId = $productId
                    quantity = 1
                }
            )
            shippingMethod = "delivery"
            shippingAddress = @{
                street = "456 Test Street"
                city = "Colombo"
                postalCode = "00200"
                country = "Sri Lanka"
                phone = "0771234567"
            }
            paymentMethod = "bank-transfer"
            notes = "Test order"
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/orders" `
            -Method Post -Headers $headers -Body $orderData
        
        $script:orderId = $response.order.id
        Write-Host "  Order Number: $($response.order.orderNumber)"
        Write-Host "  Total: LKR $($response.order.total)"
    }
}

Test-Endpoint "Get User Orders" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/my-orders" `
        -Method Get -Headers $headers
    Write-Host "  Total Orders: $($response.pagination.total)"
}

if ($orderId) {
    Test-Endpoint "Get Single Order" {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId" `
            -Method Get -Headers $headers
        Write-Host "  Order Number: $($response.orderNumber)"
    }

    Test-Endpoint "Upload Payment Receipt" {
        $receiptData = @{
            transactionId = "TEST-TXN-" + (Get-Date -Format "yyyyMMddHHmmss")
            receiptUrl = "https://example.com/receipts/test.jpg"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/payment-receipt" `
            -Method Post -Headers $headers -Body $receiptData
        Write-Host "  Receipt Uploaded"
    }
}

# SECTION 5: ADMIN ENDPOINTS
Write-Host "`nSECTION 5: ADMIN ENDPOINTS" -ForegroundColor Cyan
Write-Host ("-" * 60)

$adminToken = $null
$adminBody = @{
    email = "finaltest@geekspot.com"
    password = "password123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
    -Method Post -ContentType "application/json" -Body $adminBody
$adminToken = $adminResponse.accessToken

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

Test-Endpoint "Get All Orders (Admin)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/admin/all" `
        -Method Get -Headers $adminHeaders
    Write-Host "  Total Orders: $($response.pagination.total)"
}

Test-Endpoint "Get Pending Payments (Admin)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/admin/pending-payments" `
        -Method Get -Headers $adminHeaders
    Write-Host "  Pending Verifications: $($response.count)"
}

if ($orderId) {
    Test-Endpoint "Verify Payment (Admin)" {
        $verifyData = @{
            status = "confirmed"
            notes = "Payment verified"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/verify-payment" `
            -Method Post -Headers $adminHeaders -Body $verifyData
        Write-Host "  Payment Status: $($response.order.paymentStatus)"
    }

    Test-Endpoint "Update Shipping Status (Admin)" {
        $shippingData = @{
            status = "processing"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/$orderId/shipping-status" `
            -Method Patch -Headers $adminHeaders -Body $shippingData
        Write-Host "  Shipping Status: $($response.order.shippingStatus)"
    }
}

# TEST SUMMARY
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "`nTEST SUMMARY" -ForegroundColor Cyan
Write-Host ("-" * 60)
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
$successRate = [math]::Round(($testsPassed / ($testsPassed + $testsFailed)) * 100, 2)
Write-Host "Success Rate: $successRate%"

if ($testsFailed -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "`nSOME TESTS FAILED" -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
