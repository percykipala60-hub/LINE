import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/catalog_repository.dart';
import '../../domain/models/category.dart';
import '../../domain/models/product.dart';

// Fournisseur des catégories
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final repository = ref.watch(catalogRepositoryProvider);
  return repository.getCategories();
});

// Fournisseur des produits filtrés par catégorie (famille)
final productsProvider = FutureProvider.family<List<Product>, String?>((
  ref,
  categoryId,
) async {
  final repository = ref.watch(catalogRepositoryProvider);
  // Si categoryId est vide ou 'Tous', on passe null
  final id = (categoryId == null || categoryId.isEmpty || categoryId == 'Tous')
      ? null
      : categoryId;
  return repository.getProducts(categoryId: id);
});

final productSearchProvider = FutureProvider.family<List<Product>, String>((
  ref,
  query,
) async {
  final repository = ref.watch(catalogRepositoryProvider);
  return repository.searchProducts(query: query);
});

// Fournisseur des détails d'un produit spécifique
final productDetailsProvider = FutureProvider.family<Product?, String>((
  ref,
  productId,
) async {
  final repository = ref.watch(catalogRepositoryProvider);
  return repository.getProductDetails(productId);
});
