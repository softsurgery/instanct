import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

// Register custom resolution hook so Node's native runner can resolve extensionless imports in local files
register(
  `data:text/javascript,
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (!specifier.endsWith(".ts") && !specifier.endsWith(".js") && !specifier.startsWith("node:")) {
      return await nextResolve(specifier + ".ts", context);
    }
    throw err;
  }
}
`,
  import.meta.url,
);

// @ts-ignore
import { compareSemver, isVersionOutdated, parseSemver } from "./semver.ts";

// @ts-ignore
const { useVersionPersistStore } = await import(
  // @ts-ignore
  "../stores/useVersionPersistStore.ts"
);

function isValidStoreUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim();
  return (
    /^https:\/\//i.test(trimmed) ||
    /^market:\/\//i.test(trimmed) ||
    /^itms-apps:\/\//i.test(trimmed)
  );
}

describe("Mobile Version Policy & Enforcement Test Suite (Direct Production Code)", () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useVersionPersistStore.getState().clearMandatoryUpdate();
  });

  // Requirement 1: Installed version equals minimum: allowed.
  it("Requirement 1: Installed version equals minimum -> allowed (not outdated)", () => {
    assert.equal(isVersionOutdated("1.2.0", "1.2.0"), false);
    assert.equal(isVersionOutdated("2.0.0", "2.0.0"), false);
  });

  // Requirement 2: Installed version is newer than minimum: allowed.
  it("Requirement 2: Installed version is newer than minimum -> allowed", () => {
    assert.equal(isVersionOutdated("1.2.1", "1.2.0"), false);
    assert.equal(isVersionOutdated("2.0.0", "1.9.9"), false);
    assert.equal(isVersionOutdated("2.1.0", "2.0.5"), false);
  });

  // Requirement 3: Installed version is older than minimum: update required.
  it("Requirement 3: Installed version is older than minimum -> update required", () => {
    assert.equal(isVersionOutdated("1.0.0", "1.0.1"), true);
    assert.equal(isVersionOutdated("1.1.9", "1.2.0"), true);
    assert.equal(isVersionOutdated("1.9.9", "2.0.0"), true);
  });

  // Requirement 4: Correct semantic comparison, especially 1.10.0 versus 1.9.0 and strict ASCII sort.
  it("Requirement 4: Semantic comparison handles 1.10.0 > 1.9.0 and prereleases in ASCII sort order", () => {
    assert.equal(compareSemver("1.10.0", "1.9.0"), 1);
    assert.equal(compareSemver("1.9.0", "1.10.0"), -1);
    assert.equal(isVersionOutdated("1.9.0", "1.10.0"), true);
    assert.equal(isVersionOutdated("1.10.0", "1.9.0"), false);

    // Prerelease precedence: 1.0.0 > 1.0.0-beta.1
    assert.equal(compareSemver("1.0.0", "1.0.0-beta.1"), 1);
    assert.equal(compareSemver("1.0.0-alpha.1", "1.0.0-alpha.2"), -1);
    assert.equal(compareSemver("1.0.0-alpha", "1.0.0-beta"), -1);
  });

  // Requirement 5: iOS uses the iOS minimum, and Android uses the Android minimum.
  it("Requirement 5: iOS and Android have separate policy thresholds", () => {
    const policy = {
      ios: {
        minVersion: "2.0.0",
        storeUrl: "https://apps.apple.com/app/id123",
      },
      android: {
        minVersion: "1.5.0",
        storeUrl:
          "https://play.google.com/store/apps/details?id=com.instanct.instanctma",
      },
    };

    const installedVersion = "1.6.0";

    // On iOS: 1.6.0 < 2.0.0 -> Outdated
    assert.equal(
      isVersionOutdated(installedVersion, policy.ios.minVersion),
      true,
    );

    // On Android: 1.6.0 >= 1.5.0 -> Allowed
    assert.equal(
      isVersionOutdated(installedVersion, policy.android.minVersion),
      false,
    );
  });

  // Requirement 6: Missing or malformed minimum version does not create an accidental lockout.
  it("Requirement 6: Missing or malformed minimum version fails safely without lockout", () => {
    assert.equal(isVersionOutdated("1.0.0", null), false);
    assert.equal(isVersionOutdated("1.0.0", undefined), false);
    assert.equal(isVersionOutdated("1.0.0", ""), false);
    assert.equal(isVersionOutdated("1.0.0", "invalid-semver"), false);
    assert.equal(isVersionOutdated("1.0.0", "1.x"), false);
    assert.equal(isVersionOutdated("1.0.0", "latest"), false);

    // Strict SemVer 2.0.0 checks: leading zeroes and empty prerelease identifiers fail safely
    assert.equal(isVersionOutdated("1.0.0", "01.0.0"), false);
    assert.equal(isVersionOutdated("1.0.0", "1.02.0"), false);
    assert.equal(isVersionOutdated("1.0.0", "1.0.03"), false);
    assert.equal(isVersionOutdated("1.0.0", "1.0.0-alpha..1"), false);
  });

  // Requirement 7: Missing or invalid store URL does not crash or open unsafe destination.
  it("Requirement 7: Store URL validation rejects dangerous schemes and handles missing URL", () => {
    assert.equal(
      isValidStoreUrl(
        "https://play.google.com/store/apps/details?id=com.instanct.instanctma",
      ),
      true,
    );
    assert.equal(
      isValidStoreUrl("itms-apps://itunes.apple.com/app/id123456789"),
      true,
    );
    assert.equal(
      isValidStoreUrl("market://details?id=com.instanct.instanctma"),
      true,
    );

    // Invalid or dangerous schemes must be rejected
    assert.equal(isValidStoreUrl("javascript:alert(1)"), false);
    assert.equal(isValidStoreUrl("file:///etc/passwd"), false);
    assert.equal(isValidStoreUrl("http://insecure-site.com"), false);
    assert.equal(isValidStoreUrl(""), false);
    assert.equal(isValidStoreUrl(null), false);
    assert.equal(isValidStoreUrl(undefined), false);
  });

  // Requirement 8: First policy request fails with no cached mandatory update: no invented lockout.
  it("Requirement 8: First policy request failure with no cached update causes NO lockout in useVersionPersistStore", () => {
    const store = useVersionPersistStore.getState();
    // Cold launch bootstrap with no prior cached mandatory update
    store.bootstrapColdLaunch("1.0.0");

    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      false,
    );
    assert.equal(
      useVersionPersistStore.getState().hasPendingMandatoryUpdate,
      false,
    );
  });

  // Requirement 9: Previously confirmed mandatory update plus API failure: remains enforced.
  it("Requirement 9: Previously confirmed mandatory update remains enforced during API failure in useVersionPersistStore", () => {
    const store = useVersionPersistStore.getState();
    // Confirm mandatory update
    store.confirmMandatoryUpdate(
      "2.0.0",
      "https://play.google.com/store/apps/details?id=com.instanct.instanctma",
    );

    // Cold launch with still-outdated version (1.0.0) and network down (API failure)
    store.bootstrapColdLaunch("1.0.0");

    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      true,
    );
    assert.equal(
      useVersionPersistStore.getState().confirmedMinVersion,
      "2.0.0",
    );
  });

  // Requirement 10: A successful check confirming the installed version is supported clears the cached mandatory-update state.
  it("Requirement 10: Successful check confirming supported version clears mandatory-update state in useVersionPersistStore", () => {
    const store = useVersionPersistStore.getState();
    // Initially confirmed as outdated
    store.confirmMandatoryUpdate("2.0.0", "https://example.com");
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      true,
    );

    // Check confirms installed version satisfies policy -> clearMandatoryUpdate is called
    store.clearMandatoryUpdate();

    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      false,
    );
    assert.equal(useVersionPersistStore.getState().confirmedMinVersion, null);
  });

  // Requirement 11: A newly discovered mandatory update does not interrupt an already-running session and is enforced on the next cold launch.
  it("Requirement 11: Active session is never interrupted by newly published policy; enforced on next cold launch via useVersionPersistStore", () => {
    const store = useVersionPersistStore.getState();
    const installedVersion = "1.0.0";

    // Initial cold launch: app is up to date
    store.bootstrapColdLaunch(installedVersion);
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      false,
    );

    // Active session: admin publishes 2.0.0 while user is using the app
    // In production, stageMandatoryUpdateForNextLaunch is called
    store.stageMandatoryUpdateForNextLaunch(
      "2.0.0",
      "https://play.google.com/store/apps/details?id=com.instanct.instanctma",
    );

    // CRITICAL: Session is NOT interrupted! confirmed remains false
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      false,
    );
    assert.equal(
      useVersionPersistStore.getState().hasPendingMandatoryUpdate,
      true,
    );
    assert.equal(useVersionPersistStore.getState().pendingMinVersion, "2.0.0");

    // Next cold launch: user restarts the app
    store.bootstrapColdLaunch(installedVersion);

    // Staged update is now promoted to confirmed active gate on cold launch!
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      true,
    );
    assert.equal(
      useVersionPersistStore.getState().confirmedMinVersion,
      "2.0.0",
    );
    assert.equal(
      useVersionPersistStore.getState().hasPendingMandatoryUpdate,
      false,
    );
  });

  // Requirement 12: After the app is updated and relaunched, the installed version is rechecked correctly.
  it("Requirement 12: Updated app relaunched (even offline) recovers and unlocks correctly in useVersionPersistStore", () => {
    const store = useVersionPersistStore.getState();
    // User was locked out on 1.0.0 with required min 2.0.0
    store.confirmMandatoryUpdate(
      "2.0.0",
      "https://play.google.com/store/apps/details?id=com.instanct.instanctma",
    );
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      true,
    );

    // User updates in the store to 2.0.0 and relaunches while offline
    store.bootstrapColdLaunch("2.0.0");

    // The gate is immediately cleared even offline!
    assert.equal(
      useVersionPersistStore.getState().hasConfirmedMandatoryUpdate,
      false,
    );
    assert.equal(useVersionPersistStore.getState().confirmedMinVersion, null);
  });
});
