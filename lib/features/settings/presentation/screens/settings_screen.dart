import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/theme_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Paramètres d affichage'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choisissez le mode d affichage',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              'Le mode sélectionné s appliquera immédiatement sur l application.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                children: [
                  _ThemeModePreviewCard(
                    mode: ThemeMode.light,
                    selected: currentMode == ThemeMode.light,
                    onSelected: () => ref
                        .read(themeModeProvider.notifier)
                        .change(ThemeMode.light),
                    title: 'Clair',
                    description: 'Une interface lumineuse et aérée.',
                  ),
                  const SizedBox(height: 16),
                  _ThemeModePreviewCard(
                    mode: ThemeMode.dark,
                    selected: currentMode == ThemeMode.dark,
                    onSelected: () => ref
                        .read(themeModeProvider.notifier)
                        .change(ThemeMode.dark),
                    title: 'Sombre',
                    description: 'Un style sombre confortable pour la nuit.',
                  ),
                  const SizedBox(height: 16),
                  _ThemeModePreviewCard(
                    mode: ThemeMode.system,
                    selected: currentMode == ThemeMode.system,
                    onSelected: () => ref
                        .read(themeModeProvider.notifier)
                        .change(ThemeMode.system),
                    title: 'Système',
                    description: 'Utilise le mode du système d exploitation.',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ThemeModePreviewCard extends StatelessWidget {
  final ThemeMode mode;
  final bool selected;
  final VoidCallback onSelected;
  final String title;
  final String description;

  const _ThemeModePreviewCard({
    required this.mode,
    required this.selected,
    required this.onSelected,
    required this.title,
    required this.description,
  });

  Color get _previewBg {
    switch (mode) {
      case ThemeMode.dark:
        return const Color(0xFF121212);
      case ThemeMode.light:
        return Colors.white;
      case ThemeMode.system:
        return const Color(0xFFE9F1FF);
    }
  }

  Color get _previewTextColor {
    return mode == ThemeMode.dark ? Colors.white : Colors.black87;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelected,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected
              ? Theme.of(
                  context,
                ).colorScheme.primary.withAlpha((0.08 * 255).round())
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? Theme.of(context).colorScheme.primary
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Icon(
                  selected ? Icons.check_circle : Icons.circle_outlined,
                  color: selected
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey,
                ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              height: 120,
              child: Container(
                decoration: BoxDecoration(
                  color: _previewBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.home_filled,
                            color: _previewTextColor,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Page principale',
                            style: TextStyle(
                              color: _previewTextColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        'Boutons, listes et appbar',
                        style: TextStyle(
                          color: _previewTextColor.withAlpha(
                            (0.85 * 255).round(),
                          ),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: _previewTextColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: _previewTextColor.withAlpha(
                                (0.7 * 255).round(),
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: _previewTextColor.withAlpha(
                                (0.4 * 255).round(),
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(description, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
