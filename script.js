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
        let result = (+elements.price.value + +elements.taxes.value + +elements.ads.value) 
            - +elements.discount.value;
        elements.total.innerHTML = result;
        elements.total.style.background = 'white';
    } else {
        elements.total.innerHTML = '';
        elements.total.style.background = '#DEAA79';
    }
}

// Create Product
function createProduct(e) {
    e.preventDefault();
    if (!elements.form.checkValidity()) {
        e.stopPropagation();
        elements.form.classList.add('was-validated');
        return;
    }

    loading.show(elements.submit);

    const newProduct = {
        title: elements.title.value.toLowerCase(),
        price: elements.price.value,
        taxes: elements.taxes.value,
        discount: elements.discount.value,
        ads: elements.ads.value,
        total: elements.total.innerHTML,
        count: elements.count.value,
        category: elements.category.value.toLowerCase(),
    };

    if (state.mood === 'create') {
        if (newProduct.count > 1) {
            for (let i = 0; i < newProduct.count; i++) {
                state.products.push({ ...newProduct });
            }
        } else {
            state.products.push(newProduct);
        }
        toast.show('Product created successfully');
    } else {
        state.products[state.temp] = newProduct;
        state.mood = 'create';
        elements.submit.innerHTML = 'Create';
        elements.count.style.display = 'block';
        toast.show('Product updated successfully');
    }

    localStorage.setItem('products', JSON.stringify(state.products));
    clearForm();
    updateDashboard();
    displayProducts(state.products); // Call displayProducts directly

    loading.hide(elements.submit);
}

// Clear Form
function clearForm() {
    elements.form.reset();
    elements.form.classList.remove('was-validated');
    elements.total.innerHTML = '';
    elements.count.style.display = 'block';
    getTotal();
}

// Data Visualization
function updateDashboard() {
    // Update summary cards
    document.getElementById('totalProducts').textContent = state.products.length;
    document.getElementById('totalCategories').textContent = [...new Set(state.products.map(p => p.category))].length;
    document.getElementById('averagePrice').textContent = `$${calculateAverage('price')}`;
    document.getElementById('totalValue').textContent = `$${calculateTotal()}`;

    // Update charts
    updatePriceChart();
    updateCategoryChart();
}

function calculateAverage(field) {
    if (state.products.length === 0) return 0;
    const sum = state.products.reduce((acc, curr) => acc + Number(curr[field]), 0);
    return (sum / state.products.length).toFixed(2);
}

function calculateTotal() {
    return state.products.reduce((acc, curr) => acc + Number(curr.total), 0).toFixed(2);
}

function updatePriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceRanges = getPriceRanges();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(priceRanges),
            datasets: [{
                label: 'Products by Price Range',
                data: Object.values(priceRanges),
                backgroundColor: '#DEAA79'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function getPriceRanges() {
    const ranges = {
        '$0-50': 0,
        '$51-100': 0,
        '$101-200': 0,
        '$201-500': 0,
        '$501+': 0
    };
    
    state.products.forEach(product => {
        const price = Number(product.price);
        if (price <= 50) ranges['$0-50']++;
        else if (price <= 100) ranges['$51-100']++;
        else if (price <= 200) ranges['$101-200']++;
        else if (price <= 500) ranges['$201-500']++;
        else ranges['$501+']++;
    });
    
    return ranges;
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categories = getCategoryDistribution();
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#DEAA79', '#659287', '#FFE6A9', '#2C3E50', '#dc3545',
                    '#198754', '#0dcaf0', '#ffc107', '#6c757d', '#0d6efd'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function getCategoryDistribution() {
    return state.products.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});
}

// Search and Filter Functions
function searchProduct(value) {
    const searchTerm = value.toLowerCase();
    const filteredProducts = state.products.filter(product => {
        if (state.searchMood === 'title') {
            return product.title.includes(searchTerm);
        } else {
            return product.category.includes(searchTerm);
        }
    });
    
    displayProducts(filteredProducts);
}

function searchBy(id) {
    state.searchMood = id === 'searchTitle' ? 'title' : 'category';
    elements.search.placeholder = `Search by ${state.searchMood}`;
    elements.search.value = '';
    elements.search.focus();
    displayProducts(state.products);
}

// Pagination Functions
function setupPagination(products) {
    const pageCount = Math.ceil(products.length / state.itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${state.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${state.currentPage - 1})">Previous</a>`;
    pagination.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${state.currentPage === i ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${state.currentPage === pageCount ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${state.currentPage + 1})">Next</a>`;
    pagination.appendChild(nextLi);
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(state.products.length / state.itemsPerPage)) return;
    state.currentPage = page;
    displayProducts(state.products);
}

// Bulk Operations
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const selectAllChecked = elements.selectAll.checked;
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllChecked;
        if (selectAllChecked) {
            state.selectedItems.add(Number(checkbox.value));
        } else {
            state.selectedItems.clear();
        }
    });
    
    updateBulkActionVisibility();
}

