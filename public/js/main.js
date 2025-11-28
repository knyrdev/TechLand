// TechLand Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Add to cart AJAX
    setupAddToCart();
    
    // Search functionality
    setupSearch();
    
    // Form validation
    setupFormValidation();
});

// Add to Cart functionality
function setupAddToCart() {
    const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Update cart count in navbar
                    updateCartBadge(result.cartCount);
                    
                    // Show success toast
                    showToast('Success', result.message, 'success');
                } else {
                    showToast('Error', result.error || 'Failed to add to cart', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                // Fallback to regular form submission
                this.submit();
            }
        });
    });
}

// Update cart badge in navbar
function updateCartBadge(count) {
    const cartBadge = document.querySelector('.nav-link[href="/cart"] .badge');
    
    if (count > 0) {
        if (cartBadge) {
            cartBadge.textContent = count;
        } else {
            const cartLink = document.querySelector('.nav-link[href="/cart"]');
            if (cartLink) {
                const badge = document.createElement('span');
                badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
                badge.textContent = count;
                cartLink.classList.add('position-relative');
                cartLink.appendChild(badge);
            }
        }
    } else if (cartBadge) {
        cartBadge.remove();
    }
}

// Toast notification
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1050';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <strong>${title}</strong>: ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    
    // Remove toast after hidden
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Search functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('input[name="search"]');
    
    searchInputs.forEach(input => {
        let debounceTimer;
        
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Auto-submit search after typing stops
                // this.closest('form').submit();
            }, 500);
        });
    });
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.classList.add('was-validated');
        });
    });
}

// Quantity update for cart
function updateQuantity(id, type, quantity) {
    if (quantity < 1) {
        if (confirm('Remove this item from cart?')) {
            removeFromCart(id, type);
        }
        return;
    }
    
    fetch('/cart/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ id, type, quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            showToast('Error', data.error || 'Failed to update cart', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error', 'Failed to update cart', 'danger');
    });
}

// Remove from cart
function removeFromCart(id, type) {
    fetch('/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ id, type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            showToast('Error', data.error || 'Failed to remove item', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error', 'Failed to remove item', 'danger');
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Lazy loading images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}