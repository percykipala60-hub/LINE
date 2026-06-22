import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/catalog_providers.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String _query = '';
  bool _hasSubmitted = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _search() {
    final value = _searchController.text.trim();

    setState(() {
      _query = value;
      _hasSubmitted = value.isNotEmpty;
    });

    if (value.isNotEmpty) {
      ref.invalidate(productSearchProvider(value));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resultsAsync = ref.watch(productSearchProvider(_query));

    return Scaffold(
      appBar: AppBar(title: const Text('Recherche'), centerTitle: true),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 16.0,
              ),
              child: TextField(
                controller: _searchController,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _search(),
                decoration: InputDecoration(
                  hintText: 'Rechercher un produit, ex: manette ps4',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _search,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
            Expanded(
              child: resultsAsync.when(
                data: (products) {
                  // Si aucune recherche n'a été lancée ou que le champ est vide
                  if (_query.isEmpty && !_hasSubmitted) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32.0),
                        child: Text(
                          'Tapez un produit ou une marque pour rechercher dans la boutique.',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyLarge,
                        ),
                      ),
                    );
                  }

                  // Si la recherche ne donne aucun résultat
                  if (products.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off_outlined,
                              size: 64,
                              color: theme.colorScheme.onSurface.withAlpha(
                                (0.45 * 255).round(),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucun produit trouvé pour "$_query".',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.titleMedium,
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Essayez un autre terme, ex: manette ps4, robe noire, casque audio.',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  // Si des produits sont trouvés
                  return GridView.builder(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20.0,
                      vertical: 12.0,
                    ),
                    itemCount: products.length,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.68,
                          mainAxisSpacing: 16,
                          crossAxisSpacing: 16,
                        ),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      final hasImage = product.images.isNotEmpty;
                      return GestureDetector(
                        onTap: () => context.push('/catalog/${product.id}'),
                        child: Card(
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(
                                child: hasImage
                                    ? Image.network(
                                        product.images.first,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                                  color: Colors.grey[200],
                                                  child: const Icon(
                                                    Icons.broken_image,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                      )
                                    : Container(
                                        color: Colors.grey[200],
                                        child: const Icon(
                                          Icons.image,
                                          color: Colors.grey,
                                        ),
                                      ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${product.price.toStringAsFixed(2)} €',
                                      style: theme.textTheme.bodyLarge
                                          ?.copyWith(
                                            color: theme.colorScheme.tertiary,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
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
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(
                  child: Text(
                    'Erreur de recherche : ${err.toString()}',
                    textAlign: TextAlign.center,
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
