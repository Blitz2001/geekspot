# Test all new backend endpoints
Write-Host "🧪 Testing Geekspot Backend Endpoints" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# First, login as admin to get token
Write-Host "1. Admin Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/admin/login" -Method Post -Body (@{
    email = "admin@geekspot.lk"
    password = "admin123"
} | ConvertTo-Json) -ContentType "application/json"

if ($loginResponse.success) {
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
} else {
    Write-Host "❌ Admin login failed!" -ForegroundColor Red
    exit
}

Write-Host "`n======================================`n" -ForegroundColor Cyan

# Test Category Endpoints
Write-Host "2. Testing Category Endpoints..." -ForegroundColor Yellow

# Get all categories (public)
Write-Host "   - GET /api/categories (public)" -ForegroundColor Gray
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Get
    Write-Host "   ✅ Got $($categories.count) categories" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Create category (admin)
Write-Host "   - POST /api/categories (admin)" -ForegroundColor Gray
try {
    $newCategory = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Headers $headers -Body (@{
        name = "Test Category"
        slug = "test-category-$(Get-Random)"
        description = "Test category for endpoint testing"
        icon = "test-icon"
    } | ConvertTo-Json)
    Write-Host "   ✅ Category created: $($newCategory.category.name)" -ForegroundColor Green
    $testCategoryId = $newCategory.category._id
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get category by ID (public)
if ($testCategoryId) {
    Write-Host "   - GET /api/categories/:id (public)" -ForegroundColor Gray
    try {
        $category = Invoke-RestMethod -Uri "$baseUrl/categories/$testCategoryId" -Method Get
        Write-Host "   ✅ Got category: $($category.category.name)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n======================================`n" -ForegroundColor Cyan

# Test Customer Endpoints
Write-Host "3. Testing Customer Endpoints..." -ForegroundColor Yellow

# Get all customers (admin)
Write-Host "   - GET /api/customers (admin)" -ForegroundColor Gray
try {
    $customers = Invoke-RestMethod -Uri "$baseUrl/customers" -Method Get -Headers $headers
    Write-Host "   ✅ Got $($customers.total) customers" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get customer stats (admin)
Write-Host "   - GET /api/customers/stats (admin)" -ForegroundColor Gray
try {
    $customerStats = Invoke-RestMethod -Uri "$baseUrl/customers/stats" -Method Get -Headers $headers
    Write-Host "   ✅ Total customers: $($customerStats.stats.totalCustomers)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Search customers (admin)
Write-Host "   - GET /api/customers/search (admin)" -ForegroundColor Gray
try {
    $searchResults = Invoke-RestMethod -Uri "$baseUrl/customers/search?q=test" -Method Get -Headers $headers
    Write-Host "   ✅ Search returned $($searchResults.count) results" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n======================================`n" -ForegroundColor Cyan

# Test Analytics Endpoints
Write-Host "4. Testing Analytics Endpoints..." -ForegroundColor Yellow

# Get dashboard stats (admin)
Write-Host "   - GET /api/analytics/dashboard (admin)" -ForegroundColor Gray
try {
    $dashboardStats = Invoke-RestMethod -Uri "$baseUrl/analytics/dashboard" -Method Get -Headers $headers
    Write-Host "   ✅ Dashboard stats:" -ForegroundColor Green
    Write-Host "      - Total Orders: $($dashboardStats.stats.totalOrders)" -ForegroundColor White
    Write-Host "      - Total Revenue: LKR $($dashboardStats.stats.totalRevenue)" -ForegroundColor White
    Write-Host "      - Total Products: $($dashboardStats.stats.totalProducts)" -ForegroundColor White
    Write-Host "      - Total Customers: $($dashboardStats.stats.totalCustomers)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get revenue data (admin)
Write-Host "   - GET /api/analytics/revenue (admin)" -ForegroundColor Gray
try {
    $revenueData = Invoke-RestMethod -Uri "$baseUrl/analytics/revenue?period=month" -Method Get -Headers $headers
    Write-Host "   ✅ Revenue data for period: $($revenueData.period)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get top products (admin)
Write-Host "   - GET /api/analytics/top-products (admin)" -ForegroundColor Gray
try {
    $topProducts = Invoke-RestMethod -Uri "$baseUrl/analytics/top-products?limit=5" -Method Get -Headers $headers
    Write-Host "   ✅ Got $($topProducts.products.Count) top products" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get order trends (admin)
Write-Host "   - GET /api/analytics/order-trends (admin)" -ForegroundColor Gray
try {
    $orderTrends = Invoke-RestMethod -Uri "$baseUrl/analytics/order-trends?days=7" -Method Get -Headers $headers
    Write-Host "   ✅ Order trends for $($orderTrends.days) days" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

# Get customer insights (admin)
Write-Host "   - GET /api/analytics/customer-insights (admin)" -ForegroundColor Gray
try {
    $customerInsights = Invoke-RestMethod -Uri "$baseUrl/analytics/customer-insights" -Method Get -Headers $headers
    Write-Host "   ✅ Customer insights:" -ForegroundColor Green
    Write-Host "      - New this month: $($customerInsights.insights.newCustomersThisMonth)" -ForegroundColor White
    Write-Host "      - Repeat customers: $($customerInsights.insights.repeatCustomers)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Failed: $_" -ForegroundColor Red
}

Write-Host "`n======================================`n" -ForegroundColor Cyan

# Cleanup - Delete test category
if ($testCategoryId) {
    Write-Host "5. Cleanup - Deleting test category..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/categories/$testCategoryId" -Method Delete -Headers $headers
        Write-Host "   ✅ Test category deleted" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Could not delete test category (may have products)" -ForegroundColor Yellow
    }
}

Write-Host "`n======================================`n" -ForegroundColor Cyan
Write-Host "🎉 Endpoint Testing Complete!" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan
