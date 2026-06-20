import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/catalog/presentation/screens/catalog_screen.dart';
import '../../features/catalog/presentation/screens/product_details_screen.dart';
import '../../features/checkout/presentation/screens/checkout_screen.dart';

final appRouterKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  // Écouter l'état d'authentification pour forcer la redirection si la session change
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: appRouterKey,
    initialLocation: '/',
    routes: [
      // Écran d'accueil - Catalogue public
      GoRoute(
        path: '/',
        builder: (context, state) => const CatalogScreen(),
      ),
      // Écran des détails du produit
      GoRoute(
        path: '/catalog/:productId',
        builder: (context, state) {
          final productId = state.pathParameters['productId'] ?? '';
          return ProductDetailsScreen(productId: productId);
        },
      ),
      // Écran du Panier
      GoRoute(
        path: '/cart',
        builder: (context, state) => const CartScreen(),
      ),
      // Écran de Validation de Commande (sécurisé)
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      // Authentification
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
    ],
    
    // Gardes de redirection pour sécuriser l'application
    redirect: (context, state) {
      final user = authState.value;
      final isLoading = authState.isLoading;

      // Si l'état de l'auth est encore en cours de chargement initial, ne pas rediriger tout de suite
      if (isLoading) return null;

      final isLoggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/register';
      final isAccessingCheckout = state.matchedLocation == '/checkout';

      // 1. Redirection si non connecté sur des pages sécurisées
      if (user == null) {
        if (isAccessingCheckout) {
          return '/login';
        }
        return null;
      }

      // 2. Si l'utilisateur est connecté et tente d'accéder aux pages de login/register, retour à l'accueil
      if (isLoggingIn) {
        return '/';
      }

      return null;
    },
  );
});
