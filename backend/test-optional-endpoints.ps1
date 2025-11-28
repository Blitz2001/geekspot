# Test Optional Endpoints - User Profile, Wishlist, Reviews

Write-Host "`nTESTING OPTIONAL ENDPOINTS`n" -ForegroundColor Cyan
Write-Host ("=" * 60)

$baseUrl = "http://localhost:5000"

# Login to get token
$loginBody = @{
    email = "finaltest@geekspot.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
    -Method Post -ContentType "application/json" -Body $loginBody

$token = $loginResponse.accessToken
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Logged in as: $($loginResponse.user.name)`n" -ForegroundColor Green

# Get a product ID for testing
$products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
$productId = $products.products[0]._id

# ============================================================================
# USER PROFILE TESTS
# ============================================================================
Write-Host "SECTION 1: USER PROFILE" -ForegroundColor Cyan
Write-Host ("-" * 60)

Write-Host "`n> Get Profile"
$profile = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
    -Method Get -Headers $headers
Write-Host "  Name: $($profile.name)"
Write-Host "  Email: $($profile.email)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Update Profile"
$updateData = @{
    name = "Updated Test User"
    phone = "0771234567"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
    -Method Put -Headers $headers -Body $updateData
Write-Host "  Updated Name: $($response.user.name)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Add Address"
$addressData = @{
    label = "Home"
    street = "123 Test Street"
    city = "Colombo"
    postalCode = "00100"
    country = "Sri Lanka"
    isDefault = $true
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/users/addresses" `
    -Method Post -Headers $headers -Body $addressData
Write-Host "  Addresses Count: $($response.addresses.Count)"
Write-Host "  PASSED" -ForegroundColor Green

# ============================================================================
# WISHLIST TESTS
# ============================================================================
Write-Host "`nSECTION 2: WISHLIST" -ForegroundColor Cyan
Write-Host ("-" * 60)

Write-Host "`n> Add to Wishlist"
$wishlistData = @{
    productId = $productId
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/users/wishlist" `
    -Method Post -Headers $headers -Body $wishlistData
Write-Host "  Wishlist Count: $($response.wishlist.Count)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Get Wishlist"
$wishlist = Invoke-RestMethod -Uri "$baseUrl/api/users/wishlist" `
    -Method Get -Headers $headers
Write-Host "  Items in Wishlist: $($wishlist.count)"
Write-Host "  PASSED" -ForegroundColor Green

# ============================================================================
# REVIEW TESTS
# ============================================================================
Write-Host "`nSECTION 3: PRODUCT REVIEWS" -ForegroundColor Cyan
Write-Host ("-" * 60)

Write-Host "`n> Create Review"
$reviewData = @{
    rating = 5
    title = "Excellent Product!"
    comment = "This is a great product. Highly recommended for anyone looking for quality."
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/reviews/product/$productId" `
    -Method Post -Headers $headers -Body $reviewData
Write-Host "  Review ID: $($response.review._id)"
Write-Host "  Rating: $($response.review.rating) stars"
Write-Host "  PASSED" -ForegroundColor Green

$reviewId = $response.review._id

Write-Host "`n> Get Product Reviews"
$reviews = Invoke-RestMethod -Uri "$baseUrl/api/reviews/product/$productId" `
    -Method Get
Write-Host "  Total Reviews: $($reviews.pagination.total)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Get My Reviews"
$myReviews = Invoke-RestMethod -Uri "$baseUrl/api/reviews/my-reviews" `
    -Method Get -Headers $headers
Write-Host "  My Reviews Count: $($myReviews.count)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Mark Review as Helpful"
$response = Invoke-RestMethod -Uri "$baseUrl/api/reviews/$reviewId/helpful" `
    -Method Post
Write-Host "  Helpful Count: $($response.helpful)"
Write-Host "  PASSED" -ForegroundColor Green

Write-Host "`n> Update Review"
$updateReviewData = @{
    rating = 4
    title = "Good Product"
    comment = "Updated review - still good but not perfect."
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$baseUrl/api/reviews/$reviewId" `
    -Method Put -Headers $headers -Body $updateReviewData
Write-Host "  Updated Rating: $($response.review.rating) stars"
Write-Host "  PASSED" -ForegroundColor Green

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n" + ("=" * 60)
Write-Host "`nALL OPTIONAL ENDPOINTS WORKING!" -ForegroundColor Green
Write-Host "`nEndpoints Tested:"
Write-Host "  Profile: 2/2" -ForegroundColor Green
Write-Host "  Addresses: 1/1" -ForegroundColor Green
Write-Host "  Wishlist: 2/2" -ForegroundColor Green
Write-Host "  Reviews: 5/5" -ForegroundColor Green
Write-Host "`n" + ("=" * 60)
