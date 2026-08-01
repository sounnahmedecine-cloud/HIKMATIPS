import 'dart:ui';

import 'package:flutter/material.dart';

class GlassSurface extends StatelessWidget {
  const GlassSurface({
    required this.child,
    super.key,
    this.padding = const EdgeInsets.all(16),
    this.borderRadius = 22,
    this.opacity = .18,
    this.blur = 18,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double borderRadius;
  final double opacity;
  final double blur;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: opacity),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: borderColor ?? Colors.white.withValues(alpha: .26),
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
