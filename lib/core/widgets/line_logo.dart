import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Widget réutilisable affichant le nom "Leen" avec la police script élégante
/// similaire à Edwardian Script ITC.
class LineLogo extends StatelessWidget {
  final double fontSize;
  final Color? color;

  const LineLogo({
    super.key,
    this.fontSize = 32,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final resolvedColor = color ?? Theme.of(context).colorScheme.onSurface;
    return Text(
      'Line',
      style: GoogleFonts.greatVibes(
        fontSize: fontSize,
        color: resolvedColor,
        fontWeight: FontWeight.w400,
        letterSpacing: 1.5,
      ),
    );
  }
}
