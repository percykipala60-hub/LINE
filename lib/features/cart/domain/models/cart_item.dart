import '../../../catalog/domain/models/product.dart';
import '../../../catalog/domain/models/product_variant.dart';

class CartItem {
  final String id;
  final String cartId;
  final String productVariantId;
  final int quantity;
  // Objets joints
  final ProductVariant? variant;
  final Product? product;

  CartItem({
    required this.id,
    required this.cartId,
    required this.productVariantId,
    required this.quantity,
    this.variant,
    this.product,
  });

  double get totalPrice => (product?.price ?? 0.0) * quantity;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    // Parser la variante et le produit associés via jointure
    final variantJson = json['product_variants'] as Map<String, dynamic>?;
    ProductVariant? parsedVariant;
    Product? parsedProduct;

    if (variantJson != null) {
      parsedVariant = ProductVariant.fromJson(variantJson);
      final productJson = variantJson['products'] as Map<String, dynamic>?;
      if (productJson != null) {
        parsedProduct = Product.fromJson(productJson);
      }
    }

    return CartItem(
      id: json['id'] as String,
      cartId: json['cart_id'] as String,
      productVariantId: json['product_variant_id'] as String,
      quantity: json['quantity'] as int,
      variant: parsedVariant,
      product: parsedProduct,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cart_id': cartId,
      'product_variant_id': productVariantId,
      'quantity': quantity,
    };
  }
}
