// DOM Elements
const elements = {
    title: document.getElementById('title'),
    price: document.getElementById('price'),
    taxes: document.getElementById('taxes'),
    ads: document.getElementById('ads'),
    discount: document.getElementById('discount'),
    count: document.getElementById('count'),
    category: document.getElementById('category'),
    total: document.getElementById('total'),
    submit: document.getElementById('submit'),
    tbody: document.getElementById('tbody'),
    search: document.getElementById('search'),
    form: document.getElementById('productForm'),
    deleteModal: new bootstrap.Modal(document.getElementById('deleteModal')),
    confirmDelete: document.getElementById('confirmDelete'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    exportBtn: document.getElementById('exportBtn'),
    itemsPerPage: document.getElementById('itemsPerPage'),
    pagination: document.getElementById('pagination'),
    selectAll: document.getElementById('selectAll'),
    bulkDeleteBtn: document.getElementById('bulkDeleteBtn')
};

// State Management
let state = {
    products: JSON.parse(localStorage.getItem('products')) || [],
    mood: 'create',
    temp: null,
    searchMood: 'title',
    currentPage: 1,
    itemsPerPage: 10,
    selectedItems: new Set()
};

// Toast Utility
const toast = {
    element: new bootstrap.Toast(document.getElementById('toast')),
    show: (message, type = 'success') => {
        const toastElement = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        toastElement.className = `toast ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white`;
        toastTitle.textContent = type === 'success' ? 'Success' : 'Error';
        toastMessage.textContent = message;
        toast.element.show();
    }
};

// Loading State Utility
const loading = {
    show: (button) => {
        const spinner = button.querySelector('.spinner-border');
        if (spinner) {
            spinner.classList.remove('d-none');
            button.disabled = true;
        }
    },
    hide: (button) => {
        const spinner = button.querySelector('.spinner-border');
        if (spinner) {
            spinner.classList.add('d-none');
            button.disabled = false;
        }
    }
};

// Calculate Total
function getTotal() {
    if (elements.price.value) {
        let result = (+elements.price.value + +elements.taxes.value + +elements.ads.value) - +elements.discount.value;
        elements.total.textContent = result.toFixed(2);
    } else {
        elements.total.textContent = '0';
    }
}

// Add or Update Product
function addOrUpdateProduct() {
    const product = {
        title: elements.title.value,
        price: +elements.price.value,
        taxes: +elements.taxes.value || 0,
        ads: +elements.ads.value || 0,
        discount: +elements.discount.value || 0,
        total: +elements.total.textContent,
        count: +elements.count.value || 1,
        category: elements.category.value
    };

    if (state.mood === 'create') {
        for (let i = 0; i < product.count; i++) {
            state.products.push(product);
        }
    } else {
        state.products[state.temp] = product;
        state.mood = 'create';
        elements.submit.textContent = 'Create';
    }

    localStorage.setItem('products', JSON.stringify(state.products));
    clearForm();
    renderProducts();
    toast.show('Product added successfully!', 'success');
}

// Clear Form Inputs
function clearForm() {
    elements.title.value = '';
    elements.price.value = '';
    elements.taxes.value = '';
    elements.ads.value = '';
    elements.discount.value = '';
    elements.count.value = '';
    elements.category.value = '';
    elements.total.textContent = '0';
}

// Render Products in Table
function renderProducts() {
    elements.tbody.innerHTML = '';
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedProducts = state.products.slice(start, end);

    paginatedProducts.forEach((product, index) => {
        elements.tbody.innerHTML += `
            <tr>
                <td><input type="checkbox" class="form-check-input"></td>
                <td>${start + index + 1}</td>
                <td>${product.title}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${product.taxes.toFixed(2)}</td>
                <td>${product.ads.toFixed(2)}</td>
                <td>${product.discount.toFixed(2)}</td>
                <td>${product.total.toFixed(2)}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${start + index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${start + index})">Delete</button>
                </td>
            </tr>
        `;
    });

    renderPagination();
}

// Delete Product
function deleteProduct(index) {
    state.products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(state.products));
    renderProducts();
    toast.show('Product deleted successfully!', 'success');
}

// Edit Product
function editProduct(index) {
    const product = state.products[index];
    elements.title.value = product.title;
    elements.price.value = product.price;
    elements.taxes.value = product.taxes;
    elements.ads.value = product.ads;
    elements.discount.value = product.discount;
    elements.count.value = 1;
    elements.category.value = product.category;
    getTotal();

    state.mood = 'update';
    state.temp = index;
    elements.submit.textContent = 'Update';
}

// Search Products
function searchProduct(value) {
    const filteredProducts = state.products.filter(product =>
        product[state.searchMood].toLowerCase().includes(value.toLowerCase())
    );

    state.currentPage = 1;
    renderProducts(filteredProducts);
}

// Handle Pagination
function renderPagination() {
    const totalPages = Math.ceil(state.products.length / state.itemsPerPage);
    elements.pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        elements.pagination.innerHTML += `
            <li class="page-item ${i === state.currentPage ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }
}

function changePage(page) {
    state.currentPage = page;
    renderProducts();
}

// Event Listeners
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    addOrUpdateProduct();
});

elements.darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Initialize
renderProducts();
