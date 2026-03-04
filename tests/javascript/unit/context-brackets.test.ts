/**
 * Unit tests for context-brackets.ts
 * 
 * Tests verify context bracket classification, rule selection,
 * and CRITICAL warning behavior work correctly.
 */

import {
  getContextBracket,
  getRulesBracket,
  computeContextBracketData,
  parseContextFile,
  selectBracketRules,
  formatCriticalWarning,
  formatContextBracketHeader,
  ContextBracket,
  ContextBracketData,
} from "../../../src/carl/context-brackets";

describe("context-brackets.ts", () => {
  describe("getContextBracket", () => {
    // Tests for bracket classification from percentage

    it("should return FRESH for null percentage (unknown)", () => {
      expect(getContextBracket(null)).toBe("FRESH");
    });

    it("should return FRESH for >= 60% remaining", () => {
      expect(getContextBracket(60)).toBe("FRESH");
      expect(getContextBracket(70)).toBe("FRESH");
      expect(getContextBracket(80)).toBe("FRESH");
      expect(getContextBracket(100)).toBe("FRESH");
    });

    it("should return MODERATE for >= 40% and < 60%", () => {
      expect(getContextBracket(40)).toBe("MODERATE");
      expect(getContextBracket(50)).toBe("MODERATE");
      expect(getContextBracket(59)).toBe("MODERATE");
    });

    it("should return DEPLETED for >= 25% and < 40%", () => {
      expect(getContextBracket(25)).toBe("DEPLETED");
      expect(getContextBracket(30)).toBe("DEPLETED");
      expect(getContextBracket(39)).toBe("DEPLETED");
    });

    it("should return CRITICAL for < 25%", () => {
      expect(getContextBracket(0)).toBe("CRITICAL");
      expect(getContextBracket(10)).toBe("CRITICAL");
      expect(getContextBracket(24)).toBe("CRITICAL");
    });

    it("should handle 0% remaining", () => {
      expect(getContextBracket(0)).toBe("CRITICAL");
    });
  });

  describe("computeContextBracketData", () => {
    // Tests for full bracket data computation

    it("should return FRESH for null tokensUsed", () => {
      const result = computeContextBracketData(null);
      expect(result.bracket).toBe("FRESH");
      expect(result.contextRemaining).toBeNull();
      expect(result.isCritical).toBe(false);
    });

    it("should return FRESH for 0 tokensUsed", () => {
      const result = computeContextBracketData(0);
      expect(result.bracket).toBe("FRESH");
      expect(result.contextRemaining).toBeNull();
    });

    it("should compute percentage correctly with default max", () => {
      // tokensUsed=80000, maxContext=200000 (default)
      const result = computeContextBracketData(80000);
      expect(result.contextRemaining).toBe(60);
      expect(result.bracket).toBe("FRESH");
    });

    it("should compute MODERATE bracket correctly", () => {
      // tokensUsed=100000, maxContext=200000
      const result = computeContextBracketData(100000);
      expect(result.contextRemaining).toBe(50);
      expect(result.bracket).toBe("MODERATE");
    });

    it("should compute DEPLETED bracket correctly", () => {
      // tokensUsed=130000, maxContext=200000
      const result = computeContextBracketData(130000);
      expect(result.contextRemaining).toBe(35);
      expect(result.bracket).toBe("DEPLETED");
    });

    it("should compute CRITICAL bracket correctly", () => {
      // tokensUsed=170000, maxContext=200000
      const result = computeContextBracketData(170000);
      expect(result.contextRemaining).toBe(15);
      expect(result.bracket).toBe("CRITICAL");
      expect(result.isCritical).toBe(true);
    });

    it("should handle custom maxContext parameter", () => {
      // tokensUsed=50000, maxContext=100000
      const result = computeContextBracketData(50000, 100000);
      expect(result.contextRemaining).toBe(50);
    });

    it("should cap contextRemaining at 0 minimum", () => {
      // tokensUsed > maxContext
      const result = computeContextBracketData(250000);
      expect(result.contextRemaining).toBeGreaterThanOrEqual(0);
    });

    it("should set rulesBracket to DEPLETED for CRITICAL", () => {
      // CRITICAL state
      const result = computeContextBracketData(180000);
      expect(result.rulesBracket).toBe("DEPLETED");
    });

    it("should set rulesBracket same as bracket for non-CRITICAL", () => {
      // FRESH, MODERATE states
      const freshResult = computeContextBracketData(50000);
      expect(freshResult.rulesBracket).toBe(freshResult.bracket);
      
      const moderateResult = computeContextBracketData(100000);
      expect(moderateResult.rulesBracket).toBe(moderateResult.bracket);
    });
  });

  describe("getRulesBracket", () => {
    // Tests for rules bracket mapping (CRITICAL -> DEPLETED)

    it("should return DEPLETED for CRITICAL bracket", () => {
      // CRITICAL state uses DEPLETED rules
      expect(getRulesBracket("CRITICAL")).toBe("DEPLETED");
    });

    it("should return same bracket for non-CRITICAL", () => {
      // FRESH, MODERATE, DEPLETED pass through
      expect(getRulesBracket("FRESH")).toBe("FRESH");
      expect(getRulesBracket("MODERATE")).toBe("MODERATE");
      expect(getRulesBracket("DEPLETED")).toBe("DEPLETED");
    });
  });

  describe("selectBracketRules", () => {
    // Tests for selecting rules based on bracket

    it("should return rules for matching bracket", () => {
      const bracketRules = {
        FRESH: ["rule1", "rule2"],
        DEPLETED: ["rule3"],
      };
      const result = selectBracketRules(bracketRules, {}, "FRESH");
      expect(result).toEqual(["rule1", "rule2"]);
    });

    it("should return empty array for missing bracket", () => {
      const bracketRules = { FRESH: ["rule1"] };
      const result = selectBracketRules(bracketRules, {}, "MODERATE");
      expect(result).toEqual([]);
    });

    it("should return empty array when bracket disabled", () => {
      const bracketRules = { FRESH: ["rule1"] };
      const bracketFlags = { FRESH: false };
      const result = selectBracketRules(bracketRules, bracketFlags, "FRESH");
      expect(result).toEqual([]);
    });

    it("should return rules when bracket enabled", () => {
      const bracketRules = { FRESH: ["rule1", "rule2"] };
      const bracketFlags = { FRESH: true };
      const result = selectBracketRules(bracketRules, bracketFlags, "FRESH");
      expect(result).toEqual(["rule1", "rule2"]);
    });

    it("should default to enabled when flag not specified", () => {
      const bracketRules = { FRESH: ["rule1"] };
      const bracketFlags = {}; // empty
      const result = selectBracketRules(bracketRules, bracketFlags, "FRESH");
      expect(result).toEqual(["rule1"]);
    });

    it("should handle DEPLETED rules for CRITICAL request", () => {
      // rulesBracket='DEPLETED' (mapped from CRITICAL)
      const bracketRules = {
        DEPLETED: ["depleted-rule1", "depleted-rule2"],
        CRITICAL: ["critical-rule"],
      };
      const result = selectBracketRules(bracketRules, {}, "DEPLETED");
      expect(result).toEqual(["depleted-rule1", "depleted-rule2"]);
    });

    it("should handle empty bracketRules object", () => {
      const bracketRules = {};
      const result = selectBracketRules(bracketRules, {}, "FRESH");
      expect(result).toEqual([]);
    });
  });

  describe("parseContextFile", () => {
    // Tests for parsing bracket rules from file content

    it("should parse bracket flags correctly", () => {
      const content = "FRESH_RULES=true\nMODERATE_RULES=false";
      const [flags, rules] = parseContextFile(content);
      expect(flags).toEqual({ FRESH: true, MODERATE: false });
    });

    it("should parse bracket rules correctly", () => {
      const content = "FRESH_RULE_1=Use detailed explanations\nFRESH_RULE_2=Include examples";
      const [flags, rules] = parseContextFile(content);
      expect(rules.FRESH).toEqual([
        "Use detailed explanations",
        "Include examples",
      ]);
    });

    it("should handle multiple brackets in same file", () => {
      const content = `
FRESH_RULE_1=Use detailed explanations
FRESH_RULE_2=Provide examples
MODERATE_RULE_1=Be concise
DEPLETED_RULE_1=Use minimal context
DEPLETED_RULE_2=Skip long quotes
`;
      const [flags, rules] = parseContextFile(content);
      expect(rules.FRESH).toHaveLength(2);
      expect(rules.MODERATE).toHaveLength(1);
      expect(rules.DEPLETED).toHaveLength(2);
    });

    it("should ignore comment lines", () => {
      const content = `
# This is a comment
FRESH_RULE_1=Use detailed explanations
`;
      const [flags, rules] = parseContextFile(content);
      expect(rules.FRESH).toEqual(["Use detailed explanations"]);
    });

    it("should ignore blank lines", () => {
      const content = `

FRESH_RULE_1=Use detailed explanations

`;
      const [flags, rules] = parseContextFile(content);
      expect(rules).toEqual({ FRESH: ["Use detailed explanations"] });
    });

    it("should ignore lines without equals sign", () => {
      const content = `
FRESH_RULE_1
INVALID LINE
`;
      const [flags, rules] = parseContextFile(content);
      expect(rules).toEqual({});
    });

    it("should parse boolean variations for flags", () => {
      const content = `
FRESH_RULES=true
MODERATE_RULES=yes
DEPLETED_RULES=1
CRITICAL_RULES=false
`;
      const [flags, rules] = parseContextFile(content);
      expect(flags).toEqual({ FRESH: true, MODERATE: true, DEPLETED: true, CRITICAL: false });
    });

    it("should preserve rule order within bracket", () => {
      const content = `
FRESH_RULE_1=First rule
FRESH_RULE_2=Second rule
FRESH_RULE_3=Third rule
`;
      const [flags, rules] = parseContextFile(content);
      expect(rules.FRESH).toEqual([
        "First rule",
        "Second rule",
        "Third rule",
      ]);
    });

    it("should handle empty file", () => {
      const [flags, rules] = parseContextFile("");
      expect(rules).toEqual({});
    });

    it("should skip lines with empty key or value", () => {
      const content = `
=value
KEY=
`;
      const [flags, rules] = parseContextFile(content);
      expect(flags).toEqual({});
      expect(rules).toEqual({});
    });
  });

  describe("formatCriticalWarning", () => {
    // Tests for critical warning formatting

    it("should format critical warning with percentage", () => {
      const warning = formatCriticalWarning(15);
      expect(warning).toContain("15%");
      expect(warning).toContain("CRITICAL");
      expect(warning).toContain("compact");
    });

    it("should include recommendation in warning", () => {
      const warning = formatCriticalWarning(15);
      expect(warning).toContain("Recommend:");
    });

    it("should handle low percentages", () => {
      const warning = formatCriticalWarning(5);
      expect(warning).toContain("5%");
    });
  });

  describe("formatContextBracketHeader", () => {
    // Tests for context bracket header formatting

    it("should format context bracket header for fresh session", () => {
      const data: ContextBracketData = {
        bracket: 'FRESH',
        contextRemaining: null,
        isCritical: false,
        rulesBracket: 'FRESH',
      };
      const header = formatContextBracketHeader(data);
      expect(header).toContain("fresh session");
    });

    it("should format context bracket header with percentage", () => {
      const data: ContextBracketData = {
        bracket: 'MODERATE',
        contextRemaining: 50,
        isCritical: false,
        rulesBracket: 'MODERATE',
      };
      const header = formatContextBracketHeader(data);
      expect(header).toContain("50%");
      expect(header).toContain("MODERATE");
    });

    it("should include critical warning in header when isCritical", () => {
      const data: ContextBracketData = {
        bracket: 'CRITICAL',
        contextRemaining: 15,
        isCritical: true,
        rulesBracket: 'DEPLETED',
      };
      const header = formatContextBracketHeader(data);
      expect(header).toContain("⚠️");
      expect(header).toContain("CRITICAL");
    });
  });
});
