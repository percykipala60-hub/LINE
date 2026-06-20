import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:leen/features/auth/presentation/providers/auth_provider.dart';
import 'package:leen/features/catalog/domain/models/category.dart';
import 'package:leen/core/widgets/line_logo.dart';
import '../providers/catalog_providers.dart';

class CatalogScreen extends ConsumerStatefulWidget {
  const CatalogScreen({super.key});

  @override
  ConsumerState<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends ConsumerState<CatalogScreen> {
  String _selectedCategoryId = 'Tous';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    // Charger les catégories et les produits
    final categoriesAsync = ref.watch(categoriesProvider);
    final productsAsync = ref.watch(productsProvider(_selectedCategoryId));

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // 1. En-tête de l'application Premium
            SliverAppBar(
              floating: true,
              pinned: true,
              expandedHeight: 70.0,
              backgroundColor: theme.scaffoldBackgroundColor,
              elevation: 0,
              scrolledUnderElevation: 2,
              title: const LineLogo(fontSize: 36),
              actions: [
                // Icône panier
                IconButton(
                  icon: const Icon(Icons.shopping_bag_outlined),
                  onPressed: () => context.push('/cart'),
                ),

                // Profil / Connexion
                user == null
                    ? TextButton(
                        onPressed: () => context.push('/login'),
                        child: Text(
                          'Connexion',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      )
                    : PopupMenuButton<String>(
                        icon: CircleAvatar(
                          radius: 16,
                          backgroundColor: theme.colorScheme.primary,
                          child: Text(
                            (user.fullName ?? 'U').substring(0, 1).toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                        onSelected: (value) async {
                          if (value == 'logout') {
                            await ref.read(authStateProvider.notifier).signOut();
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Déconnecté avec succès')),
                              );
                            }
                          }
                        },
                        itemBuilder: (context) => [
                          PopupMenuItem(
                            enabled: false,
                            child: Text(
                              user.fullName ?? 'Utilisateur',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          const PopupMenuDivider(),
                          const PopupMenuItem(
                            value: 'logout',
                            child: Row(
                              children: [
                                Icon(Icons.logout, size: 18),
                                SizedBox(width: 8),
                                Text('Se déconnecter'),
                              ],
                            ),
                          ),
                        ],
                      ),
                const SizedBox(width: 8),
              ],
            ),

            // 2. Section de titre et barre de recherche
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Élevez votre style',
                      style: theme.textTheme.displayLarge?.copyWith(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Découvrez nos pièces uniques et intemporelles.',
                      style: theme.textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                    // Barre de recherche
                    Container(
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: theme.colorScheme.outline.withAlpha(128)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Rechercher un vêtement, accessoire...',
                          hintStyle: TextStyle(color: theme.colorScheme.onSurface.withAlpha(128)),
                          border: InputBorder.none,
                          icon: Icon(Icons.search, color: theme.colorScheme.primary),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 3. Sélecteur de catégories dynamique (Style Shein avec icônes circulaires)
            categoriesAsync.when(
              data: (categories) {
                final allCategories = [
                  Category(id: 'Tous', name: 'Tous', slug: 'tous'),
                  ...categories,
                ];

                return SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: Wrap(
                      spacing: 16, // Espace horizontal
                      runSpacing: 16, // Espace vertical
                      alignment: WrapAlignment.start,
                      children: allCategories.map((cat) {
                        final isSelected = _selectedCategoryId == cat.id;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedCategoryId = cat.id),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircleAvatar(
                                radius: 32,
                                backgroundColor: isSelected 
                                    ? theme.colorScheme.primary.withAlpha(20) 
                                    : Colors.grey[100],
                                child: Icon(
                                  Icons.category_outlined,
                                  color: isSelected ? theme.colorScheme.primary : Colors.black87,
                                  size: 28,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                cat.name,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                );
              },
              loading: () => const SliverToBoxAdapter(
                child: SizedBox(height: 48, child: Center(child: CircularProgressIndicator())),
              ),
              error: (err, stack) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24.0),
                  child: Column(
                    children: [
                      Icon(Icons.category_outlined, size: 48, color: theme.colorScheme.primary.withAlpha(128)),
                      const SizedBox(height: 16),
                      Text(
                        'Vos catégories arrivent bientôt !',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyLarge,
                      ),
                      TextButton.icon(
                        onPressed: () => ref.invalidate(categoriesProvider),
                        icon: const Icon(Icons.refresh),
                        label: const Text('Rafraîchir'),
                      )
                    ],
                  ),
                ),
              ),
            ),

            // 4. Grille de produits dynamique
            productsAsync.when(
              data: (products) {
                if (products.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey),
                            SizedBox(height: 16),
                            Text('Aucun vêtement disponible dans cette catégorie.', textAlign: TextAlign.center),
                          ],
                        ),
                      ),
                    ),
                  );
                }

                return SliverPadding(
                  padding: const EdgeInsets.all(24.0),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.68,
                      mainAxisSpacing: 16,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final product = products[index];
                        final hasImage = product.images.isNotEmpty;
                        
                        return GestureDetector(
                          onTap: () => context.push('/catalog/${product.id}'),
                          child: Card(
                            clipBehavior: Clip.antiAlias,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Image
                                Expanded(
                                  child: hasImage
                                      ? Image.network(
                                          product.images.first,
                                          fit: BoxFit.cover,
                                          width: double.infinity,
                                          errorBuilder: (context, error, stackTrace) => Container(
                                            color: Colors.grey[200],
                                            child: const Icon(Icons.broken_image, color: Colors.grey),
                                          ),
                                        )
                                      : Container(
                                          color: Colors.grey[200],
                                          child: const Icon(Icons.image, color: Colors.grey),
                                        ),
                                ),
                                // Infos
                                Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: theme.textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${product.price.toStringAsFixed(2)} €',
                                        style: theme.textTheme.bodyLarge?.copyWith(
                                          color: theme.colorScheme.tertiary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                      childCount: products.length,
                    ),
                  ),
                );
              },
              loading: () => const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (err, stack) => SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shopping_bag_outlined, size: 64, color: theme.colorScheme.primary.withAlpha(128)),
                      const SizedBox(height: 16),
                      Text(
                        'Votre catalogue se refait une beauté,\nrevenez très vite !',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () => ref.invalidate(productsProvider(_selectedCategoryId)),
                        icon: const Icon(Icons.refresh),
                        label: const Text('Rafraîchir'),
                      )
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
