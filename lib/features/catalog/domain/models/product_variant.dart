class ProductVariant {
  final String id;
  final String productId;
  final String size;
  final String color;
  final int stockQuantity;
  final String? sku;

  ProductVariant({
    required this.id,
    required this.productId,
    required this.size,
    required this.color,
    required this.stockQuantity,
    this.sku,
  });

  bool get isAvailable => stockQuantity > 0;

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      size: json['size'] as String,
      color: json['color'] as String,
      stockQuantity: json['stock_quantity'] as int,
      sku: json['sku'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'size': size,
      'color': color,
      'stock_quantity': stockQuantity,
      'sku': sku,
    };
  }
}
