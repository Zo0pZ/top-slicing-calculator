const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, '..', 'top-slicing-calculator.web.app', 'script.js');
const calculatorSource = fs.readFileSync(scriptPath, 'utf8');
const appPath = path.join(__dirname, '..', 'top-slicing-calculator.web.app');
const indexMarkup = fs.readFileSync(path.join(appPath, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(appPath, 'styles.css'), 'utf8');
const printStyles = fs.readFileSync(path.join(appPath, 'print.css'), 'utf8');
const robotsRules = fs.readFileSync(path.join(appPath, 'robots.txt'), 'utf8');

function createCalculator(taxYear = '2025') {
    const taxYearSelect = { value: taxYear };
    const document = {
        addEventListener() {},
        getElementById(id) {
            return id === 'tax-year-select' ? taxYearSelect : null;
        },
        querySelector() {
            return null;
        }
    };
    const context = { document, console, Intl, Math, Number };
    vm.createContext(context);
    vm.runInContext(`${calculatorSource}
        globalThis.calculator = {
            BOND_TYPES,
            TAX_YEARS,
            calculateMultipleGains,
            calculateTaxBands,
            calculateTopSlicingRelief
        };
    `, context, { filename: scriptPath });
    return context.calculator;
}

function assertMoney(actual, expected) {
    assert.ok(Math.abs(actual - expected) < 0.01, `Expected £${expected.toFixed(2)}, got £${actual.toFixed(2)}`);
}

const incomes = { totalNonSavingsIncome: 32700, savingsIncome: 0, dividendIncome: 0 };

test('offshore gain has no treated-as-paid credit and corrected LH slice result', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(65000, BOND_TYPES.OFFSHORE, 6, 32700, 0, 0);

    assert.equal(result.basicRateTaxTreatedAsPaid, 0);
    assert.equal(result.sliceBasicRateTaxTreatedAsPaid, 0);
    assert.equal(result.taxOnBondGain.totalTaxOnGain, 22386);
    assert.equal(result.tsrBasicRateDeduction, 13000);
    assert.equal(result.liabilityForTaxYearForTSR, 9386);
    assertMoney(result.taxOnSlice.totalTaxOnGain, 1966.67);
    assertMoney(result.sliceTsrBasicRateDeduction, 2166.67);
    assertMoney(result.reliefedLiability, 0);
    assertMoney(result.topSlicingRelief, 9386);
    assertMoney(result.finalLiability, 13000);
});

test('onshore treated-as-paid credit is 20% of the full gain', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(65000, BOND_TYPES.ONSHORE, 6, 32700, 0, 0);

    assert.equal(result.basicRateTaxTreatedAsPaid, 13000);
    assert.equal(result.liabilityForTaxYear, 9386);
});

test('onshore credit still uses the full gain when Personal Allowance absorbs it', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(5000, BOND_TYPES.ONSHORE, 1, 0, 0, 0);

    assert.equal(result.taxOnBondGain.totalTaxOnGain, 0);
    assert.equal(result.basicRateTaxTreatedAsPaid, 1000);
});

test('additional-rate threshold moves with the tapered Personal Allowance', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(10000, BOND_TYPES.OFFSHORE, 1, 120000, 0, 0);

    assert.equal(result.personalAllowance, 0);
    assert.equal(result.taxBands.bondGainInHigherRate, 5140);
    assert.equal(result.taxBands.bondGainInAdditionalRate, 4860);
    assert.equal(result.taxOnBondGain.totalTaxOnGain, 4243);
});

