package com.promove.fleet.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val ProMoveLightColorScheme = lightColorScheme(
    primary = DeepSeaBlue,
    onPrimary = Color.White,
    primaryContainer = SoftIce,
    onPrimaryContainer = DeepSeaBlue,
    secondary = SeaBlue,
    onSecondary = Color.White,
    secondaryContainer = SoftIce,
    onSecondaryContainer = SeaBlue,
    tertiary = ElectricTeal,
    onTertiary = Color.White,
    background = BackgroundLight,
    onBackground = TextPrimary,
    surface = SurfaceLight,
    onSurface = TextPrimary,
    surfaceVariant = SoftIce,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle,
    error = DangerRed,
    onError = Color.White
)

private val ProMoveDarkColorScheme = darkColorScheme(
    primary = SeaBlue,
    onPrimary = Color.White,
    primaryContainer = DeepSeaBlue,
    onPrimaryContainer = Color.White,
    secondary = ElectricTeal,
    onSecondary = Color.Black,
    tertiary = GhanaAmber,
    onTertiary = Color.Black,
    background = Color(0xFF0A0F1D),
    onBackground = Color(0xFFF1F5F9),
    surface = Color(0xFF131D31),
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = Color(0xFF1E293B),
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = Color(0xFF334155),
    error = DangerRed,
    onError = Color.White
)

@Composable
fun ProMoveFleetTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) ProMoveDarkColorScheme else ProMoveLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
