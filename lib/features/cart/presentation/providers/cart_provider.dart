import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/cart_repository.dart';
import '../../domain/models/cart_item.dart';

class CartNotifier extends AsyncNotifier<List<CartItem>> {
  late final CartRepository _cartRepository;
  String? _cartId;

  @override
  FutureOr<List<CartItem>> build() async {
    _cartRepository = ref.watch(cartRepositoryProvider);
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    if (user == null) {
      _cartId = null;
      return [];
    }

    state = const AsyncValue.loading();
    try {
      _cartId = await _cartRepository.getCartId(user.id);
      if (_cartId == null) return [];
      return await _cartRepository.getCartItems(_cartId!);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return [];
    }
  }

  // Ajouter un article au panier
  Future<void> addItem(String productVariantId, int quantity) async {
    if (_cartId == null) {
      throw Exception('Veuillez vous connecter pour ajouter des articles au panier.');
    }

    state = const AsyncValue.loading();
    try {
      await _cartRepository.addItemToCart(
        cartId: _cartId!,
        productVariantId: productVariantId,
        quantity: quantity,
      );
      // Recharger le panier
      ref.invalidateSelf();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  // Mettre à jour la quantité d'un article
  Future<void> updateQuantity(String itemId, int quantity) async {
    state = const AsyncValue.loading();
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
      } else {
        await _cartRepository.updateItemQuantity(itemId, quantity);
        ref.invalidateSelf();
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  // Retirer un article
  Future<void> removeItem(String itemId) async {
    state = const AsyncValue.loading();
    try {
      await _cartRepository.removeItem(itemId);
      ref.invalidateSelf();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

// Fournisseur d'état du panier
final cartProvider = AsyncNotifierProvider.autoDispose<CartNotifier, List<CartItem>>(() {
  return CartNotifier();
});
