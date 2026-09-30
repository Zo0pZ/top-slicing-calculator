// Tax constants for all years. Each year object defines the tax thresholds and rates.
// - personalAllowance: The amount of income an individual can earn before paying income tax.
// - basicRateThreshold: The upper limit of the basic tax rate band (after personal allowance).
// - higherRateThreshold: The income level at which the higher tax rate applies (this is the start of the additional rate band, effectively).
// - startingRateSavings: The 0% starting rate band for savings income.
// - basicRatePSA: Personal Savings Allowance for basic rate taxpayers.
// - higherRatePSA: Personal Savings Allowance for higher rate taxpayers.
// - basicRate, higherRate, additionalRate: The respective income tax rates as decimals.
const TAX_YEARS = {
    2025: {
        personalAllowance: 12570,
        basicRateThreshold: 37700,
        higherRateThreshold: 125140,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2024: {
        personalAllowance: 12570,
        basicRateThreshold: 37700,
        higherRateThreshold: 125140, // Start of Additional Rate band
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2023: {
        personalAllowance: 12570,
        basicRateThreshold: 37700,
        higherRateThreshold: 125140,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    // Data for 2022 and earlier years follows the same structure.
    2022: {
        personalAllowance: 12570,
        basicRateThreshold: 37700,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2021: {
        personalAllowance: 12570,
        basicRateThreshold: 37700,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2020: {
        personalAllowance: 12500,
        basicRateThreshold: 37500,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2019: {
        personalAllowance: 12500,
        basicRateThreshold: 37500,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2018: {
        personalAllowance: 11850,
        basicRateThreshold: 34500,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    },
    2017: {
        personalAllowance: 11500,
        basicRateThreshold: 33500,
        higherRateThreshold: 150000,
        startingRateSavings: 5000,
        basicRatePSA: 1000,
        higherRatePSA: 500,
        basicRate: 0.2,
        higherRate: 0.4,
        additionalRate: 0.45
    }
};

// Constants defining the types of investment bonds.
const BOND_TYPES = {
    ONSHORE: 'onshore',     // UK-based investment bond
    OFFSHORE: 'offshore'    // Non-UK based investment bond
};

// Global variable to track the ID for the next dynamically added gain.
let nextGainId = 2; // Starts at 2 because gain #1 is hardcoded in HTML.

// DOM elements - variables to hold references to frequently accessed HTML elements.
const addGainButton = document.getElementById('add-gain-button'); // Button to add a new gain input section.
const gainsContainer = document.getElementById('gains-container'); // Container for all gain input sections.
const gainsCounter = document.getElementById('gains-counter'); // Badge displaying the number of gains.
const calculatorForm = document.getElementById('calculator-form');
const resultsContainer = document.getElementById('results-container'); // Container to display calculation results.
const showDetailsCheckbox = document.getElementById('show-details'); // Checkbox to toggle detailed calculation steps.
const detailedCalculations = document.getElementById('detailed-calculations'); // Section for detailed steps.
const individualResults = document.getElementById('individual-results'); // Section for individual gain results (if multiple).
const taxYearSelect = document.getElementById('tax-year-select'); // Dropdown to select the tax year.
const calculationError = document.getElementById('calculation-error');
const calculationStatus = document.getElementById('calculation-status');

// Add event listeners once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    if (addGainButton) addGainButton.addEventListener('click', addGain);
    if (calculatorForm) calculatorForm.addEventListener('submit', handleCalculationSubmit);
    if (gainsContainer) gainsContainer.addEventListener('click', handleGainContainerClick);
    document.addEventListener('input', handleCalculationInput);
    if (showDetailsCheckbox) showDetailsCheckbox.addEventListener('change', toggleDetailedCalculations);
    const printButton = document.getElementById('print-button');
    if (printButton) printButton.addEventListener('click', printResults);
    if (taxYearSelect) taxYearSelect.addEventListener('change', updateTaxYearDisplay);
    updateTaxYearDisplay();
    updateGainsCounter();

    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) backToTopButton.addEventListener('click', scrollToTop);
});

/**
 * Refreshes the tax year text shown in the heading and print report, without touching result visibility.
 */
function updateTaxYearLabels() {
    if (!taxYearSelect) return;
    const selectedYear = Number(taxYearSelect.value);
    const taxYearDisplay = `${selectedYear}/${(selectedYear + 1).toString().slice(2)}`;
    const taxYearSpan = document.querySelector('.tax-year');
    if(taxYearSpan) taxYearSpan.textContent = taxYearDisplay;
    const reportTaxYear = document.getElementById('report-tax-year');
    if(reportTaxYear) reportTaxYear.textContent = taxYearDisplay;
    const reportFooterTaxYear = document.getElementById('report-footer-tax-year');
    if(reportFooterTaxYear) reportFooterTaxYear.textContent = taxYearDisplay;
}

/**
 * Updates the tax year display in the main heading and invalidates results made stale by the change.
 */
function updateTaxYearDisplay() {
    if (!taxYearSelect) return;
    invalidateCalculationResults();
    updateTaxYearLabels();
}

/**
 * Retrieves the tax configuration for the currently selected tax year.
 * @returns {TAX_YEARS.2025} An object containing tax parameters for the selected year.
 *                           The structure matches one of the year entries in `TAX_YEARS`.
 */
function getCurrentTaxYear() {
    if (!taxYearSelect) throw new Error('Tax year selector is missing.');
    const selectedYear = Number(taxYearSelect.value);
    const taxYear = TAX_YEARS[selectedYear];
    if (!taxYear) throw new RangeError('Select a supported tax year.');
    return taxYear;
}

function updateDescribedBy(element, id, add) {
    if (!element) return;
    const describedBy = new Set((element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    if (add) describedBy.add(id);
    else describedBy.delete(id);
    if (describedBy.size) element.setAttribute('aria-describedby', [...describedBy].join(' '));
    else element.removeAttribute('aria-describedby');
}

function clearInputValidation(input) {
    if (!input || !input.checkValidity()) return;
    input.removeAttribute('aria-invalid');
    updateDescribedBy(input, 'calculation-error', false);
    if (calculationError && !document.querySelector('[aria-invalid="true"]')) {
        calculationError.hidden = true;
        calculationError.textContent = '';
    }
}

function clearCalculationError() {
    if (calculationError) {
        calculationError.hidden = true;
        calculationError.textContent = '';
    }
    document.querySelectorAll('[aria-describedby]').forEach(element => updateDescribedBy(element, 'calculation-error', false));
    document.querySelectorAll('.calculation-input[aria-invalid="true"]').forEach(input => input.removeAttribute('aria-invalid'));
}

function invalidateCalculationResults() {
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (individualResults) individualResults.classList.add('hidden');
    if (calculationStatus) calculationStatus.textContent = '';
}

function showCalculationError(message, control = null) {
    if (calculationError) {
        calculationError.textContent = message;
        calculationError.hidden = false;
    }
    if (control) {
        updateDescribedBy(control, 'calculation-error', true);
        control.focus();
    }
    if (calculationStatus) calculationStatus.textContent = '';
}

function validateCalculationInputs() {
    clearCalculationError();
    const invalidInput = [...document.querySelectorAll('.calculation-input')].find(input => !input.checkValidity());
    if (!invalidInput) return true;

    invalidInput.setAttribute('aria-invalid', 'true');
    updateDescribedBy(invalidInput, 'calculation-error', true);
    const label = invalidInput.labels?.[0]?.textContent.trim() || 'Input';
    showCalculationError(`${label}: ${invalidInput.validationMessage || 'Check this value.'}`, invalidInput);
    return false;
}

function handleCalculationInput(event) {
    if (event.target.matches?.('.calculation-input')) {
        clearInputValidation(event.target);
        invalidateCalculationResults();
    }
}

function handleCalculationSubmit(event) {
    event.preventDefault();
    calculateResults();
}

function handleGainContainerClick(event) {
    const removeButton = event.target.closest?.('[data-remove-gain]');
    if (removeButton && gainsContainer.contains(removeButton) && !removeButton.disabled) {
        removeGain(Number(removeButton.dataset.removeGain));
    }
}

/**
 * Adds a new chargeable event gain input section to the form.
 * @param {Event} event - The click event object.
 */
function addGain(event) {
    event?.preventDefault();
    if (!gainsContainer) return;
    clearCalculationError();
    const scrollPosition = window.scrollY; // Preserve scroll position
    const newGain = createGainElement(nextGainId);
    gainsContainer.appendChild(newGain);
    updateGainsCounter();
    invalidateCalculationResults();
    window.scrollTo(0, scrollPosition); // Restore scroll position
    newGain.querySelector('input')?.focus();
    nextGainId++;
}

/**
 * Removes a specific gain input section from the form.
 * @param {number} id - The ID number of the gain section to remove.
 */
function removeGain(id) {
    const gainElement = document.getElementById(`gain-${id}`);
    if (gainElement) {
        const gainIndex = [...document.querySelectorAll('.multi-gain-item')].indexOf(gainElement);
        const scrollPosition = window.scrollY; // Preserve scroll position
        gainElement.remove();
        renumberGains();
        updateGainsCounter();
        invalidateCalculationResults();
        window.scrollTo(0, scrollPosition); // Restore scroll position
        const remainingCount = document.querySelectorAll('.multi-gain-item').length;
        const nextGain = remainingCount ? Math.min(gainIndex + 1, remainingCount) : 0;
        const focusTarget = nextGain ? document.getElementById(`gain-amount-${nextGain}`) : addGainButton;
        focusTarget?.focus();
    }
}

/**
 * Updates the display of the number of current gains.
 */
function updateGainsCounter() {
    const count = document.querySelectorAll('.multi-gain-item').length;
    if (gainsCounter) gainsCounter.textContent = count;
    document.querySelectorAll('.remove-button').forEach(button => {
        button.disabled = count <= 1;
    });
}


/**
 * Renumbers all gain input sections after one is removed to maintain sequential numbering.
 * Updates headings, IDs, and 'for' attributes of labels.
 */
function renumberGains() {
    const gains = document.querySelectorAll('.multi-gain-item');
    gains.forEach((gain, index) => {
        const newNumber = index + 1;
        const heading = gain.querySelector('legend');
        if (heading) heading.textContent = `Chargeable Event Gain #${newNumber}`;
        gain.id = `gain-${newNumber}`;
        
        const inputs = {
            amount: gain.querySelector(`[id^="gain-amount-"]`),
            years: gain.querySelector(`[id^="gain-years-"]`),
            type: gain.querySelector(`[id^="gain-type-"]`)
        };
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) {
                const oldId = inputs[key].id;
                inputs[key].id = `gain-${key}-${newNumber}`;
                const label = gain.querySelector(`label[for="${oldId}"]`); // Find label by old ID
                if(label) label.setAttribute('for', `gain-${key}-${newNumber}`);
            }
        });
        const removeButton = gain.querySelector('.remove-button');
        if (removeButton) {
            removeButton.dataset.removeGain = newNumber;
            removeButton.setAttribute('aria-label', `Remove chargeable event gain ${newNumber}`);
        }
    });
    nextGainId = gains.length + 1; // Ensure next new gain ID is correct
}

/**
 * Toggles the visibility of the detailed calculation steps section based on checkbox state.
 */
function toggleDetailedCalculations() {
    if (!detailedCalculations || !showDetailsCheckbox) return;
    detailedCalculations.classList.toggle('hidden', !showDetailsCheckbox.checked);
}

/**
 * Formats a numeric value as GBP currency.
 * @param {number} value - The number to format.
 * @returns {string} The formatted currency string (e.g., "£1,234.56").
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

/**
 * Creates HTML for a single row in the results display.
 * @param {string} label - The label for the result row.
 * @param {string} value - The value for the result row (already formatted).
 * @param {boolean} [highlight=false] - Whether to apply highlighting to the value.
 * @param {boolean} [negative=false] - Whether to apply negative styling to the value.
 * @returns {string} HTML string for the result row.
 */
function createResultRow(label, value, highlight = false, negative = false) {
    let className = '';
    if (highlight) {
        className = label.includes('Top Slicing Relief') ? 'highlight-green' : 'highlight';
    }
    if (negative) className = 'negative';
    return `<dl class="result-row"><dt class="result-label">${label}</dt><dd class="${className}">${value}</dd></dl>`;
}

/**
 * Calculates Adjusted Net Income (ANI).
 * Note: This is a simplified version. True ANI calculation would deduct items like gross personal pension contributions.
 * @param {number} totalIncome - The total income before any deductions for ANI.
 * @returns {number} The calculated Adjusted Net Income.
 */
function calculateAdjustedNetIncome(totalIncome, grossPensionContributions = 0, grossGiftAidDonations = 0) {
    return Math.max(0, totalIncome - grossPensionContributions - grossGiftAidDonations);
}

/**
 * Determines the applicable Personal Allowance (PA) based on Adjusted Net Income (ANI).
 * PA is reduced by £1 for every £2 of ANI over £100,000.
 * @param {number} adjustedNetIncome - The individual's Adjusted Net Income.
 * @returns {number} The applicable Personal Allowance.
 */
function determinePersonalAllowance(adjustedNetIncome) {
    const TAX_YEAR = getCurrentTaxYear();
    if (adjustedNetIncome <= 100000) return TAX_YEAR.personalAllowance;
    const reduction = Math.floor((adjustedNetIncome - 100000) / 2);
    return Math.max(0, TAX_YEAR.personalAllowance - reduction);
}

/**
 * Determines the applicable Personal Savings Allowance (PSA) based on Adjusted Net Income (ANI).
 * @param {number} adjustedNetIncome - The individual's Adjusted Net Income.
 * @returns {number} The applicable PSA (£1000 for basic rate, £500 for higher rate, £0 for additional rate).
 */
function determinePSA(adjustedNetIncome) {
    const TAX_YEAR = getCurrentTaxYear();
    // Basic rate taxpayer if total income (including PA) is within basic rate band limit + PA
    if (adjustedNetIncome <= (TAX_YEAR.personalAllowance + TAX_YEAR.basicRateThreshold)) return TAX_YEAR.basicRatePSA;
    // Higher rate taxpayer if total income is between end of basic rate band and start of additional rate band
    if (adjustedNetIncome <= TAX_YEAR.higherRateThreshold) return TAX_YEAR.higherRatePSA; 
    return 0; // Additional rate taxpayer
}

/**
 * Determines the available Starting Rate for Savings (SRfS) band.
 * The £5,000 SRfS is reduced by £1 for every £1 of non-savings income above the Personal Allowance.
 * @param {number} nonSavingsIncome - Total non-savings income (e.g., employment, pension).
 * @param {number} personalAllowance - The applicable Personal Allowance.
 * @returns {number} The available Starting Rate for Savings.
 */
function determineStartingRateForSavings(nonSavingsIncome, personalAllowance) {
    const TAX_YEAR = getCurrentTaxYear();
    const nonSavingsAbovePA = Math.max(0, nonSavingsIncome - personalAllowance);
    return Math.max(0, TAX_YEAR.startingRateSavings - nonSavingsAbovePA);
}

function validateGainInputs(amount, years, bondType, requireWholeYears = false) {
    if (!Number.isFinite(amount) || amount < 0) {
        throw new RangeError('Gain amount must be zero or greater.');
    }
    if (!Number.isFinite(years) || years < 1 || (requireWholeYears && !Number.isInteger(years))) {
        throw new RangeError('Complete years must be 1 or greater.');
    }
    if (![BOND_TYPES.ONSHORE, BOND_TYPES.OFFSHORE].includes(bondType)) {
        throw new RangeError('Select a valid bond type.');
    }
}

function validateTaxReliefInputs(grossPensionContributions, grossGiftAidDonations) {
    if (!Number.isFinite(grossPensionContributions) || grossPensionContributions < 0 ||
        !Number.isFinite(grossGiftAidDonations) || grossGiftAidDonations < 0) {
        throw new RangeError('Gross pension contributions and Gift Aid donations must be zero or greater.');
    }
}

/**
 * Calculates how a given bond gain is distributed across various tax allowances and bands.
 * This function considers other income types to determine remaining capacities in allowances/bands.
 * @param {number} earnings - Total non-savings, non-dividend income (e.g., employment, pension).
 * @param {number} otherSavingsIncome - Savings income *excluding* the current bond gain.
 * @param {number} dividendIncome - Dividend income.
 * @param {number} bondGain - The amount of the current bond gain being assessed.
 * @param {number} personalAllowance - The applicable Personal Allowance.
 * @param {number} psa - The applicable Personal Savings Allowance.
 * @param {number} startingRateForSavings - The available Starting Rate for Savings.
 * @param {number} taxBandExtension - Gross relief-at-source pension and Gift Aid amounts extending tax bands.
 * @returns {object} An object detailing the allocation of the bond gain across different tax bands/allowances.
 */
function calculateTaxBands(earnings, otherSavingsIncome, dividendIncome, bondGain, personalAllowance, psa, startingRateForSavings, taxBandExtension = 0) {
    const TAX_YEAR = getCurrentTaxYear();
    // Allocate the Personal Allowance to non-savings income before savings income.
    const nonBondIncomeInPA = Math.min(earnings, personalAllowance);
    let remainingPersonalAllowance = personalAllowance - nonBondIncomeInPA;
    const nonBondIncomeAbovePA = Math.max(0, earnings - personalAllowance);
    
    // How much of basic rate band is used by non-bond income (that's above PA).
    const basicRateBandLimit = TAX_YEAR.basicRateThreshold + taxBandExtension;
    const nonBondIncomeInBasicRate = Math.min(nonBondIncomeAbovePA, basicRateBandLimit);
    
    // How much of higher rate band is used by non-bond income.
    // higherRateThreshold from TAX_YEARS is the start of the additional rate band.
    const higherRateBandSize = TAX_YEAR.higherRateThreshold + taxBandExtension - (personalAllowance + basicRateBandLimit);
    const nonBondIncomeInHigherRate = Math.min(Math.max(0, nonBondIncomeAbovePA - basicRateBandLimit), higherRateBandSize);
    
    // How much of additional rate band is used by non-bond income.
    const nonBondIncomeInAdditionalRate = Math.max(0, nonBondIncomeAbovePA - basicRateBandLimit - higherRateBandSize);
    
    // Remaining capacity in bands for the current bond gain.
    const remainingBasicRateCapacity = Math.max(0, basicRateBandLimit - nonBondIncomeInBasicRate);
    const remainingHigherRateCapacity = Math.max(0, higherRateBandSize - nonBondIncomeInHigherRate);

    // Allocate savings income in order: unused Personal Allowance, SRfS, PSA, then tax bands.
    const otherSavingsInPA = Math.min(otherSavingsIncome, remainingPersonalAllowance);
    remainingPersonalAllowance -= otherSavingsInPA;
    const otherSavingsAfterPA = otherSavingsIncome - otherSavingsInPA;
    const srsUsedByOtherSavings = Math.min(otherSavingsAfterPA, startingRateForSavings);
    const remainingSRFS = startingRateForSavings - srsUsedByOtherSavings;
    const bondGainInPA = Math.min(bondGain, remainingPersonalAllowance);
    remainingPersonalAllowance -= bondGainInPA;
    const bondGainAfterPA = bondGain - bondGainInPA;
    const bondGainInSRSB = Math.min(bondGainAfterPA, remainingSRFS);

    const savingsIncomeNotInSRFS = otherSavingsAfterPA - srsUsedByOtherSavings;
    const psaUsedByOtherSavings = Math.min(savingsIncomeNotInSRFS, psa);
    const remainingPSA = psa - psaUsedByOtherSavings;
    const bondGainInPSA = Math.min(bondGainAfterPA - bondGainInSRSB, remainingPSA);

    // Nil-rate savings still occupy the corresponding basic and higher rate bands.
    const nilRateSavings = srsUsedByOtherSavings + bondGainInSRSB + psaUsedByOtherSavings + bondGainInPSA;
    const nilRateSavingsInBasicRate = Math.min(nilRateSavings, remainingBasicRateCapacity);
    const nilRateSavingsInHigherRate = Math.min(Math.max(0, nilRateSavings - remainingBasicRateCapacity), remainingHigherRateCapacity);
    const basicRateCapacityAfterNilRateSavings = remainingBasicRateCapacity - nilRateSavingsInBasicRate;
    const higherRateCapacityAfterNilRateSavings = remainingHigherRateCapacity - nilRateSavingsInHigherRate;
    
    // Existing taxable savings use the lower bands before the bond gain; dividends follow savings income.
    const taxableOtherSavings = savingsIncomeNotInSRFS - psaUsedByOtherSavings;
    const otherSavingsInBasicRate = Math.min(taxableOtherSavings, basicRateCapacityAfterNilRateSavings);
    const remainingBasicRateAfterSavings = basicRateCapacityAfterNilRateSavings - otherSavingsInBasicRate;
    const otherSavingsInHigherRate = Math.min(Math.max(0, taxableOtherSavings - otherSavingsInBasicRate), higherRateCapacityAfterNilRateSavings);
    const remainingHigherRateAfterSavings = higherRateCapacityAfterNilRateSavings - otherSavingsInHigherRate;

    const taxableBondGain = bondGainAfterPA - bondGainInSRSB - bondGainInPSA;
    const bondGainInBasicRate = Math.min(taxableBondGain, remainingBasicRateAfterSavings);
    const bondGainInHigherRate = Math.min(Math.max(0, taxableBondGain - bondGainInBasicRate), remainingHigherRateAfterSavings);
    const bondGainInAdditionalRate = Math.max(0, taxableBondGain - bondGainInBasicRate - bondGainInHigherRate);
    
    return {
        nonBondIncomeInPA, nonBondIncomeInBasicRate, nonBondIncomeInHigherRate, nonBondIncomeInAdditionalRate,
        bondGainInPA, bondGainInSRSB, bondGainInPSA, bondGainInBasicRate, bondGainInHigherRate, bondGainInAdditionalRate
    };
}

/**
 * Calculates the tax due on different portions of a bond gain, and the tax credit if applicable.
 * @param {string} bondType - Type of bond ('onshore' or 'offshore').
 * @param {number} bondGainInSRSB - Gain amount allocated to Starting Rate for Savings Band.
 * @param {number} bondGainInPSA - Gain amount allocated to Personal Savings Allowance.
 * @param {number} bondGainInBasicRate - Gain amount allocated to Basic Rate band.
 * @param {number} bondGainInHigherRate - Gain amount allocated to Higher Rate band.
 * @param {number} bondGainInAdditionalRate - Gain amount allocated to Additional Rate band.
 * @param {TAX_YEARS.2025} TAX_YEAR - The tax year configuration object.
 * @param {number|null} [totalBondGain=null] - Full gain amount, including any portion covered by allowances.
 * @returns {object} Contains `taxOnBasicRate`, `taxOnHigherRate`, `taxOnAdditionalRate`, `totalTaxOnGain`, 
 *                   and `basicRateTaxTreatedAsPaid` (actual 20% credit on total gain for onshore bonds).
 */
function calculateTaxOnBondGain(bondType, bondGainInSRSB, bondGainInPSA, bondGainInBasicRate, bondGainInHigherRate, bondGainInAdditionalRate, TAX_YEAR, totalBondGain = null) {
    const taxOnBasicRate = bondGainInBasicRate * TAX_YEAR.basicRate;
    const taxOnHigherRate = bondGainInHigherRate * TAX_YEAR.higherRate;
    const taxOnAdditionalRate = bondGainInAdditionalRate * TAX_YEAR.additionalRate;
    const totalTaxOnGain = taxOnBasicRate + taxOnHigherRate + taxOnAdditionalRate;
    // Calculate the total of the gain portions being processed to determine the base for the tax credit.
    const currentBondTotalGain = totalBondGain ?? bondGainInSRSB + bondGainInPSA + bondGainInBasicRate + bondGainInHigherRate + bondGainInAdditionalRate;
    // Basic rate tax is treated as paid on the *total* gain of an onshore bond, not just the part falling in basic rate.
    const basicRateTaxTreatedAsPaid = bondType === BOND_TYPES.ONSHORE ? currentBondTotalGain * TAX_YEAR.basicRate : 0;
    
    return { taxOnBasicRate, taxOnHigherRate, taxOnAdditionalRate, totalTaxOnGain, basicRateTaxTreatedAsPaid };
}

/**
 * Calculates Top Slicing Relief based on HMRC's 5-step process.
 * @param {number} bondGain - The total amount of the chargeable event gain for this specific bond/calculation context.
 * @param {string} bondType - The type of the bond ('onshore' or 'offshore').
 * @param {number} yearsHeld - The number of complete years the bond was held (or the Top Slicing Factor for combined calculations).
 * @param {number} totalNonSavingsIncome - Total non-savings income (e.g., employment, pension).
 * @param {number} savingsIncome - Other savings income (excluding the current `bondGain`).
 * @param {number} dividendIncome - Total dividend income.
 * @param {number|null} [overrideActualTaxCredit=null] - Optional. If provided, this value is used as the actual tax credit 
 *                                                      for the Step 2 liability calculation. Used in combined gain scenarios.
 * @param {number|null} [overrideSliceTaxCredit=null] - Optional onshore treated-as-paid credit for the Step 4 slice.
 * @param {number} [grossPensionContributions=0] - Gross relief-at-source pension contributions.
 * @param {number} [grossGiftAidDonations=0] - Grossed-up Gift Aid donations.
 * @returns {object} An object containing detailed breakdown of the TSR calculation and final results.
 */
function calculateTopSlicingRelief(bondGain, bondType, yearsHeld, totalNonSavingsIncome, savingsIncome, dividendIncome, overrideActualTaxCredit = null, overrideSliceTaxCredit = null, grossPensionContributions = 0, grossGiftAidDonations = 0) {
    validateGainInputs(bondGain, yearsHeld, bondType);
    validateTaxReliefInputs(grossPensionContributions, grossGiftAidDonations);
    const TAX_YEAR = getCurrentTaxYear();
    const taxBandExtension = grossPensionContributions + grossGiftAidDonations;
    
    // Step 1: Calculate total taxable income including the full bond gain.
    const totalIncomeWithGain = totalNonSavingsIncome + savingsIncome + dividendIncome + bondGain;
    const adjustedNetIncome = calculateAdjustedNetIncome(totalIncomeWithGain, grossPensionContributions, grossGiftAidDonations);
    const personalAllowance = determinePersonalAllowance(adjustedNetIncome);
    const psa = determinePSA(adjustedNetIncome);
    const startingRateForSavings = determineStartingRateForSavings(totalNonSavingsIncome, personalAllowance);
    
    // Determine how the full bond gain is taxed.
    const taxBands = calculateTaxBands(totalNonSavingsIncome, savingsIncome, dividendIncome, bondGain, personalAllowance, psa, startingRateForSavings, taxBandExtension);
    
    // Calculate gross tax on the full bond gain and any applicable actual tax credit.
    const taxOnBondGainResult = calculateTaxOnBondGain(bondType, taxBands.bondGainInSRSB, taxBands.bondGainInPSA, taxBands.bondGainInBasicRate, taxBands.bondGainInHigherRate, taxBands.bondGainInAdditionalRate, TAX_YEAR, bondGain);
    
    // Step 2: Determine the liability for the tax year on the gain.
    // Use override if provided (for combined gains), otherwise use the credit calculated for this specific bond.
    const actualTaxCreditToUse = (typeof overrideActualTaxCredit === 'number') ? overrideActualTaxCredit : taxOnBondGainResult.basicRateTaxTreatedAsPaid;
    const liabilityForTaxYear = Math.max(0, taxOnBondGainResult.totalTaxOnGain - actualTaxCreditToUse);
    // HMRC applies this notional deduction to foreign-policy gains within TSR, but it is not an actual tax credit.
    const tsrBasicRateDeduction = bondGain * TAX_YEAR.basicRate;
    const liabilityForTaxYearForTSR = Math.max(0, taxOnBondGainResult.totalTaxOnGain - tsrBasicRateDeduction);
    
    // Step 3: Calculate the annual equivalent ("slice") of the gain.
    const annualEquivalent = bondGain / Math.max(1, yearsHeld); // Ensure yearsHeld is at least 1.
    
    // Step 4: Calculate tax liability on the "slice".
    // Recalculate allowances based on income including only the slice.
    const totalIncomeWithSlice = totalNonSavingsIncome + savingsIncome + dividendIncome + annualEquivalent;
    const sliceAdjustedNetIncome = calculateAdjustedNetIncome(totalIncomeWithSlice, grossPensionContributions, grossGiftAidDonations);
    const selectedTaxYear = Number(taxYearSelect.value);
    const slicePersonalAllowance = selectedTaxYear >= 2018 ? determinePersonalAllowance(sliceAdjustedNetIncome) : personalAllowance;
    const slicePsa = selectedTaxYear >= 2021 ? determinePSA(sliceAdjustedNetIncome) : psa;
    const sliceStartingRateForSavings = selectedTaxYear >= 2021
        ? determineStartingRateForSavings(totalNonSavingsIncome, slicePersonalAllowance)
        : startingRateForSavings;
    
    // Determine how the slice is taxed.
    const sliceTaxBands = calculateTaxBands(totalNonSavingsIncome, savingsIncome, dividendIncome, annualEquivalent, slicePersonalAllowance, slicePsa, sliceStartingRateForSavings, taxBandExtension);
    
    // Calculate gross tax on the slice. For TSR Step 4, the type is effectively treated as if no prior credit (like offshore).
    const taxOnSliceResult = calculateTaxOnBondGain(BOND_TYPES.OFFSHORE, sliceTaxBands.bondGainInSRSB, sliceTaxBands.bondGainInPSA, sliceTaxBands.bondGainInBasicRate, sliceTaxBands.bondGainInHigherRate, sliceTaxBands.bondGainInAdditionalRate, TAX_YEAR);
    
    // Basic rate tax is treated as paid on onshore gains only.
    const sliceBasicRateTaxTreatedAsPaid = typeof overrideSliceTaxCredit === 'number'
        ? overrideSliceTaxCredit
        : (bondType === BOND_TYPES.ONSHORE ? annualEquivalent * TAX_YEAR.basicRate : 0);
    const sliceTsrBasicRateDeduction = annualEquivalent * TAX_YEAR.basicRate;
    const liabilityOnSlice = Math.max(0, taxOnSliceResult.totalTaxOnGain - sliceTsrBasicRateDeduction);
    const reliefedLiability = liabilityOnSlice * yearsHeld; // Multiply by N years/factor.
    
    // Step 5: Calculate Top Slicing Relief.
    const topSlicingRelief = Math.max(0, liabilityForTaxYearForTSR - reliefedLiability);
    
    // Calculate final tax liability on the gain after TSR.
    const finalLiability = Math.max(0, liabilityForTaxYear - topSlicingRelief);
    
    return {
        totalIncome: totalIncomeWithGain, adjustedNetIncome, personalAllowance, psa, startingRateForSavings,
        taxBands, taxOnBondGain: taxOnBondGainResult, basicRateTaxTreatedAsPaid: actualTaxCreditToUse, 
        liabilityForTaxYear, tsrBasicRateDeduction, liabilityForTaxYearForTSR, annualEquivalent, sliceAdjustedNetIncome, slicePersonalAllowance, slicePsa, 
        sliceStartingRateForSavings, sliceTaxBands, taxOnSlice: taxOnSliceResult, 
        sliceBasicRateTaxTreatedAsPaid, sliceTsrBasicRateDeduction,
        liabilityOnSlice, reliefedLiability, topSlicingRelief, finalLiability, bondType 
    };
}

/**
 * Processes multiple bond gains, calculates individual TSR for each, and a combined TSR.
 * @param {Array<object>} gains - An array of gain objects, each with `amount`, `type`, and `years`.
 * @param {object} incomes - Income amounts plus optional gross pension and Gift Aid relief amounts.
 * @returns {object} An object containing results for individual gains and the combined scenario.
 */
function calculateMultipleGains(gains, incomes) { 
    gains.forEach(gain => validateGainInputs(gain.amount, gain.years, gain.type, true));
    const grossPensionContributions = incomes.grossPensionContributions ?? 0;
    const grossGiftAidDonations = incomes.grossGiftAidDonations ?? 0;
    validateTaxReliefInputs(grossPensionContributions, grossGiftAidDonations);
    // Calculate total gain amount across all input gains.
    const totalGain = gains.reduce((sum, gain) => sum + gain.amount, 0);
    // Calculate sum of annual equivalents for all gains.
    const combinedAnnualEquivalent = gains.reduce((sum, gain) => sum + gain.amount / Math.max(1, gain.years), 0);
    // Determine the Top Slicing Factor (N) for the combined calculation.
    // If totalGain or combinedAnnualEquivalent is 0, default to years of first gain or 1 to prevent division by zero/NaN.
    const topSlicingFactor = totalGain > 0 && combinedAnnualEquivalent > 0 ? totalGain / combinedAnnualEquivalent : Math.max(1, (gains[0] ? gains[0].years : 1));

    // Calculate TSR individually for each gain.
    // This is primarily for display and to correctly sum actual tax credits.
    const individualCalculations = gains.map(gain => 
        calculateTopSlicingRelief(gain.amount, gain.type, gain.years, incomes.totalNonSavingsIncome, incomes.savingsIncome, incomes.dividendIncome, null, null, grossPensionContributions, grossGiftAidDonations)
    );

    // Sum the actual tax credits from all onshore bonds (calculated individually).
    // This sum will be used as an override for the combined TSR calculation.
    const totalActualOnshoreCredit = individualCalculations.reduce((sum, calcData) => {
        // calcData.basicRateTaxTreatedAsPaid from individual calculation correctly reflects the credit for that bond.
        return sum + calcData.basicRateTaxTreatedAsPaid;
    }, 0);
    const totalOnshoreSliceCredit = gains.reduce((sum, gain) => {
        return sum + (gain.type === BOND_TYPES.ONSHORE ? gain.amount / Math.max(1, gain.years) * getCurrentTaxYear().basicRate : 0);
    }, 0);
    
    // Calculate combined TSR.
    // Pass BOND_TYPES.OFFSHORE so calculateTaxOnBondGain returns 0 for its internal credit calculation,
    // allowing the summed totalActualOnshoreCredit to be the definitive credit applied.
    const combinedResultData = calculateTopSlicingRelief(totalGain, BOND_TYPES.OFFSHORE, topSlicingFactor, incomes.totalNonSavingsIncome, incomes.savingsIncome, incomes.dividendIncome, totalActualOnshoreCredit, totalOnshoreSliceCredit, grossPensionContributions, grossGiftAidDonations);
    
    return { gains, totalGain, combinedAnnualEquivalent, topSlicingFactor, individualResults: individualCalculations, combinedResult: combinedResultData };
}

/**
 * Main function to orchestrate the collection of input data, trigger calculations, and display results.
 */
function calculateResults() {
    console.log('Calculating results...'); // For debugging
    try {
        invalidateCalculationResults();
        if (!validateCalculationInputs()) return;
        clearCalculationError();
        if (calculationStatus) calculationStatus.textContent = '';

        // Gather income data from form inputs.
        const employmentIncome = Number(document.getElementById('employment').value) || 0;
        const pensionIncome = Number(document.getElementById('pension').value) || 0;
        const otherNonSavingsIncomeValue = Number(document.getElementById('other-income').value) || 0; 
        const savingsIncomeValue = Number(document.getElementById('savings-income').value) || 0; 
        const dividendIncomeValue = Number(document.getElementById('dividend-income').value) || 0; 
        const grossPensionContributions = Number(document.getElementById('gross-pension-contributions').value) || 0;
        const grossGiftAidDonations = Number(document.getElementById('gross-gift-aid-donations').value) || 0;
        const totalNonSavingsIncomeValue = employmentIncome + pensionIncome + otherNonSavingsIncomeValue; 
        
        // Gather data for each chargeable event gain.
        const gainsData = []; 
        const gainElements = document.querySelectorAll('.multi-gain-item');
        gainElements.forEach((element) => {
            const id = element.id.split('-')[1];
            const amount = Number(document.getElementById(`gain-amount-${id}`).value);
            const years = Number(document.getElementById(`gain-years-${id}`).value);
            const type = document.getElementById(`gain-type-${id}`).value;
            gainsData.push({ id, amount, years, type });
        });
        
        // Handle case where no gains are entered.
        if (gainsData.length === 0 && resultsContainer) {
            showCalculationError('Please add at least one chargeable event gain before calculating.', addGainButton);
            return; 
        }
        
        // Prepare income object for calculation functions.
        const incomesForCalc = { totalNonSavingsIncome: totalNonSavingsIncomeValue, savingsIncome: savingsIncomeValue, dividendIncome: dividendIncomeValue, grossPensionContributions, grossGiftAidDonations };
        // Perform the main TSR calculation for potentially multiple gains.
        const resultsData = calculateMultipleGains(gainsData, incomesForCalc); 
        
        // Display the calculated results.
        displayResults(resultsData, { employmentIncome, pensionIncome, otherNonSavingsIncome: otherNonSavingsIncomeValue, totalNonSavingsIncome: totalNonSavingsIncomeValue, savingsIncome: savingsIncomeValue, dividendIncome: dividendIncomeValue, grossPensionContributions, grossGiftAidDonations });
        if (calculationStatus) {
            calculationStatus.textContent = `Calculation complete. Top Slicing Relief is ${formatCurrency(resultsData.combinedResult.topSlicingRelief)}. Final tax liability is ${formatCurrency(resultsData.combinedResult.finalLiability)}.`;
        }
        
        // Manage UI visibility.
        if(resultsContainer) resultsContainer.classList.remove('hidden');
        toggleDetailedCalculations(); // Handles visibility of detailed steps based on checkbox.
        
        if(individualResults) { // Handles visibility of individual gain results section.
            if (gainsData.length > 1) {
                individualResults.classList.remove('hidden');
            } else {
                individualResults.classList.add('hidden');
            }
        }
        if (resultsContainer) resultsContainer.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } catch (error) {
        console.error('Calculation error:', error);
        if (error instanceof RangeError) {
            showCalculationError(error.message);
            return;
        }
        showCalculationError('The calculation could not be completed. Check the entries and try again.');
    }
}

/**
 * Prepares the page for printing by ensuring all relevant sections are visible and then triggers the browser's print dialog.
 * Restores previous visibility state of detailed sections after printing.
 */
function printResults() {
    updateTaxYearLabels();
    const now = new Date();
    const reportDateElem = document.getElementById('report-date');
    if (reportDateElem) {
        reportDateElem.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    // Temporarily show detailed sections for printing if they exist.
    if(detailedCalculations) detailedCalculations.classList.remove('hidden');
    const gainElementsCount = document.querySelectorAll('.multi-gain-item').length;
    if (gainElementsCount > 1 && individualResults) {
        individualResults.classList.remove('hidden');
    }
    
    window.print(); // Trigger browser print.
    
    // Restore visibility based on user's preference after print dialog closes.
    if (showDetailsCheckbox && !showDetailsCheckbox.checked && detailedCalculations) {
        detailedCalculations.classList.add('hidden');
    }
    if (gainElementsCount <= 1 && individualResults) { // Hide individual results if not applicable.
        individualResults.classList.add('hidden');
    }
}

/**
 * Renders the calculation results into the HTML.
 * @param {object} results - The main results object from `calculateMultipleGains`.
 * @param {object} incomes - The original income inputs for display purposes.
 */
function displayResults(results, incomes) { 
    const { gains, totalGain, combinedAnnualEquivalent, topSlicingFactor, individualResults: indResults, combinedResult } = results;
    const { employmentIncome, pensionIncome, otherNonSavingsIncome, totalNonSavingsIncome, savingsIncome, dividendIncome, grossPensionContributions = 0, grossGiftAidDonations = 0 } = incomes;
    
    let summaryHTML = '<h3>Total Results Summary</h3>';
    
    if (gains.length > 1) {
        summaryHTML += `<p>Combined results for ${gains.length} chargeable event gains:</p>${createResultRow('Total Gain:', formatCurrency(totalGain))}${createResultRow('Combined Annual Equivalent:', formatCurrency(combinedAnnualEquivalent))}${createResultRow('Top Slicing Factor (N):', topSlicingFactor.toFixed(2) + ' years')}`;
    } else if (gains.length === 1) {
        const gain = gains[0];
        summaryHTML += `<p>${gain.type.charAt(0).toUpperCase() + gain.type.slice(1)} bond held for ${gain.years} complete years:</p>`;
    } else { 
        summaryHTML += '<p>No gain information to display.</p>';
        if(document.getElementById('results-summary')) document.getElementById('results-summary').innerHTML = summaryHTML;
        if(document.getElementById('tax-bands-results')) document.getElementById('tax-bands-results').innerHTML = ''; 
        for (let i = 1; i <= 5; i++) { // Clear detailed step sections
            const stepElem = document.getElementById(`step${i}-results`);
            if (stepElem) stepElem.innerHTML = '';
        }
        return;
    }
    
    // Main summary rows
    summaryHTML += `${createResultRow('Total Non-Savings Income:', formatCurrency(totalNonSavingsIncome))}${createResultRow('Savings Income (Other):', formatCurrency(savingsIncome))}${createResultRow('Dividend Income:', formatCurrency(dividendIncome))}${createResultRow('Gross Relief-at-Source Pension Contributions:', formatCurrency(grossPensionContributions))}${createResultRow('Grossed-up Gift Aid Donations:', formatCurrency(grossGiftAidDonations))}${createResultRow('Total Income (incl. this gain):', formatCurrency(combinedResult.totalIncome))}${createResultRow('Adjusted Net Income:', formatCurrency(combinedResult.adjustedNetIncome))}${createResultRow('Personal Allowance:', formatCurrency(combinedResult.personalAllowance))}${createResultRow('Tax on Gain (Gross):', formatCurrency(combinedResult.taxOnBondGain.totalTaxOnGain))}${createResultRow('Basic Rate Tax Treated as Paid (Actual):', formatCurrency(combinedResult.basicRateTaxTreatedAsPaid))}${createResultRow('Actual Liability for Tax Year:', formatCurrency(combinedResult.liabilityForTaxYear))}${createResultRow('Notional Basic Rate Deduction for TSR:', formatCurrency(combinedResult.tsrBasicRateDeduction))}${createResultRow('Liability Used in TSR Calculation:', formatCurrency(combinedResult.liabilityForTaxYearForTSR))}${createResultRow('Top Slicing Relief:', formatCurrency(combinedResult.topSlicingRelief), true)}${createResultRow('Final Tax Liability:', formatCurrency(combinedResult.finalLiability), true)}`;
    
    // Notes on bond types and tax credits
    if (gains.length > 0) {
        const bondTypes = new Set(gains.map(g => g.type));
        let bondTypeDisplayMessage;
        let noteMessage = '';

        if (gains.length > 1) {
            bondTypeDisplayMessage = bondTypes.size > 1 ? "Mixed Onshore/Offshore" : (gains[0].type.charAt(0).toUpperCase() + gains[0].type.slice(1));
            summaryHTML += `${createResultRow('Bond Types (Overall):', bondTypeDisplayMessage)}`;
            noteMessage = combinedResult.basicRateTaxTreatedAsPaid > 0 ? `Actual onshore tax credits totalling ${formatCurrency(combinedResult.basicRateTaxTreatedAsPaid)} reduce the tax payable. A notional basic-rate deduction is used for all gains in the TSR calculation.` : 'There is no actual onshore tax credit. A notional basic-rate deduction is used for all gains in the TSR calculation.';
        } else { // Single gain
            const type = gains[0].type;
            bondTypeDisplayMessage = type.charAt(0).toUpperCase() + type.slice(1);
            summaryHTML += `${createResultRow('Bond Type:', bondTypeDisplayMessage)}`;
            noteMessage = type === BOND_TYPES.ONSHORE ? `A ${formatCurrency(combinedResult.basicRateTaxTreatedAsPaid)} actual tax credit has been applied for this onshore bond.` : 'No actual basic-rate tax credit is treated as paid on this offshore bond. HMRC uses a notional basic-rate deduction only within the TSR calculation.';
        }
        summaryHTML += `${createResultRow('Note on Tax Credits:', noteMessage)}`;

        // Warning for large offshore or mixed gains
        const hasLargeOffshoreGain = gains.some(g => g.type === BOND_TYPES.OFFSHORE && g.amount > 100000);
        const currentTaxYearKey = taxYearSelect.value; 
        const currentTaxYearData = TAX_YEARS[currentTaxYearKey];
        
        let showOffshoreWarning = false;
        if (gains.length === 1 && gains[0].type === BOND_TYPES.OFFSHORE && totalGain > 100000) {
            showOffshoreWarning = true;
        } else if (gains.length > 1 && currentTaxYearData) { 
            if (hasLargeOffshoreGain) { 
                showOffshoreWarning = true;
            } else if (bondTypes.has(BOND_TYPES.OFFSHORE) && totalGain > 100000 && combinedResult.basicRateTaxTreatedAsPaid < (totalGain * currentTaxYearData.basicRate)) {
                 showOffshoreWarning = true;
            }
        }

        if (showOffshoreWarning) {
             summaryHTML += `<div class="warning-box"><p><strong>Offshore/Mixed Bond High Gain Warning:</strong> The total gain includes significant offshore components or is a large mixed gain (${formatCurrency(totalGain)}) where full initial UK tax might not have been paid on all portions. This may lead to higher tax liabilities. Consider seeking professional tax advice.</p></div>`;
        }
    }

    summaryHTML += '<p class="tax-disclaimer">This tool provides estimates based on standard HMRC Top Slicing Relief rules. It does not constitute formal financial or tax advice. For complex tax affairs, consult a qualified CTA (Chartered Tax Adviser).</p>';
    
    if(document.getElementById('results-summary')) document.getElementById('results-summary').innerHTML = summaryHTML;
    
    // Tax Bands Table for the Gain
    let taxBandsHTML = `<div class="table-container" role="region" aria-label="Chargeable event gain tax band allocation" tabindex="0"><table class="result-table"><caption class="sr-only">Tax amounts assigned to each allowance and tax band</caption><thead><tr><th scope="col">Band (for the Gain)</th><th scope="col" class="amount">Amount</th><th scope="col" class="tax">Tax</th></tr></thead><tbody>`;
    if (combinedResult.taxBands.bondGainInPA > 0) taxBandsHTML += `<tr><td>Personal Allowance (0%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInPA)}</td><td class="tax">${formatCurrency(0)}</td></tr>`;
    if (combinedResult.taxBands.bondGainInSRSB > 0) taxBandsHTML += `<tr><td>Starting Rate for Savings Band (0%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInSRSB)}</td><td class="tax">${formatCurrency(0)}</td></tr>`;
    if (combinedResult.taxBands.bondGainInPSA > 0) taxBandsHTML += `<tr><td>Personal Savings Allowance (0%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInPSA)}</td><td class="tax">${formatCurrency(0)}</td></tr>`;
    if (combinedResult.taxBands.bondGainInBasicRate > 0) taxBandsHTML += `<tr><td>Basic Rate (20%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInBasicRate)}</td><td class="tax">${formatCurrency(combinedResult.taxOnBondGain.taxOnBasicRate)}</td></tr>`;
    if (combinedResult.taxBands.bondGainInHigherRate > 0) taxBandsHTML += `<tr><td>Higher Rate (40%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInHigherRate)}</td><td class="tax">${formatCurrency(combinedResult.taxOnBondGain.taxOnHigherRate)}</td></tr>`;
    if (combinedResult.taxBands.bondGainInAdditionalRate > 0) taxBandsHTML += `<tr><td>Additional Rate (45%)</td><td class="amount">${formatCurrency(combinedResult.taxBands.bondGainInAdditionalRate)}</td><td class="tax">${formatCurrency(combinedResult.taxOnBondGain.taxOnAdditionalRate)}</td></tr>`;
    taxBandsHTML += `<tr class="total"><td>Total Gain Portions</td><td class="amount">${formatCurrency(totalGain)}</td><td class="tax">${formatCurrency(combinedResult.taxOnBondGain.totalTaxOnGain)}</td></tr></tbody></table></div>`;
    if(document.getElementById('tax-bands-results')) document.getElementById('tax-bands-results').innerHTML = taxBandsHTML;
    
    // Detailed 5-Step Calculation Breakdown
    let step1HTML = `<h4 class="step-heading">Step 1: Calculate total taxable income for the year (including full gain)</h4><p>Identify how much of the gain falls within the Personal Allowance (PA), Starting Rate for Savings Band (SRSB), Personal Savings Allowance (PSA), and basic, higher or additional rate bands.</p>${createResultRow('Earnings (Non-Savings):', formatCurrency(employmentIncome + pensionIncome + otherNonSavingsIncome))}${createResultRow('Savings Income (Other):', formatCurrency(savingsIncome))}${createResultRow('Dividend Income:', formatCurrency(dividendIncome))}${createResultRow('Gross Relief-at-Source Pension Contributions:', formatCurrency(grossPensionContributions))}${createResultRow('Grossed-up Gift Aid Donations:', formatCurrency(grossGiftAidDonations))}${createResultRow('Chargeable Event Gain (Full):', formatCurrency(totalGain))}${createResultRow('Total Income (incl. this gain):', formatCurrency(combinedResult.totalIncome))}${createResultRow('Adjusted Net Income:', formatCurrency(combinedResult.adjustedNetIncome))}${createResultRow('Personal Allowance:', formatCurrency(combinedResult.personalAllowance))}${createResultRow('Personal Savings Allowance:', formatCurrency(combinedResult.psa))}${createResultRow('Starting Rate for Savings Band:', formatCurrency(combinedResult.startingRateForSavings))}`;
    if(document.getElementById('step1-results')) document.getElementById('step1-results').innerHTML = step1HTML;
    
    let step2HTML = `<h4 class="step-heading">Step 2: Calculate the total tax due on the gain across all tax bands</h4><p>Actual tax treated as paid applies to onshore bonds. For TSR, HMRC also requires a notional basic-rate deduction for offshore gains.</p>${createResultRow('Tax at Basic Rate (on gain portions):', formatCurrency(combinedResult.taxOnBondGain.taxOnBasicRate))}${createResultRow('Tax at Higher Rate (on gain portions):', formatCurrency(combinedResult.taxOnBondGain.taxOnHigherRate))}${createResultRow('Tax at Additional Rate (on gain portions):', formatCurrency(combinedResult.taxOnBondGain.taxOnAdditionalRate))}${createResultRow('Total Gross Tax on Gain:', formatCurrency(combinedResult.taxOnBondGain.totalTaxOnGain))}${createResultRow('Basic Rate Tax Treated as Paid (Actual):', formatCurrency(combinedResult.basicRateTaxTreatedAsPaid))}${createResultRow('Actual Liability for Tax Year:', formatCurrency(combinedResult.liabilityForTaxYear))}${createResultRow('Notional Basic Rate Deduction for TSR:', formatCurrency(combinedResult.tsrBasicRateDeduction))}${createResultRow('Liability Used in TSR Calculation:', formatCurrency(combinedResult.liabilityForTaxYearForTSR))}`;
    if(document.getElementById('step2-results')) document.getElementById('step2-results').innerHTML = step2HTML;
    
    let step3HTML = `<h4 class="step-heading">Step 3: Calculate the annual equivalent of the gain (the "slice")</h4><p>The annual equivalent is calculated by dividing the gain by N (the number of complete years, or the Top Slicing Factor for multiple gains).</p>`;
    if (gains.length > 1) {
        step3HTML += `<div class="info-card"><p>For multiple gains, we calculate each annual equivalent separately, sum them, and then derive a weighted Top Slicing Factor (N):</p><div class="table-container" role="region" aria-label="Annual equivalent for each chargeable event gain" tabindex="0"><table class="result-table"><caption class="sr-only">Gains, complete years, and annual equivalents used in the aggregate calculation</caption><thead><tr><th scope="col">Gain</th><th scope="col" class="amount">Amount</th><th scope="col">Complete Years</th><th scope="col" class="amount">Annual Equivalent</th></tr></thead><tbody>`;
        gains.forEach((gain, index) => {
            const annualEquivalent = gain.amount / Math.max(1, gain.years);
            step3HTML += `<tr><td>Gain #${index + 1} (${gain.type})</td><td class="amount">${formatCurrency(gain.amount)}</td><td>${gain.years}</td><td class="amount">${formatCurrency(annualEquivalent)}</td></tr>`;
        });
        step3HTML += `<tr class="total"><td>Combined</td><td class="amount">${formatCurrency(totalGain)}</td><td>${topSlicingFactor.toFixed(2)} (Factor N)</td><td class="amount">${formatCurrency(combinedAnnualEquivalent)} (Sum of Slices)</td></tr></tbody></table></div></div>`;
    }
    step3HTML += `${createResultRow('Chargeable Event Gain (Full):', formatCurrency(totalGain))}${createResultRow('Complete Years (N or Factor):', gains.length > 1 ? topSlicingFactor.toFixed(2) : (gains[0] ? gains[0].years : 1))}${createResultRow('Annual Equivalent (Slice):', formatCurrency(combinedResult.annualEquivalent))}`;
    if(document.getElementById('step3-results')) document.getElementById('step3-results').innerHTML = step3HTML;
    
    let step4HTML = `<h4 class="step-heading">Step 4: Calculate the individual's liability to tax on the annual equivalent (the "slice")</h4><p>For gains arising from the 2018/19 tax year onwards, the personal allowance is recalculated. For gains arising from 2021/22 onwards, the SRSB and PSA are also recalculated based on income including only the slice. Actual onshore credit is shown separately from the notional deduction used for TSR.</p>${createResultRow('Slice Adjusted Net Income:', formatCurrency(combinedResult.sliceAdjustedNetIncome))}${createResultRow('Slice Personal Allowance:', formatCurrency(combinedResult.slicePersonalAllowance))}${createResultRow('Slice PSA:', formatCurrency(combinedResult.slicePsa))}${createResultRow('Slice Starting Rate for Savings:', formatCurrency(combinedResult.sliceStartingRateForSavings))}${createResultRow('Gross Tax on Slice:', formatCurrency(combinedResult.taxOnSlice.totalTaxOnGain))}${createResultRow('Basic Rate Tax Treated as Paid on Slice (Actual):', formatCurrency(combinedResult.sliceBasicRateTaxTreatedAsPaid))}${createResultRow('Notional Basic Rate Deduction for TSR:', formatCurrency(combinedResult.sliceTsrBasicRateDeduction))}${createResultRow('Liability on Slice Used for TSR:', formatCurrency(combinedResult.liabilityOnSlice))}${createResultRow(`Relieved Liability (Liability on Slice × N):`, formatCurrency(combinedResult.reliefedLiability))}`;
    if(document.getElementById('step4-results')) document.getElementById('step4-results').innerHTML = step4HTML;
    
    let step5HTML = `<h4 class="step-heading">Step 5: Calculate the top slicing relief</h4><p>Deduct the relieved liability at step 4 from the liability used in the TSR calculation at step 2. The relief is then deducted from the actual tax liability.</p>${createResultRow('Liability Used in TSR Calculation (from Step 2):', formatCurrency(combinedResult.liabilityForTaxYearForTSR))}${createResultRow('Relieved Liability (from Step 4):', formatCurrency(combinedResult.reliefedLiability))}${createResultRow('Top Slicing Relief:', formatCurrency(combinedResult.topSlicingRelief), true)}${createResultRow('Actual Tax Liability Before TSR:', formatCurrency(combinedResult.liabilityForTaxYear))}${createResultRow('Final Tax Liability (Actual Liability - TSR):', formatCurrency(combinedResult.finalLiability), true)}`;
    if(document.getElementById('step5-results')) document.getElementById('step5-results').innerHTML = step5HTML;
    
    // Display individual gain calculation summaries if multiple gains were processed.
    if (gains.length > 1 && indResults && document.getElementById('individual-results-container')) { 
        let individualHTML = '';
        indResults.forEach((result, index) => { 
            const gain = gains[index]; 
            individualHTML += `<article class="individual-gain-card card"><div class="gain-summary"><span class="gain-number" aria-hidden="true">${index + 1}</span><h4 class="individual-gain-heading">${formatCurrency(gain.amount)} <span class="bond-type-badge ${gain.type}">${gain.type.charAt(0).toUpperCase() + gain.type.slice(1)}</span></h4></div>${createResultRow('Complete Years:', gain.years)}${createResultRow('Annual Equivalent:', formatCurrency(result.annualEquivalent))}${createResultRow('Tax on Gain (Gross):', formatCurrency(result.taxOnBondGain.totalTaxOnGain))}${createResultRow('Basic Rate Tax Treated as Paid (Actual):', formatCurrency(result.basicRateTaxTreatedAsPaid))}${createResultRow('Actual Liability for Tax Year:', formatCurrency(result.liabilityForTaxYear))}${createResultRow('Liability Used in TSR Calculation:', formatCurrency(result.liabilityForTaxYearForTSR))}${createResultRow('Top Slicing Relief:', formatCurrency(result.topSlicingRelief), true)}${createResultRow('Final Tax Liability:', formatCurrency(result.finalLiability), true)}</article>`;
        });
        document.getElementById('individual-results-container').innerHTML = individualHTML;
    }
}

/**
 * Creates the HTML structure for a new chargeable event gain input section.
 * @param {number} id - The unique ID for the new gain section.
 * @returns {HTMLElement} The newly created div element containing the form fields for a gain.
 */
function createGainElement(id) {
    const gainDiv = document.createElement('fieldset');
    gainDiv.className = 'multi-gain-item';
    gainDiv.id = `gain-${id}`;
    gainDiv.innerHTML = `<legend>Chargeable Event Gain #${id}</legend><button type="button" class="button remove-button no-print" data-remove-gain="${id}" aria-label="Remove chargeable event gain ${id}">Remove</button><div class="grid"><div class="form-group"><label for="gain-amount-${id}">Gain Amount (£)</label><input class="calculation-input" type="number" id="gain-amount-${id}" value="0" min="0" step="0.01" required aria-describedby="gain-help"></div><div class="form-group"><label for="gain-years-${id}">Complete Years</label><input class="calculation-input" type="number" id="gain-years-${id}" value="1" min="1" step="1" required aria-describedby="years-help"></div><div class="form-group"><label for="gain-type-${id}">Bond Type</label><select class="calculation-input" id="gain-type-${id}"><option value="onshore" selected>Onshore</option><option value="offshore">Offshore</option></select></div></div>`;
    return gainDiv;
}

/**
 * Scrolls the window to the top of the page smoothly.
 * Includes a fallback for browsers that do not support smooth scrolling.
 */
function scrollToTop() {
    if (prefersReducedMotion()) {
        window.scrollTo(0, 0);
        return;
    }
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Basic fallback for browsers that don't support smooth scrolling
        const scrollStep = -window.scrollY / (500 / 15); // Approximate 500ms duration
        function scroll() {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
                requestAnimationFrame(scroll);
            }
        }
        requestAnimationFrame(scroll);
    }
}

function prefersReducedMotion() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
