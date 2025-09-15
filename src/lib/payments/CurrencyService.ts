export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: Date
}

export interface CurrencyConversionOptions {
  amount: number
  fromCurrency: string
  toCurrency: string
  displayBoth?: boolean
}

export interface ConversionResult {
  originalAmount: number
  originalCurrency: string
  convertedAmount: number
  convertedCurrency: string
  exchangeRate: number
  displayText: string
}

export class CurrencyService {
  private static exchangeRates: Map<string, ExchangeRate> = new Map()
  private static readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

  /**
   * Get real-time exchange rate from USD to KES
   * For production, you should use a proper API like CurrencyLayer, ExchangeRate-API, etc.
   */
  private static async fetchExchangeRate(from: string, to: string): Promise<number> {
    try {
      // Using a free exchange rate API (replace with your preferred service)
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.rates || !data.rates[to]) {
        throw new Error(`Exchange rate not found for ${from} to ${to}`)
      }
      
      return data.rates[to]
    } catch (error) {
      console.error('Failed to fetch real-time exchange rate:', error)
      
      // Fallback to approximate rates (update these periodically)
      const fallbackRates: Record<string, Record<string, number>> = {
        'USD': {
          'KES': 150.0, // Approximate rate - update regularly
          'NGN': 1650.0,
          'GHS': 12.0,
          'ZAR': 18.5
        },
        'KES': {
          'USD': 0.0067
        }
      }
      
      return fallbackRates[from]?.[to] || 1
    }
  }

  /**
   * Get cached or fresh exchange rate
   */
  static async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1

    const cacheKey = `${from}_${to}`
    const cached = this.exchangeRates.get(cacheKey)
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.CACHE_DURATION) {
      return cached.rate
    }

    try {
      const rate = await this.fetchExchangeRate(from, to)
      
      this.exchangeRates.set(cacheKey, {
        from,
        to,
        rate,
        lastUpdated: new Date()
      })
      
      return rate
    } catch (error) {
      console.error(`Failed to get exchange rate for ${from} to ${to}:`, error)
      return cached?.rate || 1
    }
  }

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(options: CurrencyConversionOptions): Promise<ConversionResult> {
    const { amount, fromCurrency, toCurrency, displayBoth = true } = options
    
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency)
    const convertedAmount = Math.round(amount * exchangeRate * 100) / 100
    
    let displayText: string
    if (displayBoth && fromCurrency !== toCurrency) {
      displayText = `${this.formatCurrency(amount, fromCurrency)} (≈ ${this.formatCurrency(convertedAmount, toCurrency)})`
    } else {
      displayText = this.formatCurrency(convertedAmount, toCurrency)
    }
    
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      convertedCurrency: toCurrency,
      exchangeRate,
      displayText
    }
  }

  /**
   * Format currency with proper symbols and locale
   */
  static formatCurrency(amount: number, currency: string): string {
    const currencyConfig: Record<string, { locale: string; symbol?: string }> = {
      'USD': { locale: 'en-US' },
      'KES': { locale: 'en-KE', symbol: 'KSh' },
      'NGN': { locale: 'en-NG', symbol: '₦' },
      'GHS': { locale: 'en-GH', symbol: 'GH₵' },
      'ZAR': { locale: 'en-ZA', symbol: 'R' }
    }

    const config = currencyConfig[currency] || { locale: 'en-US' }
    
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (error) {
      // Fallback formatting if Intl fails
      const symbol = config.symbol || currency
      return `${symbol} ${amount.toFixed(2)}`
    }
  }

  /**
   * Get supported currencies for Kenya-based business
   */
  static getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
    ]
  }

  /**
   * Determine the best settlement currency for Kenya-based business
   */
  static getSettlementCurrency(paymentCurrency: string): string {
    // For Kenya-based business, convert everything to KES for settlement
    // unless specifically configured otherwise
    return paymentCurrency === 'USD' ? 'KES' : paymentCurrency
  }

  /**
   * Get conversion display text for payment forms
   */
  static async getPaymentDisplayText(amount: number, paymentCurrency: string): Promise<string> {
    if (paymentCurrency === 'USD') {
      const conversion = await this.convertCurrency({
        amount,
        fromCurrency: 'USD',
        toCurrency: 'KES',
        displayBoth: true
      })
      return `${conversion.displayText} - Charged in USD, settled in KES`
    }
    
    return this.formatCurrency(amount, paymentCurrency)
  }
}
