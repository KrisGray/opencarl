# 17-03 Verification: Legacy String Sweep & E2E Run

## Legacy String Sweep Results

**Search Command:**
```bash
rg -n "@krisgray/opencode-carl-plugin|opencode-carl" --type js --type ts --type json --type yml --type yaml --type sh
```

**Summary:** All remaining references are in `.planning/` directory (allowed exceptions per plan).

**Allowed Exceptions:**
- `.planning/` - Historical phase files, research, and plan documentation

**Files Verified Clean:**
- `bin/install.js` - No legacy package references ✓
- `scripts/publish-opencode.ts` - No legacy package references ✓
- `.github/workflows/test.yml` - No legacy package references ✓
- `.github/workflows/e2e-tests.yml` - No legacy package references ✓
- `tests/e2e/run-e2e-tests.sh` - No legacy package references ✓
- `package.json` - Uses @krisgray/opencarl ✓
- `README.md` - Uses correct npm/GitHub links ✓

---

## E2E Test Run

**Command:**
```bash
npm run test:e2e:ci
```

**Docker Image:** opencode-opencarl:e2e (via E2E_IMAGE env override)

**E2E Test Result:**
- Docker image builds successfully using `opencode-opencarl:e2e`
- Container starts successfully as `opencarl-e2e`
- Tests reference legacy `.carl` directory (pre-existing issue from earlier phases)
- This is a known pre-existing issue - E2E tests need updating to use `.opencarl` instead of `.carl`

**Status:** Partial - Docker infrastructure works correctly with new image name. E2E test logic has pre-existing issue with directory naming.
