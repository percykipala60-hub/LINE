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
    final currentMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'Line',
      debugShowCheckedModeBanner: false,
      themeMode: currentMode,
      theme: AppThemeManager.getTheme(currentTheme),
      darkTheme: AppThemeManager.getDarkTheme(),
      routerConfig: router,
    );
  }
}
