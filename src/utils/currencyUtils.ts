/**
 * Currency utility for Kinshasa (DRC)
 * Supports US Dollars ($ USD) and Franc Congolais (CDF / FC)
 */

export type CurrencyMode = 'BOTH' | 'USD' | 'CDF';

export const DEFAULT_USD_TO_CDF_RATE = 2800; // Standard Kinshasa market exchange rate

const CURRENCY_MODE_KEY = 'line_currency_display_mode';
const EXCHANGE_RATE_KEY = 'line_usd_to_cdf_rate';

export function getExchangeRate(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return DEFAULT_USD_TO_CDF_RATE;
}

export function setExchangeRate(rate: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EXCHANGE_RATE_KEY, rate.toString());
    window.dispatchEvent(new Event('currency_changed'));
  }
}

export function getCurrencyMode(): CurrencyMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CURRENCY_MODE_KEY) as CurrencyMode;
    if (saved === 'BOTH' || saved === 'USD' || saved === 'CDF') return saved;
  }
  return 'BOTH'; // Default to showing both ($ and FC) in Kinshasa
}

export function setCurrencyMode(mode: CurrencyMode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_MODE_KEY, mode);
    window.dispatchEvent(new Event('currency_changed'));
  }
}

/**
 * Format numbers with French spaces (e.g. 70000 -> "70 000")
 */
export function formatThousands(value: number): string {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Converts and formats price into USD and Franc Congolais (FC)
 */
export interface FormattedPrice {
  primary: string;       // e.g. "35 $" or "98 000 FC"
  secondary: string;     // e.g. "98 000 FC" or "35 $"
  secondaryLabel: string;// e.g. "~98 000 FC"
  combined: string;      // e.g. "35 $ (~98 000 FC)"
  usdAmount: number;     // e.g. 35
  fcAmount: number;      // e.g. 98000
}

export function formatDualPrice(
  price: number,
  currency: string = '$',
  rate: number = getExchangeRate()
): FormattedPrice {
  const isFC = currency.toUpperCase() === 'FC' || currency.toUpperCase() === 'CDF';

  let usd = 0;
  let fc = 0;

  if (isFC) {
    fc = Math.round(price);
    usd = Math.round((price / rate) * 10) / 10;
  } else {
    usd = price;
    fc = Math.round(price * rate);
  }

  const usdFormatted = `${usd % 1 === 0 ? usd : usd.toFixed(1)} $`;
  const fcFormatted = `${formatThousands(fc)} FC`;

  if (isFC) {
    return {
      primary: fcFormatted,
      secondary: usdFormatted,
      secondaryLabel: `~${usdFormatted}`,
      combined: `${fcFormatted} (~${usdFormatted})`,
      usdAmount: usd,
      fcAmount: fc,
    };
  }

  return {
    primary: usdFormatted,
    secondary: fcFormatted,
    secondaryLabel: `~${fcFormatted}`,
    combined: `${usdFormatted} (~${fcFormatted})`,
    usdAmount: usd,
    fcAmount: fc,
  };
}