test('HMRC IPTM3850 two-gain example matches each calculation stage', () => {
    const { BOND_TYPES, calculateMultipleGains } = createCalculator('2022');
    const result = calculateMultipleGains([
        { amount: 50000, years: 5, type: BOND_TYPES.ONSHORE },
        { amount: 10000, years: 4, type: BOND_TYPES.ONSHORE }
    ], { totalNonSavingsIncome: 40000, savingsIncome: 0, dividendIncome: 0 });
    const combined = result.combinedResult;

    assert.equal(result.totalGain, 60000);
    assert.equal(result.combinedAnnualEquivalent, 12500);
    assert.equal(result.topSlicingFactor, 4.8);
    assert.equal(combined.taxOnBondGain.totalTaxOnGain, 21846);
    assert.equal(combined.basicRateTaxTreatedAsPaid, 12000);
    assert.equal(combined.liabilityForTaxYear, 9846);
    assert.equal(combined.taxOnSlice.totalTaxOnGain, 2846);
    assert.equal(combined.sliceBasicRateTaxTreatedAsPaid, 2500);
    assertMoney(combined.reliefedLiability, 1660.8);
    assertMoney(combined.topSlicingRelief, 8185.2);
    assertMoney(combined.finalLiability, 1660.8);
});

test('HMRC IPTM3850 single-gain example matches each calculation stage', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator('2022');
    const result = calculateTopSlicingRelief(50000, BOND_TYPES.ONSHORE, 5, 45000, 0, 0);

    assert.equal(result.taxOnBondGain.totalTaxOnGain, 18846);
    assert.equal(result.basicRateTaxTreatedAsPaid, 10000);
    assert.equal(result.liabilityForTaxYear, 8846);
    assert.equal(result.taxOnSlice.totalTaxOnGain, 2846);
    assert.equal(result.sliceBasicRateTaxTreatedAsPaid, 2000);
    assert.equal(result.liabilityOnSlice, 846);
    assert.equal(result.reliefedLiability, 4230);
    assert.equal(result.topSlicingRelief, 4616);
    assert.equal(result.finalLiability, 4230);
});

test('offshore policy has no actual credit but uses HMRC notional deductions within TSR', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator('2022');
    const result = calculateTopSlicingRelief(50000, BOND_TYPES.OFFSHORE, 5, 45000, 0, 0);

    assert.equal(result.taxOnBondGain.totalTaxOnGain, 18846);
    assert.equal(result.basicRateTaxTreatedAsPaid, 0);
    assert.equal(result.liabilityForTaxYear, 18846);
    assert.equal(result.tsrBasicRateDeduction, 10000);
    assert.equal(result.liabilityForTaxYearForTSR, 8846);
    assert.equal(result.taxOnSlice.totalTaxOnGain, 2846);
    assert.equal(result.sliceBasicRateTaxTreatedAsPaid, 0);
    assert.equal(result.sliceTsrBasicRateDeduction, 2000);
    assert.equal(result.liabilityOnSlice, 846);
    assert.equal(result.reliefedLiability, 4230);
    assert.equal(result.topSlicingRelief, 4616);
    assert.equal(result.finalLiability, 14230);
});

test('Personal Allowance tapers on full gain and is recalculated on slice', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(40000, BOND_TYPES.OFFSHORE, 5, 90000, 0, 0);

    assert.equal(result.personalAllowance, 0);
    assert.equal(result.slicePersonalAllowance, 12570);
});

test('historical tax years keep pre-change slice allowances', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator('2017');
    const pre2018 = calculateTopSlicingRelief(40000, BOND_TYPES.OFFSHORE, 5, 90000, 0, 0);
    const { calculateTopSlicingRelief: calculateFor2020 } = createCalculator('2020');
    const pre2021 = calculateFor2020(40000, BOND_TYPES.OFFSHORE, 5, 40000, 0, 0);
    const pre2021StartingRate = calculateFor2020(100000, BOND_TYPES.OFFSHORE, 5, 9000, 0, 0);

    assert.equal(pre2018.personalAllowance, 0);
    assert.equal(pre2018.slicePersonalAllowance, 0);
    assert.equal(pre2018.slicePsa, pre2018.psa);
    assert.equal(pre2021.psa, 500);
    assert.equal(pre2021.slicePsa, 500);
    assert.equal(pre2021StartingRate.startingRateForSavings, 4000);
    assert.equal(pre2021StartingRate.sliceStartingRateForSavings, 4000);
});

