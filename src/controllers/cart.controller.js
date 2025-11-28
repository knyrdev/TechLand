// Cart Controller
import { products } from "./product.controller.js";
import { courses } from "./course.controller.js";

export const getCart = (req, res) => {
    const cart = req.session.cart || [];
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16; // 16% tax
    const total = subtotal + tax;

    res.render("pages/cart/index", {
        title: "Shopping Cart - TechLand",
        cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    });
};

export const addToCart = (req, res) => {
    const { id, type, quantity = 1 } = req.body;
    
    if (!req.session.cart) {
        req.session.cart = [];
    }

    let item;
    if (type === "product") {
        item = products.find(p => p.id === parseInt(id));
    } else if (type === "course") {
        item = courses.find(c => c.id === parseInt(id));
    }

    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }

    // Check if item already in cart
    const existingIndex = req.session.cart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.type === type
    );

    if (existingIndex > -1) {
        // Update quantity for products only
        if (type === "product") {
            req.session.cart[existingIndex].quantity += parseInt(quantity);
        }
    } else {
        // Add new item
        req.session.cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            type,
            quantity: type === "course" ? 1 : parseInt(quantity)
        });
    }

    // If AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({ 
            success: true, 
            cartCount: req.session.cart.length,
            message: `${item.name} added to cart`
        });
    }

    // Otherwise redirect back
    res.redirect("back");
};

export const updateCartItem = (req, res) => {
    const { id, type, quantity } = req.body;
    
    if (!req.session.cart) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const itemIndex = req.session.cart.findIndex(
        item => item.id === parseInt(id) && item.type === type
    );

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in cart" });
    }

    if (parseInt(quantity) <= 0) {
        // Remove item if quantity is 0 or less
        req.session.cart.splice(itemIndex, 1);
    } else {
        req.session.cart[itemIndex].quantity = parseInt(quantity);
    }

    // Calculate new totals
    const subtotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    res.json({ 
        success: true,
        cartCount: req.session.cart.length,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    });
};

export const removeFromCart = (req, res) => {
    const { id, type } = req.body;
    
    if (!req.session.cart) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const itemIndex = req.session.cart.findIndex(
        item => item.id === parseInt(id) && item.type === type
    );

    if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in cart" });
    }

    req.session.cart.splice(itemIndex, 1);

    // Calculate new totals
    const subtotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    // If AJAX request, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({ 
            success: true,
            cartCount: req.session.cart.length,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        });
    }

    res.redirect("/cart");
};

export const clearCart = (req, res) => {
    req.session.cart = [];
    
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({ success: true, cartCount: 0 });
    }

    res.redirect("/cart");
};

export const getCheckout = (req, res) => {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        return res.redirect("/cart");
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    res.render("pages/cart/checkout", {
        title: "Checkout - TechLand",
        cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    });
};