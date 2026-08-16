import { describe, expect, it } from "vitest";
import { assertCreditAmount } from "./credits";
import { normalizePhoneNumber } from "./whatsapp-otp";

describe("validations métier AfroMuse", () => {
  it("accepte uniquement les montants de crédits entiers positifs", () => {
    expect(() => assertCreditAmount(1)).not.toThrow();
    expect(() => assertCreditAmount(0)).toThrow("Montant de crédits invalide");
    expect(() => assertCreditAmount(-10)).toThrow("Montant de crédits invalide");
    expect(() => assertCreditAmount(2.5)).toThrow("Montant de crédits invalide");
  });

  it("normalise un numéro WhatsApp international et rejette les formats ambigus", () => {
    expect(normalizePhoneNumber("+225 01 02 03 04 05")).toBe("+2250102030405");
    expect(() => normalizePhoneNumber("0102030405")).toThrow("Numéro WhatsApp invalide");
  });
});
