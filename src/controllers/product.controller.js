// Product Controller

// Temporary in-memory product storage (replace with database later)
const products = [
    {
        id: 1,
        name: "Laptop Gaming Pro",
        description: "High-performance gaming laptop with RTX 4080",
        price: 1599.99,
        category: "Laptops",
        image: "/images/products/laptop.jpg",
        stock: 15
    },
    {
        id: 2,
        name: "Mechanical Keyboard RGB",
        description: "Premium mechanical keyboard with Cherry MX switches",
        price: 149.99,
        category: "Peripherals",
        image: "/images/products/keyboard.jpg",
        stock: 50
    },
    {
        id: 3,
        name: "Gaming Mouse Pro",
        description: "Wireless gaming mouse with 25K DPI sensor",
        price: 89.99,
        category: "Peripherals",
        image: "/images/products/mouse.jpg",
        stock: 75
    },
    {
        id: 4,
        name: "4K Monitor 27\"",
        description: "Professional 4K IPS monitor for gaming and design",
        price: 499.99,
        category: "Monitors",
        image: "/images/products/monitor.jpg",
        stock: 20
    }
];

export const getAllProducts = (req, res) => {
    const { category, search, sort } = req.query;
    let filteredProducts = [...products];

    // Filter by category
    if (category) {
        filteredProducts = filteredProducts.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Search by name
    if (search) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Sort products
    if (sort === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];

    res.render("pages/products/index", {
        title: "Products - TechLand",
        products: filteredProducts,
        categories,
        currentCategory: category || "",
        currentSearch: search || "",
        currentSort: sort || ""
    });
};

export const getProductById = (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
        return res.status(404).render("errors/404", {
            title: "Product Not Found"
        });
    }

    // Get related products (same category)
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    res.render("pages/products/detail", {
        title: `${product.name} - TechLand`,
        product,
        relatedProducts
    });
};

// Export products array for use in other controllers
export { products };