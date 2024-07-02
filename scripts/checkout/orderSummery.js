import { cart, removeFromCart, calculateCartQuantity, updateQuantity, updateDeliveryOption } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import formatCurrency from "../utils/money.js";
import { calculateDeliveryDate, deliveryOptions, getDeliveryOption } from "../../data/deliveryOptions.js"
import { renderPaymentSummery } from "./paymentSummery.js";


export function renderOrderSummery() {

    let cartSummeryHTML = "";

    cart.forEach((cartItem => {
        const productId = cartItem.productId;

        const matchingProduct = getProduct(productId);
        const deliveryOptionId = cartItem.deliveryOptionId;

        const deliveryOption = getDeliveryOption(deliveryOptionId);
        const dateString = calculateDeliveryDate(deliveryOption);

        cartSummeryHTML += `
<div class="cart-item-container
  js-cart-item-container-${matchingProduct.id}">
  <div class="delivery-date">
    Delivery date:  ${dateString}
  </div>

    <div class="cart-item-details-grid">
      <img class="product-image"
      src="${matchingProduct.image}">

    <div class="cart-item-details">
      <div class="product-name">
        ${matchingProduct.name}
      </div>
      <div class="product-price">
          $${formatCurrency(matchingProduct.priceCents)}
      </div>
      <div class="product-quantity">
          <span>
          Quantity: <span class="quantity-label
              js-cart-item-quantity-${matchingProduct.id}">
              ${cartItem.quantity}</span>
          </span>
          <span class="update-quantity-link link-primary
          js-update-quantity-link"
          data-product-id="${matchingProduct.id}">
          Update
          </span>
          <input type="number" class="quantity-input
              js-quantity-input
              js-quantity-input-${matchingProduct.id}"
              data-product-id="${matchingProduct.id}">
          <span class="save-quantity-link link-primary
              js-save-quantity-link" 
              data-product-id="${matchingProduct.id}">Save</span>
            <span class="delete-quantity-link link-primary
            js-delete-link" data-product-id="${matchingProduct.id}">
            Delete</span>
          <div class="validation-message 
              js-validation-message-${matchingProduct.id}">
          </div>
        </div>
    </div>

  <div class="delivery-options">
    <div class="delivery-options-title">
        Choose a delivery option:
    </div>
      ${deliveryOptionHTML(matchingProduct, cartItem)}       
  </div>
</div>
</div>`;
    }));

    document.querySelector(".js-order-summery")
        .innerHTML = cartSummeryHTML;

    document.querySelectorAll(".js-delete-link")
        .forEach((link) => {
            link.addEventListener("click", () => {
                const productId = link.dataset.productId;

                removeFromCart(productId);

                const container = document
                    .querySelector(`.js-cart-item-container-${productId}`);

                container.remove();

                document.querySelector(".js-checkout-items").innerHTML = `${calculateCartQuantity()} items`;
                renderPaymentSummery();
            })
        });


    document.querySelectorAll(".js-update-quantity-link")
        .forEach((link) => {
            link.addEventListener("click", () => {
                const productId = link.dataset.productId;
                const container = document
                    .querySelector(`.js-cart-item-container-${productId}`);
                container.classList.add("is-editing-quantity");
            })
        });

    document.querySelectorAll(".js-save-quantity-link")
        .forEach((link) => {
            link.addEventListener("click", () => {
                const productId = link.dataset.productId;
                const container = document
                    .querySelector(`
            .js-cart-item-container-${productId}`);
                container.classList.remove("is-editing-quantity");

                const inputValue = document.querySelector(`.js-quantity-input-${productId}`);
                const newQuantity = Number(inputValue.value);

                const validationMessage = document
                    .querySelector(`.js-validation-message-${productId}`);

                if (newQuantity > 0 && newQuantity < 11) {

                    updateQuantity(productId, newQuantity); // updates the cart items quantity.

                    document.querySelector(".js-checkout-items")
                        .innerHTML = `${calculateCartQuantity()} items`; //calculates and displays the cart item quantity. 
                    updateLabel(productId, newQuantity);
                    //displays the updated quantity in the item-cart-container label.

                    validationMessage.innerHTML = "";
                } else {
                    validationMessage.innerHTML = "Value must be between 1 and 10";
                }

            })
        })

    function updateLabel(productId, newQuantity) {
        const quantityLabel = document
            .querySelector(`.js-cart-item-quantity-${productId}`);
        quantityLabel.innerHTML = newQuantity;
        renderPaymentSummery();
    }


    document.querySelectorAll(".js-quantity-input")
        .forEach((input) => {
            input.addEventListener("keydown", (event) => {
                const productId = input.dataset.productId;

                const container = document
                    .querySelector(`.js-cart-item-container-${productId}`);

                const inputValue = document
                    .querySelector(`.js-quantity-input-${productId}`);

                const newQuantity = Number(inputValue.value);

                const validationMessage = document
                    .querySelector(`.js-validation-message-${productId}`);

                if (event.key === "Enter") {
                    container.classList.remove("is-editing-quantity");
                    if (newQuantity > 0 && newQuantity < 11) {
                        updateQuantity(productId, newQuantity); // updates the cart items quantity.
                        document.querySelector(".js-checkout-items")
                            .innerHTML = `${calculateCartQuantity()} items`; //calculates and displays the cart item quantity. 
                        updateLabel(productId, newQuantity);
                        //displays the updated quantity in the item-cart-container label.

                        validationMessage.innerHTML = "";
                    } else {
                        console.log(validationMessage.innerHTML);
                        validationMessage.innerHTML = "Value must be between 1 and 10";
                    }
                }
            })
        });

    function deliveryOptionHTML(matchingProduct, cartItem) {

        let html = "";
        deliveryOptions.forEach((deliveryOption) => {
            const dateString = calculateDeliveryDate(deliveryOption);

            const priceString = deliveryOption.priceCents === 0 ?
                "FREE " : `${formatCurrency(deliveryOption.priceCents)} -`;

            const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

            html += `
        <div class="delivery-option js-delivery-option"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
            <input type="radio"
            ${isChecked ? "checked" : ""}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
            <div>
            <div class="delivery-option-date">
                ${dateString}
            </div>
            <div class="delivery-option-price">
                ${priceString} Shipping
            </div>
            </div>
        </div>
        `
        })
        return html;
    }

    document.querySelectorAll(".js-delivery-option")
        .forEach((element) => {
            element.addEventListener("click", () => {
                const productId = element.dataset.productId;
                const deliveryOptionId = element.dataset.deliveryOptionId;
                updateDeliveryOption(productId, deliveryOptionId);
                renderOrderSummery();
                renderPaymentSummery();
            })
        })
}