import 'product_variant.dart';

class Product {
  final String id;
  final String? categoryId;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final List<String> images;
  final bool isActive;
  final List<ProductVariant> variants;

  Product({
    required this.id,
    this.categoryId,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    required this.images,
    required this.isActive,
    this.variants = const [],
  });

  Product copyWith({List<ProductVariant>? variants}) {
    return Product(
      id: id,
      categoryId: categoryId,
      name: name,
      slug: slug,
      description: description,
      price: price,
      images: images,
      isActive: isActive,
      variants: variants ?? this.variants,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    // Parser les variantes si incluses dans la jointure
    final variantsList = (json['product_variants'] as List?)
            ?.map((v) => ProductVariant.fromJson(v as Map<String, dynamic>))
            .toList() ??
        [];

    return Product(
      id: json['id'] as String,
      categoryId: json['category_id'] as String?,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      isActive: json['is_active'] as bool? ?? true,
      variants: variantsList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_id': categoryId,
      'name': name,
      'slug': slug,
      'description': description,
      'price': price,
      'images': images,
      'is_active': isActive,
    };
  }
}
