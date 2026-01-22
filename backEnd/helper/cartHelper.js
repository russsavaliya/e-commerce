const mongoose = require('mongoose');
const Cart = require('../model/cart');

const GUEST_ID_HEADER = 'x-guest-id';

const extractGuestId = (req) => {
  const fromHeader = req.headers?.[GUEST_ID_HEADER];
  const fromBody = req.body?.guestId;
  const fromQuery = req.query?.guestId;
  const guestId = (fromHeader || fromBody || fromQuery || '').toString().trim();
  return guestId || null;
};

const createCanonicalCart = async (guestId) => {
  if (!guestId) {
    throw new Error('guestId is required');
  }
  let cart = await Cart.findOne({ guestId });
  if (!cart) {
    cart = await Cart.create({
      guestId,
      items: [],
      totals: {
        subtotal: 0,
        discount: 0,
        total: 0,
      },
    });
  }
  return cart;
};

const getCartDocument = async (guestId) => {
  if (!guestId) return null;
  return Cart.findOne({ guestId });
};

const createCartItemId = () => new mongoose.Types.ObjectId().toString();

const clearCart = async (guestId) => {
  if (!guestId) return;
  await Cart.findOneAndUpdate(
    { guestId },
    { items: [], totals: { subtotal: 0, discount: 0, total: 0 } },
    { new: true }
  );
};

const deleteCart = async (guestId) => {
  if (!guestId) return;
  await Cart.deleteOne({ guestId });
};

const computeTotals = (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discount = cart.totals?.discount || 0;
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
};

const applyTotals = (cart) => {
  cart.totals = computeTotals(cart);
};

module.exports = {
  extractGuestId,
  createCanonicalCart,
  getCartDocument,
  createCartItemId,
  clearCart,
  deleteCart,
  computeTotals,
  applyTotals,
};

