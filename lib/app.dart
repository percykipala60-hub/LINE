import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/routing/app_router.dart';
import 'core/theme/theme_provider.dart';

class LineApp extends ConsumerWidget {
  const LineApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final currentTheme = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'Line',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.light, // Toujours le thème choisi, pas de mode sombre forcé
      theme: AppThemeManager.getTheme(currentTheme),
      routerConfig: router,
    );
  }
}
