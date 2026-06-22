import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/catalog/presentation/screens/catalog_screen.dart';
import '../../features/catalog/presentation/screens/search_screen.dart';
import '../../features/catalog/presentation/screens/product_details_screen.dart';
import '../../features/checkout/presentation/screens/checkout_screen.dart';
import '../../features/main_layout/presentation/screens/main_layout_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

final appRouterKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: appRouterKey,
    initialLocation: '/',
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainLayoutScreen(navigationShell: navigationShell);
        },
        branches: [
          // Branche 1 : Boutique/Catalogue
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const CatalogScreen(),
              ),
            ],
          ),
          // Branche 2 : Recherche
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/categories',
                builder: (context, state) => const SearchScreen(),
              ),
            ],
          ),
          // Branche 3 : Panier
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/cart',
                builder: (context, state) => const CartScreen(),
              ),
            ],
          ),
          // Branche 4 : Moi (Profil)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      // Détails du produit (hors de la bottom bar)
      GoRoute(
        path: '/catalog/:productId',
        parentNavigatorKey: appRouterKey,
        builder: (context, state) {
          final productId = state.pathParameters['productId'] ?? '';
          return ProductDetailsScreen(productId: productId);
        },
      ),

      // Validation de Commande
      GoRoute(
        path: '/checkout',
        parentNavigatorKey: appRouterKey,
        builder: (context, state) => const CheckoutScreen(),
      ),

      // Auth
      GoRoute(
        path: '/login',
        parentNavigatorKey: appRouterKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: appRouterKey,
        builder: (context, state) => const RegisterScreen(),
      ),
    ],
    redirect: (context, state) {
      final user = authState.value;
      final isLoading = authState.isLoading;

      if (isLoading) return null;

      final isLoggingIn =
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';
      final isAccessingCheckout = state.matchedLocation == '/checkout';

      if (user == null && isAccessingCheckout) {
        return '/login';
      }

      if (user != null && isLoggingIn) {
        return '/';
      }

      return null;
    },
  );
});