test('gross pension and Gift Aid relief reduce ANI and extend tax bands', () => {
    const { BOND_TYPES, calculateMultipleGains } = createCalculator();
    const result = calculateMultipleGains([{ amount: 10000, years: 1, type: BOND_TYPES.OFFSHORE }], {
        totalNonSavingsIncome: 50000,
        savingsIncome: 0,
        dividendIncome: 0,
        grossPensionContributions: 5000,
        grossGiftAidDonations: 5000
    }).combinedResult;

    assert.equal(result.adjustedNetIncome, 50000);
    assert.equal(result.personalAllowance, 12570);
    assert.equal(result.taxBands.bondGainInPSA, 1000);
    assert.equal(result.taxBands.bondGainInBasicRate, 9000);
    assert.equal(result.taxBands.bondGainInHigherRate, 0);
    assert.equal(result.taxOnBondGain.totalTaxOnGain, 1800);
});

test('PSA changes from higher-rate to basic-rate allowance at slice level', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(40000, BOND_TYPES.OFFSHORE, 5, 40000, 0, 0);

    assert.equal(result.psa, 500);
    assert.equal(result.slicePsa, 1000);
});

test('TSR is zero, not negative, when one-year slice equals full gain', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(10000, BOND_TYPES.OFFSHORE, 1, 60000, 0, 0);

    assert.equal(result.topSlicingRelief, 0);
    assert.equal(result.finalLiability, result.liabilityForTaxYear);
});

test('mixed gains preserve ordering and calculate aggregate and individual slices', () => {
    const { BOND_TYPES, calculateMultipleGains } = createCalculator();
    const gains = [
        { amount: 30000, years: 5, type: BOND_TYPES.ONSHORE },
        { amount: 20000, years: 10, type: BOND_TYPES.OFFSHORE }
    ];
    const result = calculateMultipleGains(gains, incomes);

    assert.deepEqual(result.gains, gains);
    assert.equal(result.combinedAnnualEquivalent, 8000);
    assert.equal(result.topSlicingFactor, 6.25);
    assert.equal(result.combinedResult.basicRateTaxTreatedAsPaid, 6000);
    assert.equal(result.combinedResult.sliceBasicRateTaxTreatedAsPaid, 1200);
    assert.equal(result.individualResults[0].basicRateTaxTreatedAsPaid, 6000);
    assert.equal(result.individualResults[1].basicRateTaxTreatedAsPaid, 0);
});

test('Starting Rate for Savings is available after non-savings income uses Personal Allowance', () => {
    const { BOND_TYPES, calculateTopSlicingRelief } = createCalculator();
    const result = calculateTopSlicingRelief(10000, BOND_TYPES.OFFSHORE, 1, 10000, 0, 0);

    assert.equal(result.startingRateForSavings, 5000);
    assert.equal(result.taxBands.bondGainInSRSB, 5000);
});

test('non-savings income gets Personal Allowance before dividends and savings gain', () => {
    const { calculateTaxBands } = createCalculator();
    const bands = calculateTaxBands(10000, 0, 10000, 1000, 12570, 1000, 5000);

    assert.equal(bands.bondGainInSRSB, 0);
    assert.equal(bands.bondGainInPSA, 0);
    assert.equal(bands.bondGainInBasicRate, 0);
    assert.equal(bands.bondGainInHigherRate, 0);
    assert.equal(bands.bondGainInAdditionalRate, 0);
});

