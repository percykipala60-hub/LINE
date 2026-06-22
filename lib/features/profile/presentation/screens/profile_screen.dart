import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.value;

    return Scaffold(
      appBar: AppBar(title: const Text('Mon Profil'), centerTitle: false),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // En-tête utilisateur
          ListTile(
            leading: CircleAvatar(
              radius: 30,
              backgroundColor: Theme.of(
                context,
              ).colorScheme.primary.withAlpha(50),
              child: const Icon(Icons.person, size: 30),
            ),
            title: Text(
              user?.fullName ?? 'Bienvenue !',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: Text(
              user == null
                  ? 'Connectez-vous pour gérer votre compte'
                  : (user.email ?? ''),
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              if (user == null) {
                context.push('/login');
              }
            },
          ),
          const Divider(height: 32),

          // Options clés (Style Shein)
          _buildProfileItem(
            context,
            icon: Icons.inventory_2_outlined,
            title: 'Mes commandes',
          ),
          _buildProfileItem(
            context,
            icon: Icons.favorite_border,
            title: 'Mes favoris',
          ),
          const Divider(height: 32),
          _buildProfileItem(
            context,
            icon: Icons.settings_outlined,
            title: 'Paramètres du compte',
            onTap: () => context.push('/settings'),
          ),
          _buildProfileItem(
            context,
            icon: Icons.support_agent_outlined,
            title: 'Support clients',
          ),

          if (user != null) ...[
            const Divider(height: 32),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Se déconnecter',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
              onTap: () async {
                await ref.read(authStateProvider.notifier).signOut();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Déconnecté avec succès')),
                  );
                }
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProfileItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        size: 16,
        color: Colors.grey,
      ),
      onTap: onTap,
    );
  }
}
