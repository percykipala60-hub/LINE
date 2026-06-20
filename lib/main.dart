import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';
import 'core/network/supabase_client.dart';
import 'core/services/stripe_service.dart';

void main() async {
  // S'assurer que le binding des widgets est initialisé
  WidgetsFlutterBinding.ensureInitialized();

  // Initialisation de Supabase
  try {
    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.anonKey,
    );
  } catch (e) {
    debugPrint('Avertissement : Échec de l\'initialisation automatique de Supabase (URL/Clés par défaut) : $e');
  }

  // Initialisation de Stripe avec votre clé publique de test
  try {
    StripeService.instance.init('pk_test_51TkDtL00389LZDsbTwJGsD3I94GKSZyKNEg7R6GGtH7NnVonRSw7IBEqsnvLsW596piwOTszczWr5VgrGQ5I9Oax000kUfzAt7');
  } catch (e) {
    debugPrint('Avertissement : Échec de l\'initialisation de Stripe : $e');
  }

  // Lancement de l'application sous un ProviderScope pour Riverpod
  runApp(
    const ProviderScope(
      child: LineApp(),
    ),
  );
}
