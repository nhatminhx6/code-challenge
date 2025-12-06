import type { TokenPrice } from '../hooks/useTokenPrices';

const TOKEN_ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

function getTokenIconUrl(symbol: string): string {
  return `${TOKEN_ICON_BASE}/${symbol}.svg`;
}

type TokenSelectProps = {
  value: string | null;
  onChange: (symbol: string) => void;
  tokens: TokenPrice[];
  error?: string;
};

export function TokenSelect({ value, onChange, tokens, error }: TokenSelectProps) {
  const iconUrl = value ? getTokenIconUrl(value) : null;

  return (
    <div className="space-y-1">
      <div
        className={[
          'relative flex h-11 items-center rounded-full border bg-slate-900/80 px-3 text-sm',
          error ? 'border-red-500/70' : 'border-slate-700/80',
        ].join(' ')}
      >
        <select
          className="h-full w-full appearance-none bg-transparent pr-6 text-sm outline-none"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select token
          </option>
          {tokens.map((token) => (
            <option key={token.symbol} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-500">
          ▼
        </span>
      </div>

      <div className="flex min-h-[18px] items-center gap-2 text-[11px] text-slate-400">
        {value && iconUrl && (
          <>
            <img
              src={iconUrl}
              alt={value}
              className="h-4 w-4 rounded-full border border-slate-700 bg-slate-950 object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.visibility = 'hidden';
              }}
            />
            <span>{value}</span>
          </>
        )}
      </div>

      {error && <p className="min-h-[14px] text-xs text-red-400">{error}</p>}
    </div>
  );
}
