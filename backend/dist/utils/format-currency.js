"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCents = convertToCents;
exports.convertToDollarUnit = convertToDollarUnit;
exports.formatCurrency = formatCurrency;
// Convert dollars to cents when saving
function convertToCents(amount) {
    return Math.round(amount * 100);
}
// Convert cents to dollars when retrieving
//convertFromCents
function convertToDollarUnit(amount) {
    return amount / 100;
}
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}
