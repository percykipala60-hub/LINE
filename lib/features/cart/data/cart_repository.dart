import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/network/supabase_client.dart';
import '../domain/models/cart_item.dart';

class CartRepository {
  final SupabaseClient _supabase;

  CartRepository(this._supabase);

  // Récupérer le cart_id pour l'utilisateur
  Future<String?> getCartId(String userId) async {
    final response = await _supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    return response?['id'] as String?;
  }

  // Charger tous les articles du panier avec variantes et produits joints
  Future<List<CartItem>> getCartItems(String cartId) async {
    final response = await _supabase
        .from('cart_items')
        .select('*, product_variants(*, products(*))')
        .eq('cart_id', cartId);
    return (response as List).map((i) => CartItem.fromJson(i)).toList();
  }

  // Ajouter ou mettre à jour la quantité d'un article
  Future<void> addItemToCart({
    required String cartId,
    required String productVariantId,
    required int quantity,
  }) async {
    // Vérifier si l'article existe déjà
    final existing = await _supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_variant_id', productVariantId)
        .maybeSingle();

    if (existing != null) {
      // Mettre à jour la quantité
      final String itemId = existing['id'];
      final int currentQty = existing['quantity'] as int;
      await updateItemQuantity(itemId, currentQty + quantity);
    } else {
      // Insérer un nouvel article
      await _supabase.from('cart_items').insert({
        'cart_id': cartId,
        'product_variant_id': productVariantId,
        'quantity': quantity,
      });
    }
  }

  // Mettre à jour la quantité d'un article spécifique
  Future<void> updateItemQuantity(String itemId, int quantity) async {
    await _supabase
        .from('cart_items')
        .update({'quantity': quantity})
        .eq('id', itemId);
  }

  // Retirer un article du panier
  Future<void> removeItem(String itemId) async {
    await _supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
  }
}

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return CartRepository(supabase);
});
