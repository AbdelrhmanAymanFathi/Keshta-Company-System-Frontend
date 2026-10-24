const SHADCN_CHART_COLORS = [
  'hsl(var(--shadcn-chart-1))',
  'hsl(var(--shadcn-chart-2))',
  'hsl(var(--shadcn-chart-3))',
  'hsl(var(--shadcn-chart-4))',
  'hsl(var(--shadcn-chart-5))'
]

export function getShadcnChartColors(count = SHADCN_CHART_COLORS.length) {
  return Array.from({ length: count }, (_, index) => SHADCN_CHART_COLORS[index % SHADCN_CHART_COLORS.length])
}

export const shadcnChartTextColor = 'hsl(var(--shadcn-muted-foreground))'
export const shadcnChartBorderColor = 'hsl(var(--shadcn-border))'
