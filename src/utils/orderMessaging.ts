import { Product, ProductVariant, CartItem, OrderDetails, SellerContact } from '../types';
import { formatDualPrice } from './currencyUtils';

/**
 * Builds clean, structured order text for direct message checkout
 */
export function generateOrderSummaryText(
  items: CartItem[],
  orderDetails: OrderDetails,
  sellerContact: SellerContact
): string {
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const currency = items[0]?.product.currency || '$';

  let text = `🛍️ *NOUVELLE COMMANDE - LINE STORE*\n`;
  text += `📅 Date : ${dateStr}\n\n`;

  text += `👤 *Informations Client :*\n`;
  text += `• Nom : ${orderDetails.customerName || 'Non spécifié'}\n`;
  text += `• Téléphone : ${orderDetails.phone || 'Non spécifié'}\n`;
  text += `• Ville : ${orderDetails.deliveryCity || 'Kinshasa'}\n`;
  text += `• Adresse de livraison : ${orderDetails.deliveryAddress || 'À convenir'}\n`;
  if (orderDetails.notes) {
    text += `• Précisions / Repères : ${orderDetails.notes}\n`;
  }

  text += `\n📦 *Articles commandés :*\n`;
  items.forEach((item, index) => {
    const itemPriceDual = formatDualPrice(item.product.price, item.product.currency);
    const itemSubtotalDual = formatDualPrice(item.product.price * item.quantity, item.product.currency);
    text += `${index + 1}. *${item.product.name}*\n`;
    text += `   - Quantité : x${item.quantity}\n`;
    text += `   - Taille : ${item.variant.size}\n`;
    text += `   - Couleur : ${item.variant.color}\n`;
    text += `   - Prix unitaire : ${itemPriceDual.combined}\n`;
    text += `   - Sous-total : ${itemSubtotalDual.combined}\n`;
  });

  const totalDual = formatDualPrice(totalAmount, currency);
  text += `\n💰 *TOTAL COMMANDE : ${totalDual.combined}*\n`;
  text += `💱 *Taux indicatif : 1 $ = 2 800 FC*\n`;
  text += `🚚 *Paiement en mains propres (en Dollars ou en Francs)*\n\n`;
  text += `Bonjour ! J'aimerais finaliser cette commande et convenir du créneau de livraison avec vous. Merci ! ✨`;

  return text;
}

/**
 * Generates WhatsApp direct checkout click URL
 */
export function createWhatsAppOrderUrl(
  items: CartItem[],
  orderDetails: OrderDetails,
  sellerContact: SellerContact
): string {
  const message = generateOrderSummaryText(items, orderDetails, sellerContact);
  // Clean phone number (strip spaces, dashes, plusses)
  const cleanPhone = sellerContact.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates direct link or copied clipboard payload for Instagram Direct Message
 */
export function getInstagramOrderAction(
  items: CartItem[],
  orderDetails: OrderDetails,
  sellerContact: SellerContact
): { url: string; message: string } {
  const message = generateOrderSummaryText(items, orderDetails, sellerContact);
  const cleanHandle = sellerContact.instagramHandle.replace('@', '');
  return {
    url: `https://ig.me/m/${cleanHandle}`,
    message,
  };
}
