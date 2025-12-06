interface WalletBalance {
    currency: string;
    amount: number;
    // ISSUE: "blockchain" is used later but not declared here
    // blockchain: string;
}
interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    const getPriority = (blockchain: any): number => {
        // ISSUE: any
        // Note: avoid using any here since it bypasses TypeScript type safety.
        // We should replace it with a specific union type (e.g. 'Osmosis' | 'Ethereum' | ...)
        switch (blockchain) {
            case 'Osmosis':
                return 100
            case 'Ethereum':
                return 50
            case 'Arbitrum':
                return 30
            case 'Zilliqa':
                return 20
            case 'Neo':
                return 20
            default:
                return -99
        }
    }

    const sortedBalances = useMemo(() => {
        return balances.filter((balance: WalletBalance) => {
            // ISSUE: "balance" is declared as WalletBalance but WalletBalance has no `blockchain`
            const balancePriority = getPriority(balance.blockchain);
            // ISSUE: using lhsPriority which is not defined (should be "balancePriority")
            if (lhsPriority > -99) {
                // ISSUE: this keeps balances with amount <= 0, usually we want > 0
                if (balance.amount <= 0) {
                    return true;
                }
            }
            return false
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            if (leftPriority > rightPriority) {
                return -1;
            } else if (rightPriority > leftPriority) {
                return 1;
            }
            // ISSUE: no return for the "equal" case; should "return 0" here
        });
        // ISSUE: prices is in dependency array but not used in the memo body
    }, [balances, prices]);

    // ISSUE: "formattedBalances" is never used;
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
        return {
            ...balance,
            formatted: balance.amount.toFixed()
        }
    })

    // ISSUE: "sortedBalances" elements are WalletBalance, but the parameter is typed as FormattedWalletBalance
    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
            <WalletRow
                className={classes.row}
                // ISSUE: using "index" as key is an anti-pattern for dynamic lists
                key={index}
                amount={balance.amount}
                usdValue={usdValue}
                // ISSUE: "balance.formatted" is undefined here because "sortedBalances" items do not have "formatted"
                formattedAmount={balance.formatted}
            />
        )
    })

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}
