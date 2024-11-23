let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('taxes');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount');
let count = document.getElementById('count');
let category = document.getElementById('category');
let total = document.getElementById('total');
let submit = document.getElementById('submit');
let tbody = document.getElementById('tbody');

function getTotal(){
    if(price.value != ''){
        let result = (+price.value + +taxes.value + +ads.value) - +discount.value;
        total.innerHTML = result;
        total.style.background= 'white';
    }else{
        total.innerHTML = '';
        total.style.background= '#DEAA79';
    }
}


// Initialize an empty array
let products;
if(localStorage.products != null){
    products = JSON.parse(localStorage.products);
} else {
    let product = [];
}

submit.onclick = function () {
    let newProduct = {
        title: title.value,
        price: price.value,
        taxes: taxes.value,
        discount: discount.value,
        ads: ads.value,
        total: total.innerHTML,
        count: count.value,
        category: category.value,
    };

    if(newProduct.count>1){
        for (let index = 0; index < newProduct.count; index++) {
            products.push(newProduct);
            localStorage.setItem('products',JSON.stringify(products));      
        }
    }else{
        products.push(newProduct);
        localStorage.setItem('products',JSON.stringify(products));      
    }
   
    clearForm();
    getProducts();
};

function clearForm() {
    title.value = '';
    price.value = '';
    taxes.value = '';
    discount.value = '';
    ads.value = '';
    count.value = '';
    category.value = '';
    total.innerHTML = '';
  }


  //get products

  function getProducts() {
    tbody.innerHTML = ''; // Clear the table body first
    for (let i = 0; i < products.length; i++) {
        // Create a new row for each product
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${products[i].title}</td>
                <td>${products[i].price}</td>
                <td>${products[i].taxes}</td>
                <td>${products[i].ads}</td>
                <td>${products[i].discount}</td>
                <td>${products[i].total}</td>
                <td>${products[i].category}</td>
                <td><button onclick="deleteProduct(${i})">Delete</button></td>
                <td><button onclick="updateProduct(${i})">Update</button></td>

            </tr>
        `;
    }
}
getProducts();

function updateProduct(i) { 

        title.value = products[i].title;
        price.value = products[i].price;
        taxes.value = products[i].taxes;
        discount.value = products[i].discount;
        ads.value = products[i].ads;
        total.value = products[i].total;
        count.value = products[i].count;
        category.value = products[i].category;

        submit.innerHTML='Update';
 }


 function deleteProduct(i){
    products.splice(i,1);
    localStorage.products = JSON.stringify(products);
    getProducts();
 }
 