function toggleItemSelection(checkbox) {
    const itemId = Number(checkbox.value);
    if (checkbox.checked) {
        state.selectedItems.add(itemId);
    } else {
        state.selectedItems.delete(itemId);
        elements.selectAll.checked = false;
    }
    
    updateBulkActionVisibility();
}

function updateBulkActionVisibility() {
    const bulkActions = document.querySelector('.bulk-actions');
    if (state.selectedItems.size > 0) {
        bulkActions.classList.remove('d-none');
    } else {
        bulkActions.classList.add('d-none');
    }
}

// Export Function
function exportProducts() {
    const csvContent = convertToCSV(state.products);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function convertToCSV(products) {
    const headers = ['Title', 'Price', 'Taxes', 'Ads', 'Discount', 'Total', 'Category'];
    const rows = products.map(product => [
        product.title,
        product.price,
        product.taxes,
        product.ads,
        product.discount,
        product.total,
        product.category
    ]);
    
    return [headers, ...rows]
        .map(row => row.map(String).map(v => `"${v}"`).join(','))
        .join('\n');
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);

    const icon = elements.darkModeToggle.querySelector('i');
    icon.className = isDarkMode ? 'bi bi-sun' : 'bi bi-moon-stars';

    document.querySelectorAll('.table, .card').forEach(element => {
        element.classList.toggle('dark-mode');
    });
}

// Display Products in Table
function displayProducts(products) {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    elements.tbody.innerHTML = '';

    paginatedProducts.forEach((product, i) => {
        const actualIndex = start + i;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input"
                    value="${actualIndex}"
                    onchange="toggleItemSelection(this)"
                    ${state.selectedItems.has(actualIndex) ? 'checked' : ''}>
            </td>
            <td>${actualIndex + 1}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>$${product.taxes || 0}</td>
            <td>$${product.ads || 0}</td>
            <td>$${product.discount || 0}</td>
            <td>$${product.total}</td>
            <td>${product.category}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button onclick="updateProduct(${actualIndex})"
                        class="btn btn-success">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteProduct(${actualIndex})"
                        class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.tbody.appendChild(row);
    });

    setupPagination(products);
    updateBulkActionVisibility();
}

// Delete Product
function deleteProduct(i) {
    elements.deleteModal.show();
    elements.confirmDelete.onclick = function () {
        state.products.splice(i, 1);
        localStorage.setItem('products', JSON.stringify(state.products));
        elements.deleteModal.hide();
        displayProducts(state.products); // Call displayProducts directly
        toast.show('Product deleted successfully');
    };
}

// Update Product
function updateProduct(i) {
    const product = state.products[i];

    elements.title.value = product.title;
    elements.price.value = product.price;
    elements.taxes.value = product.taxes;
    elements.ads.value = product.ads;
    elements.discount.value = product.discount;
    elements.category.value = product.category;
    elements.count.style.display = 'none';

    getTotal();
    elements.submit.innerHTML = 'Update';
    state.mood = 'update';
    state.temp = i;

    elements.title.focus();
    window.scrollTo({
        top: elements.form.offsetTop,
        behavior: 'smooth'
    });
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }

    updateDashboard();
    displayProducts(state.products);

    elements.form.addEventListener('submit', createProduct);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.exportBtn.addEventListener('click', exportProducts);
    elements.selectAll.addEventListener('change', toggleSelectAll);
    elements.itemsPerPage.addEventListener('change', (e) => {
        state.itemsPerPage = Number(e.target.value);
        state.currentPage = 1;
        displayProducts(state.products);
    });

    elements.bulkDeleteBtn.addEventListener('click', () => {
        if (confirm(`Delete ${state.selectedItems.size} selected items?`)) {
            state.products = state.products.filter((_, index) => !state.selectedItems.has(index));
            localStorage.setItem('products', JSON.stringify(state.products));
            state.selectedItems.clear();
            displayProducts(state.products);
            updateDashboard();
            toast.show('Selected products deleted successfully');
        }
    });
});