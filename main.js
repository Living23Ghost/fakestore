let cart = []

function init(){
    fetch('https://fakestoreapi.com/products')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('products',JSON.stringify(data))
        renderProducts(data)
    })
    .catch(error => console.log(error))
}

function curr(num){
    let USDollar = new Intl.NumberFormat('en-US',{
        style: 'currency',
        currency: 'USD'
    })
    return USDollar.format(num).replace('$','$ ')
}

function renderProducts(products){
    let html = ''
    products.forEach(product => {
        let htm = `<div class="product" id="prod${product.id}"><img src="${product.image}"><h2> ${product.title}</h2><p> USD${curr(product.price)}</p><div class="rating">${Rating(parseFloat(product.rating.rate))} ${product.rating.rate}<ion-icon name="people"></ion-icon>${product.rating.count}</div><div class="prodbtns"><button class="toCartbtn" data-id="${product.id}"> Add to Cart </button><button data-id="${product.id}" class="view_prod_btn"> View Product </button></div></div>`
        html += htm
    });
    $('.products').html(html)
}
function renderProduct(id=1){
    $('#home_page').hide()
    $('#product_page').css('display','grid')
    let product = JSON.parse(localStorage.getItem('products')).filter(p => p.id == id)
    product = product[0]
    let html = `<img src="${product.image}"><div class="product_details"><h2> ${product.title}</h2><h3> USD${curr(product.price)}</h3><div class="item_num"><button id="prod_sub"><ion-icon name="remove"></ion-icon></button><input value="1" id="prod_qnty"><button id="prod_add"><ion-icon name="add"></ion-icon></button></div><div class="rating">${Rating(parseFloat(product.rating.rate))} ${product.rating.rate}<ion-icon name="people"></ion-icon>${product.rating.count}</div><p> ${product.description}</p><div class="product_btns"><button class="add_to_cart" data-id="${product.id}"> Add to Cart </button> <button id="love" data-id="${product.id}"><ion-icon name="heart-outline"></ion-icon></div>`
    $('.product_section').html(html)
    renderRelated(product.category,id)
}

function renderRelated(cat,id){
    let products = JSON.parse(localStorage.getItem('products')).filter(p => p.category == cat && p.id != id)
    let html = ''
    products.forEach(product => {
        let htm = `<div class="product" id="rprod${product.id}"><img src="${product.image}"><h2> ${product.title}</h2><p> USD${curr(product.price)}</p><div class="rating">${Rating(parseFloat(product.rating.rate))} ${product.rating.rate}<ion-icon name="people"></ion-icon>${product.rating.count}</div><div class="prodbtns"><button class="toCartbtn" data-id="${product.id}"> Add to Cart </button><button data-id="${product.id}" class="view_prod_btn"> View Product </button></div></div>`
        html += htm
    })
    $('.product_related').html(html)
}

function Rating(stars){
    let filled = '<ion-icon name="star"></ion-icon>'.repeat(Math.floor(stars)).concat('<ion-icon name="star-half"></ion-icon>')
    let left = 4 - Math.floor(stars)
    let outlined = '<ion-icon name="star-outline"></ion-icon>'.repeat(left)
    filled += outlined
    return filled
}

function myCart(items){
    $('main').hide()
    $('#cart_page').css('display','grid')
    let html = ''
    items.forEach(item => {
        let htm = `<tr><td class="product_cell"><img src="${item.image}"><div class="cart_prod_details"><p> ${item.title}</p><button id="rmfromCart" data-id="${item.id}"> Remove Item </button></div></td><td> ${item.quantity} </td><td>USD${curr(item.price)}<td></tr>`
        html += htm
    })
    let totals = cart.map(pr => pr.price)
    let balance = totals.reduce((prev,next) => {
        return parseInt(prev) + parseInt(next)
    },0)
    $('#fbalance').text(`USD${curr(balance)}`)
    $('#cart_page > h2 > span').text(cart.length)
    $('#cart_page tbody').html(html)
}

