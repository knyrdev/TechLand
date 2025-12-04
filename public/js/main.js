// TechLand Main JavaScript
// Modern ES6+ approach

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initTooltips();
    initAddToCart();
    initFormValidation();
    initSmoothScroll();
    initLazyLoading();
});

// ============================================
// Toast Notifications
// ============================================

function showToast(title, message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const iconMap = {
        success: 'bi-check-circle',
        danger: 'bi-exclamation-circle',
        warning: 'bi-exclamation-triangle',
        info: 'bi-info-circle'
    };
    
    const bgColorMap = {
        success: 'var(--color-success)',
        danger: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)'
    };
    
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.style.cssText = `
        background: var(--color-bg-card);
        border: 1px solid var(--color-border);
        border-left: 4px solid ${bgColorMap[type]};
        border-radius: var(--radius-lg);
        padding: 1rem 1.5rem;
        margin-bottom: 0.75rem;
        box-shadow: var(--shadow-xl);
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
    `;
    
    toast.innerHTML = `
        <i class="bi ${iconMap[type]}" style="font-size: 1.25rem; color: ${bgColorMap[type]};"></i>
        <div style="flex: 1;">
            <strong style="display: block; color: var(--color-text-primary);">${title}</strong>
            <span style="color: var(--color-text-secondary); font-size: 0.875rem;">${message}</span>
        </div>
        <button type="button" class="btn-close" style="filter: invert(0.5);" onclick="this.parentElement.remove()"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// Add to Cart Functionality
// ============================================

function initAddToCart() {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form, form[action="/cart/add"]');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            const button = this.querySelector('button[type="submit"]');
            
            // Disable button and show loading
            if (button) {
                button.disabled = true;
                button.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Agregando...';
            }
            
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
                    updateCartBadge(result.cartCount);
                    showToast('¡Agregado!', result.message || 'Producto agregado al carrito', 'success');
                } else {
                    showToast('Error', result.error || 'No se pudo agregar al carrito', 'danger');
                }
            } catch (error) {
                console.error('Error:', error);
                // Fallback to regular form submission
                this.submit();
            } finally {
                // Restore button
                if (button) {
                    button.disabled = false;
                    button.innerHTML = '<i class="bi bi-cart-plus"></i> Agregar';
                }
            }
        });
    });
}

// ============================================
// Update Cart Badge
// ============================================

function updateCartBadge(count) {
    const cartLinks = document.querySelectorAll('a[href="/cart"], a[href="/carrito"]');
    
    cartLinks.forEach(cartLink => {
        let badge = cartLink.querySelector('.badge');
        
        if (count > 0) {
            if (badge) {
                badge.textContent = count;
            } else {
                badge = document.createElement('span');
                badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
                badge.style.fontSize = '0.65rem';
                badge.textContent = count;
                cartLink.classList.add('position-relative');
                cartLink.appendChild(badge);
            }
        } else if (badge) {
            badge.remove();
        }
    });
}

// ============================================
// Cart Operations
// ============================================

async function updateQuantity(id, type, quantity) {
    if (quantity < 1) {
        if (confirm('¿Eliminar este item del carrito?')) {
            await removeFromCart(id, type);
        }
        return;
    }
    
    try {
        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, type, quantity })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.reload();
        } else {
            showToast('Error', data.error || 'No se pudo actualizar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error', 'Error de conexión', 'danger');
    }
}

async function removeFromCart(id, type) {
    try {
        const response = await fetch('/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, type })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Eliminado', 'Item eliminado del carrito', 'success');
            setTimeout(() => window.location.reload(), 500);
        } else {
            showToast('Error', data.error || 'No se pudo eliminar', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error', 'Error de conexión', 'danger');
    }
}

// ============================================
// Initialize Bootstrap Tooltips
// ============================================

function initTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
    }
}

// ============================================
// Form Validation
// ============================================

function initFormValidation() {
    const forms = document.querySelectorAll('form[novalidate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.classList.add('was-validated');
        });
    });
    
    // Password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    const password = document.getElementById('password');
    
    if (confirmPassword && password) {
        confirmPassword.addEventListener('input', function() {
            if (this.value !== password.value) {
                this.setCustomValidity('Las contraseñas no coinciden');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// ============================================
// Smooth Scroll
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// Lazy Loading Images
// ============================================

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// Utility Functions
// ============================================

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Animation Styles (injected)
// ============================================

const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(styles);

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.showToast = showToast;