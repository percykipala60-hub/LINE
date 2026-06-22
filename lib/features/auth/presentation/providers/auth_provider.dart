import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/auth_repository.dart';
import '../../domain/models/app_user.dart';

class AuthStateNotifier extends AsyncNotifier<AppUser?> {
  late final AuthRepository _authRepository;
  StreamSubscription? _subscription;

  @override
  FutureOr<AppUser?> build() async {
    _authRepository = ref.watch(authRepositoryProvider);

    ref.onDispose(() {
      _subscription?.cancel();
    });

    // Écouter les changements d'état d'authentification de Supabase
    _subscription?.cancel();
    _subscription = _authRepository.authStateChanges.listen((event) async {
      final session = event.session;
      if (session == null) {
        state = const AsyncValue.data(null);
      } else {
        state = const AsyncValue.loading();
        final user = await _authRepository.getProfile(session.user.id);
        state = AsyncValue.data(user);
      }
    });

    // Charger l'état initial
    final currentUser = _authRepository.currentUser;
    if (currentUser == null) {
      return null;
    }
    return await _authRepository.getProfile(currentUser.id);
  }

  // Action pour se connecter
  Future<AuthResponse> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final res = await _authRepository.signIn(
        email: email,
        password: password,
      );
      if (res.session == null) {
        state = const AsyncValue.data(null);
      } else {
        final user = await _authRepository.getProfile(res.session!.user.id);
        state = AsyncValue.data(user);
      }
      return res;
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Action pour s'inscrire
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    state = const AsyncValue.loading();
    try {
      final res = await _authRepository.signUp(
        email: email,
        password: password,
        fullName: fullName,
      );
      if (res.session == null) {
        state = const AsyncValue.data(null);
      } else {
        final user = await _authRepository.getProfile(res.session!.user.id);
        state = AsyncValue.data(user);
      }
      return res;
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Vérification de l'OTP
  Future<AuthResponse> verifyOTP(
    String email,
    String token, {
    OtpType type = OtpType.signup,
  }) async {
    state = const AsyncValue.loading();
    try {
      final res = await _authRepository.verifyOTP(
        email: email,
        token: token,
        type: type,
      );
      if (res.session == null) {
        state = const AsyncValue.data(null);
      } else {
        state = AsyncValue.data(
          await _authRepository.getProfile(res.session!.user.id),
        );
      }
      return res;
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Action pour se déconnecter
  Future<void> signOut() async {
    state = const AsyncValue.loading();
    try {
      await _authRepository.signOut();
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }
}

// Fournisseur d'état d'authentification Riverpod
final authStateProvider = AsyncNotifierProvider<AuthStateNotifier, AppUser?>(
  () {
    return AuthStateNotifier();
  },
);
