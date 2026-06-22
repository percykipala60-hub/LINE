import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/network/supabase_client.dart';
import '../domain/models/app_user.dart';

class AuthRepository {
  final SupabaseClient _supabase;

  AuthRepository(this._supabase);

  // Flux d'écoute du statut d'authentification Supabase
  Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  // Récupérer le profil utilisateur dans public.profiles
  Future<AppUser?> getProfile(String userId) async {
    try {
      final data = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (data == null) {
        final currentUser = _supabase.auth.currentUser;
        if (currentUser == null) return null;

        final metadata = currentUser.userMetadata;
        return AppUser(
          id: currentUser.id,
          email: currentUser.email,
          fullName: metadata?['full_name']?.toString(),
          avatarUrl: null,
          role: metadata?['role']?.toString() ?? 'user',
        );
      }

      final sessionEmail = _supabase.auth.currentUser?.email;
      return AppUser.fromJson(data, email: sessionEmail);
    } catch (e) {
      // Gérer l'erreur proprement en production
      return null;
    }
  }

  // Connexion email/mot de passe
  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Vérifie si une adresse e-mail existe dans `public.profiles`.
  Future<bool> emailExists(String email) async {
    try {
      final data = await _supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
      return data != null;
    } catch (e) {
      return false;
    }
  }

  // Inscription avec métadonnées facultatives (nom complet, rôle pour test)
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String fullName,
    String role = 'user',
  }) async {
    return await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName, 'role': role},
    );
  }

  // Déconnexion
  Future<void> signOut() async {
    await _supabase.auth.signOut();
  }

  /// Enregistre une tentative de connexion dans `public.login_attempts`.
  Future<void> logLoginAttempt({
    required String email,
    String? userId,
    required bool success,
    required String reason,
    String? ipAddress,
    String? userAgent,
  }) async {
    try {
      await _supabase.from('login_attempts').insert({
        'email': email,
        'user_id': userId,
        'success': success,
        'reason': reason,
        'ip_address': ipAddress,
        'user_agent': userAgent,
      });
    } catch (_) {
      // ignore logging failures to avoid blocking auth flow
    }
  }

  // Vérification du code OTP à 6 chiffres
  Future<AuthResponse> verifyOTP({
    required String email,
    required String token,
    OtpType type = OtpType.signup,
  }) async {
    return await _supabase.auth.verifyOTP(
      email: email,
      token: token,
      type: type,
    );
  }

  // Obtenir l'utilisateur actuel connecté
  User? get currentUser => _supabase.auth.currentUser;
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return AuthRepository(supabase);
});