test('zero or fractional complete years and negative gains are rejected', () => {
    const { BOND_TYPES, calculateMultipleGains } = createCalculator();

    assert.throws(() => calculateMultipleGains([{ amount: 10000, years: 0, type: BOND_TYPES.ONSHORE }], incomes), {
        name: 'RangeError',
        message: 'Complete years must be 1 or greater.'
    });
    assert.throws(() => calculateMultipleGains([{ amount: 10000, years: 1.5, type: BOND_TYPES.ONSHORE }], incomes), {
        name: 'RangeError',
        message: 'Complete years must be 1 or greater.'
    });
    assert.throws(() => calculateMultipleGains([{ amount: -1, years: 1, type: BOND_TYPES.ONSHORE }], incomes), {
        name: 'RangeError',
        message: 'Gain amount must be zero or greater.'
    });
});

test('2025/26 tax-year constants are available', () => {
    const { TAX_YEARS } = createCalculator('2025');

    assert.equal(TAX_YEARS[2025].personalAllowance, 12570);
    assert.equal(TAX_YEARS[2025].basicRateThreshold, 37700);
    assert.equal(TAX_YEARS[2025].higherRateThreshold, 125140);
});

test('UI declares non-negative gains, whole complete years, ownership guidance, and disclaimer', () => {
    assert.match(indexMarkup, /id="gain-amount-1"[^>]*min="0"[^>]*step="0\.01"/);
    assert.match(indexMarkup, /id="gain-years-1"[^>]*min="1"[^>]*step="1"/);
    assert.match(indexMarkup, /For jointly owned bonds, check the chargeable event certificate/);
    assert.match(indexMarkup, /Negative gains and capital-loss deductions are not supported/);
    assert.match(indexMarkup, /id="gross-pension-contributions"[^>]*min="0"/);
    assert.match(indexMarkup, /id="gross-gift-aid-donations"[^>]*min="0"/);
    assert.match(indexMarkup, /Exclude salary-sacrifice or net-pay pension contributions/);
    assert.match(calculatorSource, /grossGiftAidDonations/);
    assert.match(calculatorSource, /This tool provides estimates based on standard HMRC Top Slicing Relief rules/);
    assert.match(calculatorSource, /Notional Basic Rate Deduction for TSR/);
});

test('page exposes semantic landmarks, announced status, and associated validation', () => {
    assert.match(indexMarkup, /<a class="skip-link" href="#main-content">/);
    assert.match(indexMarkup, /<main id="main-content">/);
    assert.match(indexMarkup, /<form id="calculator-form" novalidate>/);
    assert.match(indexMarkup, /<fieldset class="multi-gain-item" id="gain-1">/);
    assert.match(indexMarkup, /<legend>Chargeable Event Gain #1<\/legend>/);
    assert.match(indexMarkup, /id="calculation-error"[^>]*role="alert"/);
    assert.match(indexMarkup, /id="calculation-status"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(indexMarkup, /id="show-details"[^>]*aria-controls="detailed-calculations"/);
    assert.match(calculatorSource, /updateDescribedBy\(invalidInput, 'calculation-error', true\)/);
    assert.match(calculatorSource, /data-remove-gain/);
    assert.match(calculatorSource, /document.createElement\('fieldset'\)/);
    assert.match(calculatorSource, /<dl class="result-row">/);
    assert.match(calculatorSource, /<th scope="col"/);
    assert.match(calculatorSource, /tabindex="0"/);
    assert.doesNotMatch(`${indexMarkup}\n${calculatorSource}`, /onclick=/i);
    assert.doesNotMatch(indexMarkup, /style=/i);
    assert.doesNotMatch(indexMarkup, /font-awesome/i);
});

test('styles support visible focus, reduced motion, forced colors, and clean print output', () => {
    assert.match(styles, /\*\s*,\s*\n\*::before/);
    assert.match(styles, /:focus-visible/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce/);
    assert.match(styles, /forced-colors:\s*active/);
    assert.match(printStyles, /\.no-print, #back-to-top\s*\{\s*display:\s*none/);
    assert.match(printStyles, /\.hidden\s*\{\s*display:\s*none/);
    assert.match(robotsRules, /^User-agent: \*\r?\nAllow: \/\s*$/);
});