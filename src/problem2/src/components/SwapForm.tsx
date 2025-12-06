import {useEffect, useMemo, useState} from 'react';
import {useTokenPrices} from '../hooks/useTokenPrices';
import {formatNumber} from '../utils/format';
import {getTokenIconUrl} from '../utils/tokenIcon';

type ErrorState = {
    fromToken?: string;
    toToken?: string;
    amount?: string;
};

type Status = 'idle' | 'loading';

const MOCK_BALANCE = 1000;

export function SwapForm() {
    const {tokens, loading, error: pricesError} = useTokenPrices();

    const [fromToken, setFromToken] = useState<string | null>(null);
    const [toToken, setToToken] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>('1');
    const [errors, setErrors] = useState<ErrorState>({});
    const [status, setStatus] = useState<Status>('idle');
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (!loading && tokens.length >= 2 && !fromToken && !toToken) {
            setFromToken(tokens[0].symbol);
            setToToken(tokens[1].symbol);
        }
    }, [loading, tokens, fromToken, toToken]);

    const tokenMap = useMemo(
        () => new Map(tokens.map((t) => [t.symbol, t])),
        [tokens],
    );

    const parsedAmount = useMemo(() => {
        if (!amount.trim()) return NaN;
        const normalized = amount.replace(',', '.');
        const v = Number(normalized);
        return Number.isFinite(v) ? v : NaN;
    }, [amount]);

    const quote = useMemo(() => {
        if (!fromToken || !toToken) return null;
        const from = tokenMap.get(fromToken);
        const to = tokenMap.get(toToken);
        if (!from || !to) return null;
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;

        const rate = from.price / to.price;
        const converted = parsedAmount * rate;

        if (!Number.isFinite(rate) || !Number.isFinite(converted)) return null;

        return {
            rate,
            converted,
        };
    }, [fromToken, toToken, tokenMap, parsedAmount]);

    function handleAmountChange(value: string) {
        if (/^[0-9]*[.,]?[0-9]*$/.test(value)) {
            const normalized = value.replace(',', '.');
            setAmount(normalized);
            setErrors((prev) => ({...prev, amount: undefined}));
            setShowResult(false);
        }
    }

    function validate(): boolean {
        const next: ErrorState = {};

        if (!amount.trim()) {
            next.amount = 'Please enter an amount.';
        } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            next.amount = 'Amount must be a positive number.';
        } else if (parsedAmount > MOCK_BALANCE) {
            next.amount = 'Amount exceeds mock balance.';
        }

        if (!fromToken) {
            next.fromToken = 'Select a currency.';
        }
        if (!toToken) {
            next.toToken = 'Select a currency.';
        }
        if (fromToken && toToken && fromToken === toToken) {
            next.toToken = 'Currencies must be different.';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading || pricesError) return;

        if (!validate()) {
            setShowResult(false);
            return;
        }

        if (!quote) {
            setShowResult(false);
            return;
        }

        setStatus('loading');
        setShowResult(false);

        setTimeout(() => {
            setStatus('idle');
            setShowResult(true);
        }, 800);
    }

    const buttonDisabled =
        loading || status === 'loading' || !!pricesError || !tokens.length;

    const rateLine =
        showResult &&
        quote &&
        fromToken &&
        toToken &&
        `1 ${fromToken} = ${formatNumber(quote.rate, 4)} ${toToken}`;

    const resultLine =
        showResult &&
        quote &&
        fromToken &&
        toToken &&
        `${formatNumber(parsedAmount || 0, 4)} ${fromToken} = ${formatNumber(
            quote.converted,
            4,
        )} ${toToken}`;

    return (
        <div
            className="w-full max-w-md rounded-[32px] bg-white px-10 py-10 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
            <h1 className="mb-8 text-center text-[26px] font-semibold tracking-tight text-slate-900">
                Currency Converter
            </h1>

            {pricesError && (
                <p className="mb-4 text-sm font-medium text-red-600">
                    Failed to load prices. Please refresh.
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
                <div className="space-y-2">
                    <label
                        htmlFor="amount"
                        className="block text-[15px] font-medium text-slate-900"
                    >
                        Enter Amount
                    </label>
                    <input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        className={`w-full rounded-xl border px-4 py-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 ${
                            errors.amount ? 'border-red-400' : 'border-slate-300'
                        }`}
                        placeholder="1"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                    />
                    {errors.amount && (
                        <p className="text-xs font-medium text-red-500">{errors.amount}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 items-end gap-4">
                    <div className="space-y-2">
            <span className="block text-[15px] font-medium text-slate-900">
              From
            </span>
                        <div
                            className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm ${
                                errors.fromToken ? 'border-red-400' : 'border-slate-300'
                            }`}
                        >
                            {fromToken && (
                                <img
                                    src={getTokenIconUrl(fromToken)}
                                    alt={fromToken}
                                    className="h-5 w-5 rounded-full border border-slate-200 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                    }}
                                />
                            )}
                            <select
                                className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 outline-none"
                                value={fromToken ?? ''}
                                onChange={(e) => {
                                    setFromToken(e.target.value || null);
                                    setErrors((prev) => ({...prev, fromToken: undefined}));
                                    setShowResult(false);
                                }}
                            >
                                <option value="">Select</option>
                                {tokens.map((t) => (
                                    <option key={t.symbol} value={t.symbol}>
                                        {t.symbol}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.fromToken && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.fromToken}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
            <span className="block text-[15px] font-medium text-slate-900">
              To
            </span>
                        <div
                            className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm ${
                                errors.toToken ? 'border-red-400' : 'border-slate-300'
                            }`}
                        >
                            {toToken && (
                                <img
                                    src={getTokenIconUrl(toToken)}
                                    alt={toToken}
                                    className="h-5 w-5 rounded-full border border-slate-200 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                    }}
                                />
                            )}
                            <select
                                className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 outline-none"
                                value={toToken ?? ''}
                                onChange={(e) => {
                                    setToToken(e.target.value || null);
                                    setErrors((prev) => ({...prev, toToken: undefined}));
                                    setShowResult(false);
                                }}
                            >
                                <option value="">Select</option>
                                {tokens.map((t) => (
                                    <option key={t.symbol} value={t.symbol}>
                                        {t.symbol}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.toToken && (
                            <p className="text-xs font-medium text-red-500">
                                {errors.toToken}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            if (!fromToken && !toToken) return;
                            const f = fromToken;
                            setFromToken(toToken);
                            setToToken(f);
                            setShowResult(false);
                            setErrors({});
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg text-slate-700 shadow-sm"
                    >
                        ⇄
                    </button>
                </div>
                {rateLine && (
                    <p className="text-[15px] font-medium text-slate-900">{rateLine}</p>
                )}
                {resultLine && (
                    <p className="text-[13px] text-slate-600">{resultLine}</p>
                )}
                <button
                    type="submit"
                    disabled={buttonDisabled}
                    className="mt-2 w-full rounded-xl bg-indigo-500 py-3.5 text-center text-[15px] font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {status === 'loading' ? 'Loading…' : 'Get Exchange Rate'}
                </button>
                <p className="mt-3 text-center text-[11px] font-medium text-slate-500">
                    Rates from Switcheo interview API
                </p>
            </form>
        </div>
    );
}
