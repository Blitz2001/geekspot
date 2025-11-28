# Test Product API Endpoints

## First, make a user admin in MongoDB
# Connect to MongoDB and run:
# db.users.updateOne({email: "finaltest@geekspot.com"}, {$set: {role: "admin"}})

## 1. Login to get JWT token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"finaltest@geekspot.com","password":"password123"}'

$token = $loginResponse.accessToken
Write-Host "✅ Logged in. Token: $($token.Substring(0,20))..."

## 2. Create a product
$productData = @{
  title = "ASUS ROG Strix G16 Gaming Laptop"
  category = "laptops"
  brand = "ASUS"
  price = 185000
  salePrice = 175000
  stock = 15
  description = "High-performance gaming laptop with Intel i9 and RTX 4070"
  shortSpecs = @(
    "Intel Core i9-13980HX"
    "NVIDIA RTX 4070 8GB"
    "16GB DDR5 RAM"
  )
  fullSpecs = @{
    Processor = "Intel Core i9-13980HX (24 cores, up to 5.6GHz)"
    Graphics = "NVIDIA GeForce RTX 4070 8GB GDDR6"
    RAM = "16GB DDR5-4800MHz (expandable to 32GB)"
    Storage = "1TB PCIe 4.0 NVMe SSD"
    Display = "16-inch QHD+ (2560x1600) 240Hz"
    OS = "Windows 11 Home"
  }
  images = @(
    @{
      url = "https://example.com/asus-rog-1.jpg"
      alt = "ASUS ROG Strix G16 Front View"
    }
  )
} | ConvertTo-Json -Depth 10

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

try {
  $product = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
    -Method Post `
    -Headers $headers `
    -Body $productData
  
  Write-Host "✅ Product created successfully!"
  Write-Host "Product ID: $($product.product._id)"
  Write-Host "Slug: $($product.product.slug)"
} catch {
  Write-Host "❌ Error: $_"
  Write-Host $_.Exception.Response.StatusCode
}

## 3. Get all products
Write-Host "`n📦 Fetching all products..."
$products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method Get
Write-Host "Total products: $($products.pagination.total)"
