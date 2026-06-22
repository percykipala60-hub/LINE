import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/network/supabase_client.dart';
import '../domain/models/category.dart';
import '../domain/models/product.dart';

class CatalogRepository {
  final SupabaseClient _supabase;

  CatalogRepository(this._supabase);

  // Charger toutes les catégories
  Future<List<Category>> getCategories() async {
    final response = await _supabase.from('categories').select().order('name');
    return (response as List).map((c) => Category.fromJson(c)).toList();
  }

  // Charger tous les produits actifs, éventuellement filtrés par catégorie
  Future<List<Product>> getProducts({String? categoryId}) async {
    var query = _supabase.from('products').select().eq('is_active', true);
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    final response = await query.order('created_at', ascending: false);
    return (response as List).map((p) => Product.fromJson(p)).toList();
  }

  // Rechercher des produits par mot-clé
  Future<List<Product>> searchProducts({required String query}) async {
    final response = await _supabase
        .from('products')
        .select()
        .ilike('name', '%$query%')
        .eq('is_active', true)
        .order('created_at', ascending: false);
    return (response as List).map((p) => Product.fromJson(p)).toList();
  }

  // Charger un produit en détail avec toutes ses variantes
  Future<Product?> getProductDetails(String productId) async {
    final response = await _supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('id', productId)
        .maybeSingle();
    if (response == null) return null;
    return Product.fromJson(response);
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return CatalogRepository(supabase);
});
