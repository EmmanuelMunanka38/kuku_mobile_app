import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useThemeStore } from '../../constants/themes';

type LucideIconName = keyof typeof LucideIcons;

interface IconProps {
  name: LucideIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, color, strokeWidth = 2 }: IconProps) {
  const themeColors = useThemeStore((s) => s.colors);
  const LucideIcon = LucideIcons[name] as React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }> | undefined;

  if (!LucideIcon) {
    return <View style={{ width: size, height: size }} />;
  }

  return (
    <LucideIcon
      size={size}
      color={color || themeColors.onSurfaceVariant}
      strokeWidth={strokeWidth}
    />
  );
}
