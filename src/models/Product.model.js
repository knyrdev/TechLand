// Product Model (placeholder for database integration)

class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.image = data.image;
        this.stock = data.stock;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Check if product is in stock
    isInStock() {
        return this.stock > 0;
    }

    // Check if stock is low
    isLowStock(threshold = 10) {
        return this.stock < threshold;
    }

    // Format price
    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
}

export default Product;