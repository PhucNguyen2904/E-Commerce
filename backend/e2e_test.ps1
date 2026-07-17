$ErrorActionPreference = "Stop"
Write-Host "========================================="
Write-Host "  E-Commerce Platform - End-to-End Test  "
Write-Host "========================================="

$baseUrl = "http://localhost:8080/api"

# 1. Register Admin User
Write-Host "`n[1] Registering Admin User (admin_e2e@ecommerce.com)..."
$registerBody = @{
    email = "admin_e2e@ecommerce.com"
    password = "password123"
    fullName = "End to End Admin"
}
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ($registerBody | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Registered successfully. ID: $($regResponse.id)"
} catch {
    Write-Host "User might already exist. Proceeding..."
}

# Grant ADMIN role directly via DB
Write-Host "[1.1] Granting ADMIN role via PostgreSQL..."
docker exec postgres psql -U ecommerce -d auth_db -c "UPDATE users SET role='ADMIN' WHERE email='admin_e2e@ecommerce.com';" | Out-Null
Write-Host "ADMIN role granted."

# 2. Login
Write-Host "`n[2] Logging in..."
$loginBody = @{
    email = "admin_e2e@ecommerce.com"
    password = "password123"
}
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.accessToken
Write-Host "Logged in successfully. Token acquired."

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 3. Create Category
Write-Host "`n[3] Creating Category..."
$catBody = @{
    name = "Laptops"
    slug = "laptops-$(Get-Random)"
}
$catResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method Post -Headers $headers -Body ($catBody | ConvertTo-Json)
$categoryId = $catResponse.id
Write-Host "Category created. ID: $categoryId"

# 4. Create Product
Write-Host "`n[4] Creating Product..."
$prodBody = @{
    name = "MacBook Pro M3"
    slug = "macbook-pro-m3-$(Get-Random)"
    description = "Apple Silicon"
    price = 2000.00
    categoryId = $categoryId
    imageUrl = "http://example.com/macbook.jpg"
}
$prodResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body ($prodBody | ConvertTo-Json)
$productId = $prodResponse.id
Write-Host "Product created. ID: $productId"

# 5. Add Inventory
Write-Host "`n[5] Updating Inventory..."
$invBody = @{
    quantity = 50
}
Invoke-RestMethod -Uri "$baseUrl/inventory/$productId" -Method Put -Headers $headers -Body ($invBody | ConvertTo-Json) | Out-Null
Write-Host "Inventory updated to 50 items."

# 6. Add to Cart
Write-Host "`n[6] Adding product to Cart..."
$cartBody = @{
    productId = $productId
    quantity = 2
}
Invoke-RestMethod -Uri "$baseUrl/cart/items" -Method Post -Headers $headers -Body ($cartBody | ConvertTo-Json) | Out-Null
Write-Host "Product added to cart."

# 7. Checkout (Order)
Write-Host "`n[7] Placing Order..."
$orderBody = @{
    shippingAddress = "123 Test Street, Ho Chi Minh City"
}
$orderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body ($orderBody | ConvertTo-Json)
$orderId = $orderResponse.id
Write-Host "Order placed. ID: $orderId"
Write-Host "Current Status: $($orderResponse.status)"

# 8. Wait for Saga to complete
Write-Host "`n[8] Waiting 5 seconds for Saga Orchestration to complete..."
Start-Sleep -Seconds 5

# 9. Verify Order Status
Write-Host "`n[9] Verifying Order Status..."
$finalOrder = Invoke-RestMethod -Uri "$baseUrl/orders/$orderId" -Method Get -Headers $headers
Write-Host "Final Order Status: $($finalOrder.status)"

if ($finalOrder.status -eq "CONFIRMED") {
    Write-Host "`n[SUCCESS] E2E Test Passed! Order was successfully confirmed."
} else {
    Write-Host "`n[FAILED] Expected CONFIRMED, but got $($finalOrder.status)"
}

Write-Host "Check Mailhog UI at http://localhost:8025 to see the confirmation email."
