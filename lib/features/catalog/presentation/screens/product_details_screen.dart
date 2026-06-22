import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:leen/features/auth/presentation/providers/auth_provider.dart';
import 'package:leen/features/cart/presentation/providers/cart_provider.dart';
import '../../domain/models/product_variant.dart';
import '../providers/catalog_providers.dart';

class ProductDetailsScreen extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailsScreen({
    super.key,
    required this.productId,
  });

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}


class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  String? _selectedSize;
  String? _selectedColor;
  int _quantity = 1;
  bool _isAdding = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final productAsync = ref.watch(productDetailsProvider(widget.productId));
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails du Vêtement'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: () => context.push('/cart'),
          ),
        ],
      ),
      body: productAsync.when(
        data: (product) {
          if (product == null) {
            return const Center(child: Text('Vêtement non trouvé.'));
          }

          // Extraire les tailles et couleurs uniques des variantes
          final sizes = product.variants.map((v) => v.size).toSet().toList();
          final colors = product.variants.map((v) => v.color).toSet().toList();

          // Trouver la variante actuellement sélectionnée
          ProductVariant? selectedVariant;
          if (_selectedSize != null && _selectedColor != null) {
            try {
              selectedVariant = product.variants.firstWhere(
                (v) => v.size == _selectedSize && v.color == _selectedColor,
              );
            } catch (_) {
              selectedVariant = null; // Variante non existante
            }
          }

          // Initialiser les sélections par défaut si non définies
          if (_selectedSize == null && sizes.isNotEmpty) {
            _selectedSize = sizes.first;
          }
          if (_selectedColor == null && colors.isNotEmpty) {
            _selectedColor = colors.first;
          }

          final hasImage = product.images.isNotEmpty;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 1. Image du vêtement (Style Hero)
                AspectRatio(
                  aspectRatio: 1.1,
                  child: hasImage
                      ? Image.network(
                          product.images.first,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: Colors.grey[200],
                            child: const Icon(Icons.broken_image, size: 64, color: Colors.grey),
                          ),
                        )
                      : Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.image, size: 64, color: Colors.grey),
                        ),
                ),

                // 2. Infos principales
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              product.name,
                              style: theme.textTheme.displayLarge?.copyWith(fontSize: 24),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Text(
                            '${product.price.toStringAsFixed(2)} €',
                            style: theme.textTheme.displayLarge?.copyWith(
                              fontSize: 24,
                              color: theme.colorScheme.tertiary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        product.description ?? 'Aucune description disponible pour ce vêtement.',
                        style: theme.textTheme.bodyMedium?.copyWith(height: 1.5),
                      ),
                      const SizedBox(height: 24),

                      // Choix de la taille
                      if (sizes.isNotEmpty) ...[
                        Text('Taille', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Row(
                          children: sizes.map((size) {
                            final isSelected = _selectedSize == size;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Text(size),
                                selected: isSelected,
                                onSelected: (selected) {
                                  if (selected) setState(() => _selectedSize = size);
                                },
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Choix de la couleur
                      if (colors.isNotEmpty) ...[
                        Text('Couleur', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Row(
                          children: colors.map((color) {
                            final isSelected = _selectedColor == color;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: ChoiceChip(
                                label: Text(color),
                                selected: isSelected,
                                onSelected: (selected) {
                                  if (selected) setState(() => _selectedColor = color);
                                },
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Quantité et Stock
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Quantité', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: theme.colorScheme.outline),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, size: 18),
                                      onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                                    ),
                                    Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    IconButton(
                                      icon: const Icon(Icons.add, size: 18),
                                      onPressed: () => setState(() => _quantity++),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          // Indicateur de stock
                          if (selectedVariant != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Text('Disponibilité', style: TextStyle(fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Text(
                                  selectedVariant.stockQuantity > 0
                                      ? '${selectedVariant.stockQuantity} en stock'
                                      : 'Rupture de stock',
                                  style: TextStyle(
                                    color: selectedVariant.stockQuantity > 0 ? Colors.green : Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Bouton d'ajout au panier
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isAdding || (selectedVariant != null && selectedVariant.stockQuantity <= 0)
                              ? null
                              : () async {
                                  if (user == null) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Veuillez vous connecter pour ajouter au panier')),
                                      );
                                      context.push('/login');
                                    }
                                    return;
                                  }

                                  if (selectedVariant == null) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Combinaison de taille/couleur indisponible.')),
                                      );
                                    }
                                    return;
                                  }

                                  setState(() => _isAdding = true);
                                  try {
                                    await ref.read(cartProvider.notifier).addItem(
                                          selectedVariant.id,
                                          _quantity,
                                        );
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Ajouté au panier avec succès !')),
                                      );
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Erreur : ${e.toString()}')),
                                      );
                                    }
                                  } finally {
                                    if (mounted) setState(() => _isAdding = false);
                                  }
                                },
                          child: _isAdding
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  selectedVariant != null && selectedVariant.stockQuantity <= 0
                                      ? 'Rupture de stock'
                                      : 'Ajouter au panier',
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Erreur lors du chargement : $err')),
      ),
    );
  }
}
