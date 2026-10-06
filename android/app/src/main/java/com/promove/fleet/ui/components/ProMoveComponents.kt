package com.promove.fleet.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.promove.fleet.data.model.VehicleStatus
import com.promove.fleet.theme.BorderSubtle
import com.promove.fleet.theme.DVLAPlateBorder
import com.promove.fleet.theme.DVLAPlateYellowBottom
import com.promove.fleet.theme.DVLAPlateYellowTop
import com.promove.fleet.theme.DeepSeaBlue
import com.promove.fleet.theme.GhanaFlagGold
import com.promove.fleet.theme.GhanaFlagGreen
import com.promove.fleet.theme.GhanaFlagRed
import com.promove.fleet.theme.SeaBlue
import com.promove.fleet.theme.SoftIce
import com.promove.fleet.theme.TextPrimary
import com.promove.fleet.theme.TextSecondary

@Composable
fun DVLAPlateBadge(
    plateNumber: String,
    modifier: Modifier = Modifier,
    isCompact: Boolean = false
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .border(width = 1.5.dp, color = DVLAPlateBorder, shape = RoundedCornerShape(6.dp)),
        color = Color.Transparent
    ) {
        Box(
            modifier = Modifier.background(
                brush = Brush.verticalGradient(
                    colors = listOf(DVLAPlateYellowTop, DVLAPlateYellowBottom)
                )
            )
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(if (isCompact) 4.dp else 6.dp),
                modifier = Modifier.padding(
                    horizontal = if (isCompact) 6.dp else 10.dp,
                    vertical = if (isCompact) 3.dp else 5.dp
                )
            ) {
                // Ghana Flag & GH code
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(1.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .width(if (isCompact) 10.dp else 14.dp)
                            .height(if (isCompact) 6.dp else 8.dp)
                            .clip(RoundedCornerShape(1.dp))
                    ) {
                        Box(modifier = Modifier.fillMaxWidth().weight(1f).background(GhanaFlagRed))
                        Box(modifier = Modifier.fillMaxWidth().weight(1f).background(GhanaFlagGold))
                        Box(modifier = Modifier.fillMaxWidth().weight(1f).background(GhanaFlagGreen))
                    }
                    Text(
                        text = "GH",
                        fontSize = if (isCompact) 7.sp else 9.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = Color.Black
                    )
                }

                // Plate text
                Text(
                    text = plateNumber.uppercase(),
                    fontSize = if (isCompact) 12.sp else 15.sp,
                    fontWeight = FontWeight.ExtraBold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.sp,
                    color = Color.Black
                )
            }
        }
    }
}

@Composable
fun StatusChip(
    status: VehicleStatus,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, dotColor) = when (status) {
        VehicleStatus.ACTIVE -> Triple(Color(0xFFDCFCE7), Color(0xFF166534), Color(0xFF16A34A))
        VehicleStatus.IDLE -> Triple(Color(0xFFE0F2FE), Color(0xFF075985), Color(0xFF0EA5E9))
        VehicleStatus.MAINTENANCE -> Triple(Color(0xFFFEF3C7), Color(0xFF92400E), Color(0xFFD97706))
        VehicleStatus.UNAVAILABLE -> Triple(Color(0xFFFEE2E2), Color(0xFF991B1B), Color(0xFFDC2626))
    }

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(5.dp),
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(dotColor)
            )
            Text(
                text = status.displayName,
                color = textColor,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String? = null,
    icon: ImageVector,
    iconColor: Color = SeaBlue,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier.border(1.dp, BorderSubtle, RoundedCornerShape(14.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextSecondary
                )
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(iconColor.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(15.dp)
                    )
                }
            }

            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )

            if (subtitle != null) {
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
fun FilterChipItem(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) DeepSeaBlue else SoftIce,
        modifier = modifier.clickable { onClick() }
    ) {
        Text(
            text = title,
            color = if (isSelected) Color.White else DeepSeaBlue,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}
