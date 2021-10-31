import { useState, useEffect, useCallback } from "react";
import alanBtn from "@alan-ai/alan-sdk-web";
import { useCart } from "../context/CartContext";
import storeItems from "../items.json";

const COMMANDS = {
  OPEN_CART: "open-cart",
  CLOSE_CART: "close-cart",
  ADD_ITEM: "add-item",
  REMOVE_ITEM: "remove-item",
  CHECKOUT_ITEM: "checkout-items",
};

export default function useAlan() {
  const [alanInstance, setAlanInstance] = useState();
  const {
    setShowCartItems,
    isCartEmpty,
    addToCart,
    removeFromCart,
    cart,
    checkout,
  } = useCart();

  const openCart = useCallback(() => {
    if (isCartEmpty) alanInstance.playText("You have no items in your cart!");
    else {
      alanInstance.playText("opening cart");
      setShowCartItems(true);
    }
  }, [alanInstance, setShowCartItems, isCartEmpty]);

  const closeCart = useCallback(() => {
    if (isCartEmpty) alanInstance.playText("Please add items to your cart");
    else {
      alanInstance.playText("Closing cart");
      setShowCartItems(false);
    }
  }, [alanInstance, setShowCartItems, isCartEmpty]);

  const addItem = useCallback(
    ({ detail: { name, quantity } }) => {
      const item = storeItems.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      );
      if (item == null)
        alanInstance.playText(`Sorry! I am not able to find the ${name} item`);
      else {
        addToCart(item.id, quantity);
        alanInstance.playText(`Added ${quantity} ${name} items to your cart`);
      }
    },
    [alanInstance, addToCart]
  );

  const removeItem = useCallback(
    ({ detail: { name } }) => {
      const entry = cart.find(
        (e) => e.item.name.toLowerCase() === name.toLowerCase()
      );

      if (entry == null)
        alanInstance.playText(
          `Sorry! I can't find the ${name} item in the cart`
        );
      else {
        removeFromCart(entry.itemId);
        alanInstance.playText(`Removed ${name} item from your cart`);
      }
    },
    [alanInstance, removeFromCart, cart]
  );

  const checkoutItems = useCallback(() => {
    if (isCartEmpty) alanInstance.playText("The cart is empty!");
    else {
      alanInstance.playText("Thanks for your purchase! Hope to see you again.");
      checkout();
    }
  }, [alanInstance, isCartEmpty, checkout]);

  useEffect(() => {
    window.addEventListener(COMMANDS.OPEN_CART, openCart);
    window.addEventListener(COMMANDS.CLOSE_CART, closeCart);
    window.addEventListener(COMMANDS.ADD_ITEM, addItem);
    window.addEventListener(COMMANDS.REMOVE_ITEM, removeItem);
    window.addEventListener(COMMANDS.CHECKOUT_ITEM, checkoutItems);

    return () => {
      window.removeEventListener(COMMANDS.OPEN_CART, openCart);
      window.removeEventListener(COMMANDS.CLOSE_CART, closeCart);
      window.removeEventListener(COMMANDS.ADD_ITEM, addItem);
      window.removeEventListener(COMMANDS.REMOVE_ITEM, removeItem);
      window.removeEventListener(COMMANDS.CHECKOUT_ITEM, checkoutItems);
    };
  }, [openCart, closeCart, addItem, removeItem, checkoutItems]);

  useEffect(() => {
    if (alanInstance != null) return; // this is done, so as to prevent creating multiple alanInstances

    setAlanInstance(
      alanBtn({
        key: process.env.REACT_APP_ALAN_KEY,
        onCommand: ({ command, payload }) => {
          window.dispatchEvent(new CustomEvent(command, { detail: payload }));
        },
      })
    );
  }, []);
  return null;
}
