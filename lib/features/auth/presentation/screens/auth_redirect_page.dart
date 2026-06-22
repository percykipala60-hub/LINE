import 'package:flutter/material.dart';
import '../../../../core/widgets/line_logo.dart';

class AuthRedirectPage extends StatelessWidget {
  final String message;
  const AuthRedirectPage({
    super.key,
    this.message = 'Validation de votre compte en cours...',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF040617), // deep night
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const LineLogo(fontSize: 84),
                const SizedBox(height: 24),
                Text(
                  'LINE',
                  style: TextStyle(
                    color: Colors.cyanAccent.shade200,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF071029),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.shade900.withAlpha(
                          (0.6 * 255).round(),
                        ),
                        blurRadius: 20,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 8),
                      const CircularProgressIndicator.adaptive(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Color(0xFF00E5FF),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Restez dans cette fenêtre — cela prend quelques secondes.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.blue.shade200.withAlpha(
                            (0.9 * 255).round(),
                          ),
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
