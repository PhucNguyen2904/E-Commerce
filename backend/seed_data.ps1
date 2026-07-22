$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

# Login
Write-Host "Logging in..."
$loginBody = @{
    email = "admin@ecommerce.com"
    password = "password123"
}
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
$token = $loginResponse.accessToken

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Categories
$cats = @(
    @{ name = "Ao thun"; slug = "ao-thun" },
    @{ name = "Quan jean"; slug = "quan-jean" },
    @{ name = "Ao khoac"; slug = "ao-khoac" }
)

$catMap = @{}

foreach ($c in $cats) {
    Write-Host "Creating category $($c.name)..."
    try {
        $catRes = Invoke-RestMethod -Uri "$baseUrl/categories" -Method Post -Headers $headers -Body ($c | ConvertTo-Json)
        $catMap[$c.slug] = $catRes.id
    } catch {
        Write-Host "Failed to create category $($c.name): $_"
    }
}

# Products
$products = @(
    @{
        name = "Ao thun nam basic mau trang"
        slug = "ao-thun-nam-basic-trang"
        description = "Ao thun nam dang co ban, chat lieu cotton 100% thoang mat, mau trang"
        price = 15.00
        categoryId = $catMap["ao-thun"]
        imageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500&auto=format&fit=crop"
        quantity = 200
    },
    @{
        name = "Ao thun nu tay ngan mau den"
        slug = "ao-thun-nu-tay-ngan-den"
        description = "Ao thun nu tay ngan co tron, de phoi do, mau den"
        price = 12.00
        categoryId = $catMap["ao-thun"]
        imageUrl = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500&auto=format&fit=crop"
        quantity = 150
    },
    @{
        name = "Quan jean nu ong rong xanh"
        slug = "quan-jean-nu-ong-rong-xanh"
        description = "Quan jean nu dang ong rong thoi trang, mau xanh nhat"
        price = 35.00
        categoryId = $catMap["quan-jean"]
        imageUrl = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=500&auto=format&fit=crop"
        quantity = 80
    },
    @{
        name = "Quan jean nam dang dung xam"
        slug = "quan-jean-nam-dang-dung-xam"
        description = "Quan jean nam dang dung, chat lieu co gian nhe, mau xam dam"
        price = 38.00
        categoryId = $catMap["quan-jean"]
        imageUrl = "https://images.unsplash.com/photo-1542272604-780c8d4536cd?q=80&w=500&auto=format&fit=crop"
        quantity = 100
    },
    @{
        name = "Ao khoac denim nam"
        slug = "ao-khoac-denim-nam"
        description = "Ao khoac bo nam phong cach vintage, mau xanh co dien"
        price = 50.00
        categoryId = $catMap["ao-khoac"]
        imageUrl = "https://images.unsplash.com/photo-1495105719330-97eb3d386dce?q=80&w=500&auto=format&fit=crop"
        quantity = 45
    },
    @{
        name = "Ao khoac da nu ca tinh"
        slug = "ao-khoac-da-nu-ca-tinh"
        description = "Ao khoac da nu biker, chat lieu da PU cao cap, mau den"
        price = 65.00
        categoryId = $catMap["ao-khoac"]
        imageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500&auto=format&fit=crop"
        quantity = 30
    }
)

foreach ($p in $products) {
    Write-Host "Creating product $($p.name)..."
    try {
        $pReq = @{
            name = $p.name
            slug = $p.slug
            description = $p.description
            price = $p.price
            categoryId = $p.categoryId
            imageUrl = $p.imageUrl
        }
        $prodRes = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body ($pReq | ConvertTo-Json)
        $productId = $prodRes.id
        
        Write-Host "Updating inventory for $($p.name)..."
        $invBody = @{ quantity = $p.quantity }
        Invoke-RestMethod -Uri "$baseUrl/inventory/$productId" -Method Put -Headers $headers -Body ($invBody | ConvertTo-Json) | Out-Null
    } catch {
        Write-Host "Failed to create/update product $($p.name): $_"
    }
}

Write-Host "Data seeding completed successfully!"
