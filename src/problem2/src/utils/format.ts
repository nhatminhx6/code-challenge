export function formatNumber(value: number, digits = 6): string {
    if (!Number.isFinite(value)) return '0';
    if (value === 0) return '0.00';

    if (value >= 1) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        });
    }

    return value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}
