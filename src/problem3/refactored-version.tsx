import React, { useMemo } from 'react';
import type { BoxProps } from 'some-where';

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // FIX: add blockchain so we can use it in getPriority
}

interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    const getPriority = (blockchain: string): number => {
        // FIX: use string instead of any for better type safety
        switch (blockchain) {
            case 'Osmosis':
                return 100;
            case 'Ethereum':
                return 50;
            case 'Arbitrum':
                return 30;
            case 'Zilliqa':
                return 20;
            case 'Neo':
                return 20;
            default:
                return -99;
        }
    };

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const balancePriority = getPriority(balance.blockchain);
                // FIX: use balancePriority instead of undefined lhsPriority
                // and keep only balances with valid priority and positive amount
                if (balancePriority > -99 && balance.amount > 0) {
                    return true;
                }
                return false;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);

                if (leftPriority > rightPriority) {
                    return -1;
                } else if (rightPriority > leftPriority) {
                    return 1;
                }
                return 0; // FIX: explicitly handle equal priority
            });
        // FIX: prices removed from deps because it is not used here
    }, [balances]);

    const formattedBalances = sortedBalances.map(
        (balance: WalletBalance): FormattedWalletBalance => {
            return {
                ...balance,
                formatted: balance.amount.toFixed(),
            };
        },
    );

    const rows = formattedBalances.map(
        (balance: FormattedWalletBalance, index: number) => {
            // FIX: use formattedBalances here so `formatted` actually exists
            const usdValue = prices[balance.currency] * balance.amount;
            return (
                <WalletRow
                    className={classes.row}
                    key={`${balance.blockchain}-${balance.currency}`} // use a stable unique key instead of index
                    amount={balance.amount}
                    usdValue={usdValue}
                    formattedAmount={balance.formatted}
                />
            );
        },
    );

    return (
        <div {...rest}>
            {rows}
        </div>
    );
};
