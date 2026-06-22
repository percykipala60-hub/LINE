import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Constantes de configuration Supabase pour le projet Line
// ⚠️ Ces valeurs sont publiques (anon key = clé publique, sans danger côté client)
// Ne jamais mettre la 'service_role' key ici.
class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://civqsllnrgkkocuvdlkt.supabase.co',
  );
  
  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_yB68gO1le_obclxoC5MpjQ_aoq7pxOt',
  );
}

// Fournisseur du client Supabase
final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});