function showActivePage(){
    let page = localStorage.getItem('page')
    if(!page){
        $('#home_page').css('display','grid')
    }else{
        $(page).css('display','grid')
    }
}
function addToCart(id,qnty=1){
    let product = JSON.parse(localStorage.getItem('products')).filter(pro => pro.id == id)[0]
    let price = parseFloat(product.price) * parseInt(qnty)
    let quantity = qnty
    let title = product.title
    let image = product.image
    let item = {id,image,title,quantity,price}
    let check = cart.filter(prod => prod.id == id)[0]
    if(!check){
        cart.unshift(item)
    }else{
        let i = cart.findIndex(ele => ele.id = id)
        cart.splice(i,1,item)
    }
    $('#items_count').text(cart.length)
}
function removeProduct(id){
    cart = cart.filter(item => item.id != id)
    myCart(cart)
    $('#items_count').text(cart.length)
}
function submitForm(n,p){
    let payload = {username: n,password: p}
    fetch('https://fakestoreapi.com/auth/login',{
    method:'POST',
    body: JSON.stringify(payload),
    headers: {'Content-Type':'application/json'}
})
.then(response => response.json())
.then(data => {
    localStorage.setItem('token',data.token)
    $('#tologinbtn').text(n)
    $('#tologinbtn').prepend('<ion-icon name="person-circle"></ion-icon>')

})
.catch(err => {
    $('#username').val('');$('#password').val('')
    $('.loginerror').show()
    setTimeout(() => {
        $('.loginerror').hide()
    },10000)
})
}

$(function(){
    init()
    showActivePage()
    $('.catag > button').click(function(){
        $('.catag > button').removeClass('active')
        $(this).addClass('active')
        let cat = $(this).text()
        cat = cat.toLowerCase().trim()
        if(cat != 'all'){
            let products = JSON.parse(localStorage.getItem('products')).filter(pro => pro.category == cat)
            console.log(cat)
            renderProducts(products)
        }else{
            let products = JSON.parse(localStorage.getItem('products'))
            renderProducts(products)
        }
    })
    $('.products').on('click','.toCartbtn',function(){
        let id = $(this).attr('data-id')
        addToCart(id)
    })
    $('.products').on('click','.view_prod_btn',function(){
        let id = $(this).attr('data-id')
        renderProduct(id)
    })
    $('.product_nav > button').click(function(){
        $('main').hide()
        $('#home_page').css('display','grid')
    })
    $('.product_section').on('click','.add_to_cart',function(){
        let quantity = $('#prod_qnty').val() || 1
        let id = $(this).attr('data-id')
        addToCart(id,quantity)
    })
    $('.product_section').on('click','#prod_sub',function(){
        let val = parseInt($('#prod_qnty').val())
        val = val - 1
        if(!val){
            $('#prod_qnty').val(1)
        }else{
            $('#prod_qnty').val(val)
        }
    })
    $('.product_section').on('click','#prod_add',function(){
        let val = parseInt($('#prod_qnty').val())
        val = val + 1
        $('#prod_qnty').val(val)
    })
    $('.product_related').on('click','.toCartbtn',function(){
        let id = $(this).attr('data-id')
        addToCart(id)
    })
    $('.product_related').on('click','.view_prod_btn',function(){
        let id = $(this).attr('data-id')
        renderProduct(id)
    })
    $('#headToCart').click(function(){
        myCart(cart)
    })
    $('#fromCartbtn').click(function(){
        $('#cart_page').hide()
        $('#home_page').css('display','grid')
    })
    $('#cart_page tbody').on('click','#rmfromCart',function(){
        let id = $(this).attr('data-id')
        removeProduct(id)
    })
    $('#tologinbtn').click(function(){
        $('main').hide()
        $('#login_page').css('display','grid')
    })
    $('#login_exit').click(function(){
        $('main').hide()
        $('#home_page').css('display','grid')
    })
    $('#loginbtn').click(function(){
        let name = $('#username').val()
        let pass = $('#password').val()
        submitForm(name,pass)
    })
    $('#mode').click(function(){
        let icon = $('#mode > ion-icon').attr('name')
        if(icon == "moon"){
            $('#mode > ion-icon').attr('name','sunny')
        }else{
            $('#mode > ion-icon').attr('name','moon')
        }
        $('body').toggleClass('dark')
    })
})