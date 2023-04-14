const productsContainer = document.querySelector(".products-container");
const blocksCntainer = document.querySelector(".blocks-container");
const cartContainer = document.querySelector(".cart-container");
const closeCart = document.querySelector(".close-cart");
const cartShopping = document.querySelector(".cart-shopping");
const totalPrice = document.querySelector(".total-price span");
const counterItems = document.querySelector(".counter-items");
const clearCart = document.querySelector(".clear-cart");

class Products {
  async getProducts() {
    try {
      const res = await fetch("./data.json");
      const data = await res.json();
      return data.items;
    } catch {
      alert("can't load data ");
    }
  }
}

class UI {
  displayItems(data) {
    let result = "";
    data.forEach((item) => {
      console.log(item);
      result += ` <div class="product-container">
        <div class="head-product" >
         <img src=${item.image} alt="product"/>
        </div>
        <div class="footer-product">
          <div class="title">
            ${item.name}
          </div>
          <div class="price-and-button">
            <div class="price">$${item.price}</div>
            <button class="add-to-cart" id=${item.id}>
              <i class="fas fa-cart-shopping"></i>
              add to cart
            </button>
          </div>
        </div>
</div>`;
    });
    productsContainer.innerHTML = result;
    this.addToCart();
    this.addButtonState();
  }

  displayCartItems(data) {
    let result = "";
    data.map((item) => {
      result += `<div class="block">
          <div class="img-container">
            <img 
            src=${item.image}
             alt=${item.name} />
          </div>
          <div class="info">
            <div class="title">
             ${item.name}
            </div>
            <div class="price">$${(item.price * item.amount).toFixed(3)}</div>
            <button class="remove" id=${item.id}>remove</button>
          </div>
          <div class="quality">
            <i class="fa fa-chevron-up chevron-up" id=${item.id}></i>
            ${item.amount}
            <i class="fa fa-chevron-down chevron-down" id=${item.id}></i>
          </div>
        </div>`;
    });
    blocksCntainer.innerHTML = result;
    this.increaseQuanlity();
    this.decreaseQuanlity();
    this.removeFromCart();
  }

  addButtonState() {
    const addBtns = document.querySelectorAll(".add-to-cart");
    let cart = Storage.getcart();
    addBtns.forEach((btn) => {
      if (cart.find((ele) => ele.id == btn.id)) {
        btn.classList.replace("add-to-cart", "in-cart");
        btn.textContent = "in Cart";
      } else {
        btn.classList.replace("in-cart", "add-to-cart");
      }
    });
  }

  addToCart() {
    const addBtns = document.querySelectorAll(".add-to-cart");
    addBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let items = Storage.getProducts().find(
          (item) => item.id == e.target.id
        );
        let cart = Storage.getcart();
        if (cart) {
          cart = [...cart, { ...items, amount: 1 }];
        } else {
          cart = [{ ...items, amount: 1 }];
        }
        Storage.saveCart(cart);
        this.showCart();
        this.displayCartItems(cart);
        this.handelTotalPriceAndItems(cart);
        btn.classList.replace("add-to-cart", "in-cart");
        btn.textContent = "in Cart";
      });
    });
  }

  handelTotalPriceAndItems(cart) {
    let total = 0.0;
    let numberOfItems = 0;
    if (cart) {
      cart.map((ele) => {
        total += ele.price * ele.amount;
        numberOfItems += ele.amount;
      });
      totalPrice.textContent = total.toFixed(2);
      counterItems.textContent = numberOfItems;
    } else {
      totalPrice.textContent = 0.0;
      counterItems.textContent = numberOfItems;
    }
  }

  increaseQuanlity() {
    const increaseBtn = document.querySelectorAll(".chevron-up");
    let cart = Storage.getcart();
    increaseBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const item = cart.find((ele) => ele.id == e.target.id);
        item.amount = item.amount + 1;
        Storage.saveCart(cart);
        this.displayCartItems(cart);
        this.handelTotalPriceAndItems(cart);
      });
    });
  }

  decreaseQuanlity() {
    const decreaseBtn = document.querySelectorAll(".chevron-down");
    let cart = Storage.getcart();
    let product = Storage.getProducts();
    decreaseBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const item = cart.find((ele) => ele.id == e.target.id);
        item.amount = item.amount - 1;
        Storage.saveCart(cart);
        if (item.amount <= 0) {
          cart = cart.filter((ele) => ele.id != e.target.id);
          Storage.saveCart(cart);
          this.displayItems(product);
        }
        this.displayCartItems(cart);
        this.handelTotalPriceAndItems(cart);
      });
    });
  }
  setup() {
    const cart = Storage.getcart();
    this.handelTotalPriceAndItems(cart);
    this.displayCartItems(cart);
    closeCart.addEventListener("click", this.hidecart);
    cartShopping.addEventListener("click", this.showCart);
  }
  hidecart() {
    cartContainer.classList.add("hide");
  }
  showCart() {
    cartContainer.classList.remove("hide");
  }
  removeFromCart() {
    const removeBtns = document.querySelectorAll(".remove");
    let cart = Storage.getcart();
    let product = Storage.getProducts();
    removeBtns.forEach((removeBtn) => {
      removeBtn.addEventListener("click", (e) => {
        cart = cart.filter((ele) => ele.id != e.target.id);
        Storage.saveCart(cart);
        this.displayItems(product);
        this.displayCartItems(cart);
        this.handelTotalPriceAndItems(cart);
      });
    });
  }
  clearAllItems() {
    let cart = Storage.getcart();
    let product = Storage.getProducts();
    clearCart.addEventListener("click", () => {
      cart = [];
      Storage.saveCart(cart);
      this.displayCartItems(cart);
      this.handelTotalPriceAndItems(cart);
      this.displayItems(product);
      this.hidecart();
    });
  }
}

class Storage {
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts() {
    return JSON.parse(localStorage.getItem("products"));
  }
  static getcart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  products
    .getProducts()
    .then((product) => {
      ui.displayItems(product);
      Storage.saveProducts(product);
    })
    .then(() => {
      ui.clearAllItems();
    })
    .catch((err) => {});
  ui.setup();
});
