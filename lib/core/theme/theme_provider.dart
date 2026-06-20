import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppThemeStyle { classic, pastel, colorful }

final themeProvider = StateNotifierProvider<ThemeNotifier, AppThemeStyle>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<AppThemeStyle> {
  ThemeNotifier() : super(AppThemeStyle.classic);

  void changeTheme(AppThemeStyle style) => state = style;
}

class AppThemeManager {
  static ThemeData getTheme(AppThemeStyle style) {
    switch (style) {
      case AppThemeStyle.pastel:
        return _buildTheme(
          bg: const Color(0xFFFDFBF7),
          primary: const Color(0xFFB5A196),
          secondary: const Color(0xFFE2D4CB),
          accent: const Color(0xFFE5B9B9),
        );
      case AppThemeStyle.colorful:
        return _buildTheme(
          bg: const Color(0xFFFFFBEB),
          primary: const Color(0xFFEF4444), // Pokémon Red
          secondary: const Color(0xFF3B82F6),
          accent: const Color(0xFFF59E0B),
        );
      case AppThemeStyle.classic:
      default:
        return _buildTheme(
          bg: const Color(0xFFF9F9FB),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFF475569),
          accent: const Color(0xFFD97706),
        );
    }
  }

  static ThemeData _buildTheme({required Color bg, required Color primary, required Color secondary, required Color accent}) {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: bg,
      primaryColor: primary,
      colorScheme: ColorScheme.light(
        surface: bg,
        primary: primary,
        secondary: secondary,
        tertiary: accent,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: bg,
        foregroundColor: primary,
        elevation: 0,
        centerTitle: true,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: bg,
        selectedItemColor: primary,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
      )
    );
  }
}
