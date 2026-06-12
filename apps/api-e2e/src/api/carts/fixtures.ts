export const cartIds = {
  active: '11111111-1111-4111-8111-111111111111',
  item: '22222222-2222-4222-8222-222222222222',
};

export const productIds = {
  keyboard: '33333333-3333-4333-8333-333333333333',
};

export const addCartItemPayloadFixture = {
  productId: productIds.keyboard,
  quantity: 1,
};

export const updateCartItemQuantityPayloadFixture = {
  quantity: 3,
};

export const cartItemFixture = {
  id: cartIds.item,
  productId: productIds.keyboard,
  name: 'Wireless Keyboard',
  quantity: 2,
  unitPrice: 350000,
  totalPrice: 700000,
  inStock: true,
};

export const activeCartFixture = {
  id: cartIds.active,
  items: [cartItemFixture],
  subtotalAmount: 700000,
  discountAmount: 0,
  shippingFee: 0,
  taxAmount: 0,
  totalAmount: 700000,
};

export const addedCartItemFixture = {
  id: cartIds.item,
  productId: productIds.keyboard,
  quantity: 1,
  unitPrice: 350000,
  totalPrice: 350000,
};

export const updatedCartItemFixture = {
  id: cartIds.item,
  quantity: updateCartItemQuantityPayloadFixture.quantity,
  unitPrice: 350000,
  totalPrice: 1050000,
};

export const successFixture = {
  success: true,
};
