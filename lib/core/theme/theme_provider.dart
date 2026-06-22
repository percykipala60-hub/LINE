import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppThemeStyle { classic, pastel, colorful }

class ThemeNotifier extends Notifier<AppThemeStyle> {
  @override
  AppThemeStyle build() => AppThemeStyle.classic;

  void changeTheme(AppThemeStyle style) => state = style;
}

final themeProvider = NotifierProvider<ThemeNotifier, AppThemeStyle>(() {
  return ThemeNotifier();
});

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
        return _buildTheme(
          bg: const Color(0xFFF9F9FB),
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFF475569),
          accent: const Color(0xFFD97706),
        );
    }
  }

  static ThemeData _buildTheme({
    required Color bg,
    required Color primary,
    required Color secondary,
    required Color accent,
  }) {
    return ThemeData.light(useMaterial3: true).copyWith(
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
      ),
    );
  }

  // Simple dark theme fallback. For more nuance, create dark variants per style.
  static ThemeData getDarkTheme() {
    return ThemeData.dark(
      useMaterial3: true,
    ).copyWith(appBarTheme: const AppBarTheme(centerTitle: true));
  }
}

// Theme mode provider to toggle light/dark/system
class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.system;

  void change(ThemeMode mode) => state = mode;
}

final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>(() {
  return ThemeModeNotifier();
});
