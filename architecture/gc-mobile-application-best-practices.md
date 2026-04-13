# Government of Canada — Secure Mobile Application Architecture Best Practices

**Classification:** Unclassified  
**Version:** 1.0 — Draft  
**Date:** April 13, 2026  
**Audience:** Enterprise Architects, Security Architects, Solution Architects, Development Leads, and Decision-Makers within GC Federal Departments  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope and Purpose](#2-scope-and-purpose)
3. [Platform Selection — Decision Framework](#3-platform-selection--decision-framework)
   - 3.1 [Native iOS (Swift / SwiftUI)](#31-native-ios-swift--swiftui)
   - 3.2 [Native Android (Kotlin / Jetpack Compose)](#32-native-android-kotlin--jetpack-compose)
   - 3.3 [Cross-Platform — React Native](#33-cross-platform--react-native)
   - 3.4 [Hybrid / WebView Shell Applications](#34-hybrid--webview-shell-applications)
   - 3.5 [Platform Comparison Matrix](#35-platform-comparison-matrix)
4. [Authentication and Identity Architecture](#4-authentication-and-identity-architecture)
   - 4.1 [GC Enterprise Identity Platform — Non-Negotiable Constraint](#41-gc-enterprise-identity-platform--non-negotiable-constraint)
   - 4.2 [OAuth 2.1 and Device-Bound Token Flows](#42-oauth-21-and-device-bound-token-flows)
   - 4.3 [OpenID Connect (OIDC) and Claims-Based Identity](#43-openid-connect-oidc-and-claims-based-identity)
   - 4.4 [Why MFA Alone Is Insufficient](#44-why-mfa-alone-is-insufficient)
   - 4.5 [Device + Identity Coupling — Hardware-Backed Security](#45-device--identity-coupling--hardware-backed-security)
   - 4.6 [Client Certificate Verification with HSM](#46-client-certificate-verification-with-hsm)
   - 4.7 [Reducing Login Prompts — Silent Token Renewal](#47-reducing-login-prompts--silent-token-renewal)
   - 4.8 [Authentication Possibilities — Complete Landscape](#48-authentication-possibilities--complete-landscape)
5. [WebView Shell vs. Locally-Hosted Application — Security Analysis](#5-webview-shell-vs-locally-hosted-application--security-analysis)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
   - 6.1 [Logging](#61-logging)
   - 6.2 [Auditing](#62-auditing)
   - 6.3 [Distributed Tracing](#63-distributed-tracing)
   - 6.4 [Authorization](#64-authorization)
   - 6.5 [Error Handling and Resilience](#65-error-handling-and-resilience)
   - 6.6 [Performance](#66-performance)
   - 6.7 [Testability](#67-testability)
   - 6.8 [Scalability](#68-scalability)
   - 6.9 [Accessibility (WCAG / GC Standard on Accessible ICT)](#69-accessibility-wcag--gc-standard-on-accessible-ict)
   - 6.10 [Localization (Official Languages)](#610-localization-official-languages)
   - 6.11 [Data Sovereignty and Privacy](#611-data-sovereignty-and-privacy)
   - 6.12 [Configuration Management](#612-configuration-management)
   - 6.13 [Dependency and Supply-Chain Security](#613-dependency-and-supply-chain-security)
7. [Security Controls Comparison — Native vs. React Native vs. WebView](#7-security-controls-comparison--native-vs-react-native-vs-webview)
8. [Decision Tree — Selecting the Right Architecture](#8-decision-tree--selecting-the-right-architecture)
9. [Recommendations and Next Steps](#9-recommendations-and-next-steps)
10. [Appendix — Glossary and References](#10-appendix--glossary-and-references)

---

## 1. Executive Summary

This document provides a comprehensive guide for the Government of Canada (GC) when designing, building, and deploying secure mobile applications for Android phones/tablets and iOS devices (iPhone/iPad). It moves beyond the narrow view of "which framework to pick" and "which IdP to use" to address **every application-level cross-cutting concern** that is critical for a federal-grade mobile application.

Key findings:

- **Platform selection is secondary to architecture decisions.** The choice between React Native, Swift, and Kotlin matters less than how authentication, logging, auditing, tracing, authorization, data protection, and testability are architected across the stack.
- **The GC Identity Platform is a fixed constraint**, but there is significant design space in how device-level security, token flows, and credential storage are implemented around it.
- **MFA alone is not sufficient** for high-assurance mobile use cases. Device attestation, hardware-bound keys, and mutual TLS provide defense-in-depth.
- **WebView shell applications are a serious security risk** and should be avoided for any application handling Protected B or sensitive data.
- **Native platforms offer measurably stronger security primitives** than cross-platform frameworks, but React Native is a viable option when paired with proper native module bridges for security-critical operations.

---

## 2. Scope and Purpose

This guide serves as a **decision framework** — not a prescriptive mandate. It is intended to:

1. Enumerate **all cross-cutting concerns** that must be addressed before writing the first line of code
2. Provide a **pros and cons analysis** for each platform choice against each concern
3. Present the **complete authentication and identity landscape** available within GC constraints
4. Offer a **decision tree** that Federal departments can follow based on their specific risk profile, user base, and operational requirements

**In Scope:** Android (phones + tablets), iOS (iPhone + iPad), authentication, authorization, logging, auditing, tracing, performance, testability, scalability, accessibility, localization, data sovereignty, security architecture.

**Out of Scope:** Backend API design, cloud infrastructure, MDM/EMM policy (referenced but not detailed), desktop or web applications.

---

## 3. Platform Selection — Decision Framework

### 3.1 Native iOS (Swift / SwiftUI)

**Pros:**

| Area | Detail |
|------|--------|
| **Security** | Direct access to the Secure Enclave, Keychain Services, CryptoKit, and App Attest API. No JavaScript bridge to intercept. |
| **Performance** | Compiled to native ARM binaries; no runtime interpretation layer. Optimal for computationally intensive cryptographic operations. |
| **Hardware Integration** | Full access to biometrics (Face ID, Touch ID), NFC, Bluetooth, and device sensors without third-party wrappers. |
| **OS Updates** | Typically same-day support for new iOS features, security patches, and API changes. |
| **App Store Compliance** | Apple's review process favors native apps; fewer rejection risks related to WebView or dynamic code loading. |
| **Testability** | XCTest, XCUITest provide deep integration testing capabilities with Xcode Instruments for profiling. |
| **Code Signing** | Tightly controlled by Apple — code integrity verification is built into the platform. |

**Cons:**

| Area | Detail |
|------|--------|
| **iOS-only** | No code reuse for Android. Requires a completely separate Android codebase. |
| **Talent Pool** | Smaller pool of Swift developers compared to JavaScript/TypeScript (React Native). |
| **Development Cost** | Maintaining two separate native codebases (iOS + Android) increases development and maintenance cost by an estimated 40–70%. |
| **Release Cadence** | App Store review process can introduce delays (1–7 days). |

### 3.2 Native Android (Kotlin / Jetpack Compose)

**Pros:**

| Area | Detail |
|------|--------|
| **Security** | Direct access to Android Keystore (hardware-backed on most modern devices), SafetyNet/Play Integrity API, StrongBox. |
| **Performance** | ART-compiled; near-native performance for all operations. |
| **Device Diversity** | Supports the wide range of GC-issued Android devices (Samsung Knox-enrolled, Google Pixel, etc.). |
| **MDM Integration** | Deep integration with Android Enterprise for managed device profiles, work profiles, and COPE/BYOD scenarios. |
| **Testability** | Espresso, UI Automator, and Robolectric provide comprehensive testing at unit, integration, and UI levels. |
| **Open Ecosystem** | Greater flexibility in distribution (Play Store, enterprise sideloading, managed Google Play). |

**Cons:**

| Area | Detail |
|------|--------|
| **Fragmentation** | Wide variance in hardware security module quality across device manufacturers. Not all Android devices have hardware-backed keystores. |
| **Android-only** | No code reuse for iOS. |
| **Security Inconsistency** | HSM-level security varies by OEM; Samsung Knox provides stronger guarantees than generic AOSP devices. |
| **Update Lag** | Android OS updates are manufacturer-dependent; security patch adoption is inconsistent. |

### 3.3 Cross-Platform — React Native

**Pros:**

| Area | Detail |
|------|--------|
| **Code Reuse** | 70–90% shared codebase across iOS and Android, reducing development and maintenance cost. |
| **Talent Availability** | Large pool of JavaScript/TypeScript developers. Easier to staff. |
| **Development Speed** | Hot-reloading, single codebase, and a mature ecosystem accelerate development. |
| **Ecosystem** | Rich library ecosystem (navigation, state management, etc.). Expo framework simplifies build tooling. |
| **Local Execution** | All HTML, JavaScript, and application logic runs locally on device — not fetched from a remote server. |

**Cons:**

| Area | Detail |
|------|--------|
| **Security Surface** | JavaScript bridge introduces an additional attack surface. Native module calls cross a serialization boundary that can be intercepted on rooted/jailbroken devices. |
| **HSM Access** | No direct access to Secure Enclave or Android Keystore from JavaScript — requires native module bridges (e.g., `react-native-keychain`, custom native modules). |
| **Performance Overhead** | JS ↔ Native bridge imposes latency for security-critical operations. The new architecture (JSI/TurboModules) reduces but does not eliminate this. |
| **OS Feature Lag** | New OS security features (e.g., Apple's App Attest, Android's Key Attestation) require native module updates, introducing delay. |
| **Supply-Chain Risk** | Heavy dependency on npm packages; each dependency is a potential supply-chain attack vector. |
| **Code Obfuscation** | JavaScript bundles are harder to obfuscate effectively compared to compiled Swift/Kotlin binaries. |
| **Dynamic Code Risk** | Although React Native runs locally, the use of `eval()`, dynamic imports, or over-the-air (OTA) update mechanisms (e.g., CodePush) can introduce runtime code injection risks if not locked down. |

### 3.4 Hybrid / WebView Shell Applications

> **⚠️ This pattern is strongly discouraged for GC applications handling any sensitive data.**

A "shell app" is a native application wrapper that embeds a full-screen `WKWebView` (iOS) or `WebView` (Android) to render a remotely-hosted web application.

**Pros:**

| Area | Detail |
|------|--------|
| **Development Cost** | Minimal mobile-specific development; reuses an existing web application. |
| **Update Speed** | Web content can be updated server-side without app store releases. |

**Cons — Security Risks:**

| Risk | Detail |
|------|--------|
| **No Code Integrity** | Content is fetched remotely at runtime. There is no compile-time integrity verification. A compromised CDN or MITM attack can inject arbitrary code. |
| **Token Exposure** | Tokens stored in `localStorage`, `sessionStorage`, or cookies within the WebView are accessible to injected scripts via XSS. |
| **No HSM Access** | WebView JavaScript has no access to Secure Enclave, Keychain, or Android Keystore. Credentials cannot be hardware-protected. |
| **Cookie/Session Hijacking** | WebView cookie stores can be extracted on rooted/jailbroken devices. |
| **JavaScript Bridge Exploits** | If native ↔ WebView bridges are exposed (e.g., `addJavascriptInterface` on Android), any script running in the WebView can invoke native APIs. |
| **TLS Pinning Bypass** | WebView TLS behavior is controlled by the system; implementing certificate pinning is difficult or impossible. |
| **No App Attest / Play Integrity** | Shell apps cannot meaningfully participate in device attestation because the "application" is a web page, not a verifiable binary. |
| **Data Leakage** | WebView caches (HTTP cache, DOM storage) persist on disk and can be forensically extracted. |
| **Content Security Policy Limitations** | CSP headers apply to the web content but do not protect the native bridge layer. |

**Bottom Line:** A WebView shell is functionally equivalent to running a browser bookmark. It provides no additional security controls beyond what a standard mobile browser offers, while creating a false sense of security by appearing as a "native app." For any GC application requiring Protected B data handling, **this pattern must be avoided.**

### 3.5 Platform Comparison Matrix

| Concern | Native iOS (Swift) | Native Android (Kotlin) | React Native | WebView Shell |
|---------|-------------------|------------------------|--------------|---------------|
| HSM / Secure Enclave Access | ✅ Direct | ✅ Direct (device-dependent) | ⚠️ Via native bridge | ❌ None |
| Code Integrity | ✅ Compiled + signed | ✅ Compiled + signed | ⚠️ JS bundle can be extracted | ❌ Remote code |
| App Attestation | ✅ App Attest API | ✅ Play Integrity API | ⚠️ Requires native module | ❌ Not possible |
| Certificate Pinning | ✅ Native | ✅ Native | ⚠️ Via native module | ❌ Extremely limited |
| Biometric Auth | ✅ LocalAuthentication | ✅ BiometricPrompt | ⚠️ Via bridge | ❌ Not available |
| Performance | ✅ Excellent | ✅ Excellent | ⚠️ Good (bridge overhead) | ❌ Poor (web rendering) |
| Code Reuse | ❌ iOS only | ❌ Android only | ✅ 70-90% shared | ✅ Web reuse |
| Development Cost | ❌ High (per platform) | ❌ High (per platform) | ✅ Lower | ✅ Lowest |
| WCAG / Accessibility | ✅ UIAccessibility | ✅ AccessibilityService | ⚠️ Partial (varies by component) | ⚠️ Web accessibility |
| OTA Security Updates | ❌ App Store required | ❌ Play Store required | ⚠️ CodePush (risky) | ✅ Server-side |
| Supply-Chain Risk | ✅ Low (CocoaPods/SPM) | ✅ Low (Gradle) | ❌ High (npm) | ❌ High (CDN + npm) |

---

## 4. Authentication and Identity Architecture

### 4.1 GC Enterprise Identity Platform — Non-Negotiable Constraint

All GC applications must authenticate against the **Government of Canada's enterprise Identity Provider (IdP)**, which is based on the GC Sign-In / Trusted Digital Identity framework. This is a non-negotiable requirement driven by:

- **Treasury Board Policy on Service and Digital** — mandates use of GC enterprise identity services
- **ITPIN 2018-01** — direction on trusted digital identity
- **CCCS guidance** — alignment with Canadian Centre for Cyber Security recommendations

**What this means architecturally:**

- The mobile app is a **Relying Party (RP)** — it does not manage credentials directly
- Authentication flows must use **standard protocols** (OAuth 2.0/2.1, OpenID Connect) against the GC IdP
- The app **cannot** implement its own username/password store or custom credential scheme
- All session management is token-based; the GC IdP issues tokens, the app validates and stores them securely

**Degrees of Freedom:** While the IdP is fixed, there is significant design space in:
- How tokens are stored on-device (software vs. hardware-backed)
- How device identity is coupled with user identity
- How token renewal minimizes login prompts
- How additional attestation layers complement the IdP assertion

### 4.2 OAuth 2.1 and Device-Bound Token Flows

OAuth 2.1 (consolidation of OAuth 2.0 best practices, RFC 9700) is the recommended authorization framework. Key flows for mobile:

#### 4.2.1 Authorization Code Flow with PKCE (Mandatory)

```
┌──────────┐                                    ┌──────────────┐
│  Mobile   │──(1) Auth Request + code_challenge──▶│   GC IdP      │
│  App      │                                    │  (Auth Server)│
│           │◀──(2) Authorization Code───────────│               │
│           │──(3) Token Request + code_verifier──▶│               │
│           │◀──(4) Access Token + Refresh Token──│               │
└──────────┘                                    └──────────────┘
```

- **PKCE is mandatory** (not optional) — mitigates authorization code interception
- The implicit flow is **prohibited** under OAuth 2.1
- Client secrets **must not** be embedded in mobile applications

#### 4.2.2 Device-Bound Token Enhancement (DPoP — Demonstrating Proof-of-Possession)

Standard bearer tokens are vulnerable if extracted from device storage. **DPoP (RFC 9449)** binds tokens to a device-specific cryptographic key:

```
┌──────────┐                                     ┌──────────────┐
│  Mobile   │──(1) Generate key pair in HSM──────▶│ Secure Enclave│
│  App      │◀──(1a) Public key reference─────────│ / Keystore    │
│           │                                     └──────────────┘
│           │──(2) Token Request + DPoP Proof──────▶┌──────────────┐
│           │◀──(3) DPoP-bound Access Token────────│   GC IdP      │
│           │                                      └──────────────┘
│           │──(4) API Request + DPoP Proof────────▶┌──────────────┐
│           │   (signed by device HSM key)          │  Resource     │
│           │◀──(5) Protected Resource─────────────│  Server       │
└──────────┘                                      └──────────────┘
```

**How this enhances security:**
- Even if tokens are stolen from device storage, they are **cryptographically useless** without access to the HSM-bound private key
- Each API request includes a **proof-of-possession** signed by the device's hardware-protected key
- The resource server validates both the token **and** the proof, ensuring the presenting device is the intended recipient

**Token + Device Information Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      DPoP Token Payload                         │
├─────────────────────────────────────────────────────────────────┤
│  Standard Claims:                                               │
│    iss: https://gc-idp.canada.ca                                │
│    sub: <user-id>                                               │
│    aud: <api-resource-identifier>                               │
│    exp: <short-lived, e.g. 5 minutes>                           │
│    iat: <issued-at>                                             │
│                                                                 │
│  DPoP Proof (JWT Header):                                       │
│    typ: dpop+jwt                                                │
│    alg: ES256 (ECDSA with P-256)                                │
│    jwk: <device public key from HSM>                            │
│                                                                 │
│  DPoP Proof (JWT Payload):                                      │
│    htm: POST                                                    │
│    htu: https://api.service.canada.ca/resource                  │
│    iat: <timestamp>                                             │
│    jti: <unique-per-request nonce>                               │
│                                                                 │
│  Device Context (Custom Claims for Zero-Trust):                 │
│    cnf.jkt: <JWK thumbprint of device key>                      │
│    device_integrity: <Play Integrity / App Attest token>        │
│    device_id: <hardware-derived identifier>                     │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.3 Refresh Token Rotation

- Refresh tokens **must** be rotated on every use (OAuth 2.1 requirement)
- Previous refresh tokens are invalidated immediately upon rotation
- Refresh tokens stored in HSM-backed storage (Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` on iOS, EncryptedSharedPreferences backed by Android Keystore)
- Refresh token lifetime should be bounded (e.g., 24–48 hours) with re-authentication required beyond that window

### 4.3 OpenID Connect (OIDC) and Claims-Based Identity

OpenID Connect is the identity layer built on top of OAuth 2.1. It provides:

- **ID Token** — a signed JWT asserting user identity, authentication time, authentication method, and assurance level
- **UserInfo Endpoint** — additional claims about the user
- **Standard Claims** — `sub`, `email`, `name`, `locale`, `amr` (authentication methods reference)

**Critical for GC Mobile Apps:**

| OIDC Feature | GC Application |
|--------------|----------------|
| `acr` (Authentication Context Class Reference) | Maps to GC assurance levels (e.g., LOA2, LOA3). Mobile apps should **request and validate** the appropriate assurance level. |
| `amr` (Authentication Methods Reference) | Indicates how the user authenticated (e.g., `["pwd", "otp", "hwk"]`). The app should verify that hardware-key-based authentication was used when required. |
| `auth_time` | Timestamp of authentication. The app should enforce maximum session age policies. |
| `at_hash` | Access token hash — validates that the access token was issued alongside the ID token. |
| Claims Request Parameter | Request specific claims (e.g., department, clearance level, role) for fine-grained authorization. |

**OIDC + Device Binding Flow:**

```
1. App initiates OIDC flow with scope: openid profile gc-assurance
2. GC IdP authenticates user (password + MFA + optional device attestation)
3. GC IdP returns:
   - ID Token (user identity + assurance level + auth methods)
   - Access Token (API authorization, DPoP-bound)
   - Refresh Token (session continuity, device-bound)
4. App validates ID Token signature against GC IdP JWKS endpoint
5. App checks acr claim meets minimum assurance level
6. App checks amr claim includes required authentication methods
7. App stores tokens in HSM-backed storage
8. Subsequent API calls include DPoP-bound access token
```

### 4.4 Why MFA Alone Is Insufficient

Multi-Factor Authentication (MFA) is a **necessary but not sufficient** control for GC mobile applications. Here is why:

#### What MFA Protects Against:
- ✅ Credential theft (password alone is not enough)
- ✅ Remote account takeover from unknown devices
- ✅ Phishing attacks (partially — phishing-resistant MFA like FIDO2 is better)

#### What MFA Does NOT Protect Against:

| Threat | Why MFA Fails |
|--------|--------------|
| **Stolen device with active session** | MFA was already completed. If the session is alive, the attacker has full access. No re-authentication is triggered. |
| **Token extraction from compromised device** | Bearer tokens stored in software-only storage can be exfiltrated. MFA doesn't protect the token at rest. |
| **Man-in-the-middle on device** | Malware running on a rooted/jailbroken device can intercept tokens post-MFA. MFA protects the authentication ceremony, not the post-auth session. |
| **Session replay** | A captured bearer token can be replayed from a different device. MFA verified the user, not the device presenting the token. |
| **Push fatigue / MFA bombing** | Attackers repeatedly trigger push notifications until the user approves. This is a known attack against push-based MFA. |
| **SIM-swap for SMS OTP** | SMS-based MFA is vulnerable to carrier-level SIM swap attacks. Not appropriate for high-assurance scenarios. |
| **Real-time phishing proxies** | Tools like Evilginx2 can proxy the MFA ceremony in real-time, capturing both credentials and MFA tokens. |

#### What Additional Controls Are Required:

| Control | Purpose |
|---------|---------|
| **Device-bound tokens (DPoP)** | Tokens are cryptographically bound to the device's hardware key. Stolen tokens cannot be used elsewhere. |
| **App attestation** | Verifies that the binary making the request is the genuine, unmodified GC application (not a repackaged or instrumented version). |
| **Device integrity checks** | Detects rooted/jailbroken devices, active debuggers, or Frida/Xposed hooks. |
| **Certificate-based device identity** | Mutual TLS (mTLS) with a device certificate stored in the HSM creates a cryptographic device identity independent of the user identity. |
| **Continuous access evaluation** | Server-side evaluation of device compliance signals (MDM-reported) during token validation, not just at authentication time. |
| **Step-up authentication** | High-risk operations (e.g., data export, admin actions) trigger additional authentication even within an active session. |

**The Security Model:**

```
MFA alone:           User Identity ✓  +  Device Identity ✗
MFA + DPoP:          User Identity ✓  +  Device Identity ✓ (token-bound)
MFA + DPoP + mTLS:   User Identity ✓  +  Device Identity ✓ (channel-bound)
MFA + DPoP + Attest: User Identity ✓  +  Device Identity ✓ + App Integrity ✓
```

The goal is **User + Device + App** verification at multiple layers.

### 4.5 Device + Identity Coupling — Hardware-Backed Security

#### iOS — Secure Enclave

The Secure Enclave is a dedicated hardware security coprocessor on Apple devices:

- **Key Generation:** Generates ECDSA P-256 key pairs that **never leave** the Secure Enclave. The private key is not accessible to the application or the operating system.
- **Key Usage:** The app requests the Secure Enclave to sign a challenge/nonce; only the signature is returned.
- **Biometric Gating:** Key usage can be gated by Face ID / Touch ID — the key is only usable with biometric confirmation.
- **Access Control:** `SecAccessControlCreateWithFlags` allows policies like `.biometryCurrentSet` (invalidated if biometrics change) and `.privateKeyUsage`.

```swift
// Example: Creating a Secure Enclave-bound key for DPoP
let access = SecAccessControlCreateWithFlags(
    kCFAllocatorDefault,
    kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    [.privateKeyUsage, .biometryCurrentSet],
    nil
)!

let attributes: [String: Any] = [
    kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
    kSecAttrKeySizeInBits as String: 256,
    kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
    kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: "ca.gc.app.dpop-key",
        kSecAttrAccessControl as String: access
    ]
]

var error: Unmanaged<CFError>?
let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error)
```

#### Android — Keystore with StrongBox

- **Hardware-Backed Keystore:** On devices with a dedicated HSM (StrongBox Keymaster), keys are generated and stored in tamper-resistant hardware.
- **Key Attestation:** Android provides a certificate chain that cryptographically proves a key was generated inside hardware. The GC backend can verify this chain.
- **Biometric Binding:** `setUserAuthenticationRequired(true)` gates key usage on biometric or device credential authentication.

```kotlin
// Example: Creating a hardware-backed key for DPoP
val keyGenSpec = KeyGenParameterSpec.Builder(
    "ca.gc.app.dpop-key",
    KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
)
    .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
    .setDigests(KeyProperties.DIGEST_SHA256)
    .setIsStrongBoxBacked(true)  // Require dedicated HSM
    .setUserAuthenticationRequired(true)
    .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)
    .setAttestationChallenge(serverNonce)  // Enable key attestation
    .build()

val keyPairGenerator = KeyPairGenerator.getInstance(
    KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore"
)
keyPairGenerator.initialize(keyGenSpec)
val keyPair = keyPairGenerator.generateKeyPair()
```

#### React Native — Bridge-Dependent

React Native **does not** have direct access to Secure Enclave or Android Keystore from JavaScript. Access requires:

1. A **native module** written in Swift/Kotlin that wraps the platform-specific HSM APIs
2. The JavaScript layer calls the native module across the bridge
3. The bridge serialization is a point of interception on compromised devices

Libraries like `react-native-keychain` and `react-native-biometrics` provide partial abstraction, but:
- They may not support all Secure Enclave features (e.g., key attestation)
- Custom native modules are often required for full DPoP and mTLS implementations
- The bridge introduces latency for performance-sensitive cryptographic operations

### 4.6 Client Certificate Verification with HSM

Client certificate (mTLS) authentication provides a **transport-layer device identity** that complements the application-layer OAuth/OIDC identity:

```
┌──────────────────────────────────────────────────────────────┐
│                    mTLS Handshake                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Client initiates TLS connection to GC API gateway          │
│  2. Server presents its certificate (standard TLS)             │
│  3. Server requests client certificate (CertificateRequest)    │
│  4. Client retrieves certificate chain from device store       │
│  5. Client signs the TLS handshake with HSM-stored private key │
│  6. Server validates:                                          │
│     a. Certificate chain → GC-trusted CA                       │
│     b. Certificate not revoked (CRL/OCSP)                      │
│     c. Certificate subject matches expected device identity    │
│  7. TLS session established with mutual authentication         │
│                                                               │
│  Result: Every byte transmitted is bound to a verified device  │
└──────────────────────────────────────────────────────────────┘
```

**Device Certificate Lifecycle:**

| Phase | Process |
|-------|---------|
| **Provisioning** | During MDM enrollment, a device certificate is generated with the private key in the HSM. The CSR (Certificate Signing Request) is sent to the GC PKI CA. |
| **Storage** | Private key resides exclusively in Secure Enclave (iOS) or StrongBox Keystore (Android). It cannot be exported. |
| **Rotation** | Certificates have a defined validity period (e.g., 1 year). Automated renewal via MDM or SCEP/EST protocol. |
| **Revocation** | MDM can trigger revocation on device wipe, policy violation, or compromise detection. OCSP stapling provides real-time revocation checking. |

**Combined Flow — mTLS + OAuth 2.1 + DPoP:**

```
Layer 1 (TLS):     Device ←──mTLS──→ API Gateway     → Device is authenticated
Layer 2 (OAuth):   User   ←──DPoP token──→ Resource    → User is authorized  
Layer 3 (App):     Binary ←──Attestation──→ Verifier   → App is genuine

Three independent verification layers. Compromise of one does not break the others.
```

### 4.7 Reducing Login Prompts — Silent Token Renewal

A core usability requirement is minimizing login friction while maintaining security. The following strategies achieve this:

#### Strategy 1: Long-Lived Refresh Tokens with Short-Lived Access Tokens
- Access tokens: 5–15 minute lifetime (limits damage if intercepted)
- Refresh tokens: 24–48 hours (enables silent renewal without user interaction)
- The SDK silently exchanges the refresh token for a new access token before expiry
- User only sees a login prompt when the refresh token expires

#### Strategy 2: Biometric-Gated Token Access
- Tokens stored with `biometryCurrentSet` access control
- First use after device unlock triggers a biometric prompt (invisible or quick)
- Subsequent uses within the authentication window do not prompt
- This replaces repeated password entry with a single passive biometric confirmation

#### Strategy 3: Background Token Refresh
- The app proactively refreshes tokens in the background before they expire
- Push notifications from the backend can trigger a refresh cycle
- The user never encounters an expired token during active use

#### Strategy 4: Session Continuity with Device Trust
- If the device passes integrity attestation and the refresh token is valid, the session continues
- Re-authentication is only required when:
  - Refresh token expires
  - Device trust state changes (e.g., jailbreak detected, MDM compliance lost)
  - A sensitive operation triggers step-up authentication
  - Maximum session lifetime is reached (policy-driven, e.g., 8 hours)

### 4.8 Authentication Possibilities — Complete Landscape

| Method | Description | Assurance Level | Pros | Cons | GC Applicability |
|--------|-------------|----------------|------|------|-----------------|
| **OIDC + PKCE** | Standard browser-based OIDC flow with PKCE | Moderate | Well-understood, standard, broad library support | User leaves app for system browser auth | ✅ Baseline for all apps |
| **OIDC + PKCE + DPoP** | OIDC with proof-of-possession tokens | High | Token theft is mitigated; device-bound | Requires HSM integration; more complex | ✅ Recommended for sensitive apps |
| **OIDC + PKCE + DPoP + mTLS** | Full mutual TLS plus token binding | Very High | Three-layer verification; payload encrypted end-to-end | Certificate management overhead; MDM dependency | ✅ Required for Protected B |
| **FIDO2 / WebAuthn (Passkeys)** | Passwordless hardware-key authentication | Very High | Phishing-resistant; no shared secrets; hardware-backed | GC IdP must support FIDO2; passkey provisioning needed | ⚠️ Emerging — pilot recommended |
| **Certificate-Based Authentication (CBA)** | User authenticates with a personal smart card / derived credential | Very High | Strong assurance; aligned with existing GC PKI | Requires smart card infrastructure; poor mobile UX | ⚠️ Limited — for high-assurance roles |
| **SMS OTP (MFA factor)** | One-time code via SMS | Low | Simple; widely available | SIM-swap vulnerable; real-time phishing; NIST discourages for high assurance | ❌ Discouraged |
| **Push-based MFA** | Approve/deny notification on a registered device | Moderate | Better UX than OTP; harder to phish than SMS | Push fatigue attacks; requires separate registered device | ⚠️ Acceptable as one factor |
| **TOTP (Authenticator App)** | Time-based one-time password | Moderate | Offline-capable; no carrier dependency | Shared secret can be extracted from authenticator backup; phishable in real-time | ⚠️ Acceptable as one factor |
| **Biometric (Local)** | Face ID / Touch ID to gate local key access | Complementary | Fast, intuitive, non-transferable | Not a remote authentication method; only gates local key usage | ✅ Combine with token storage |

---

## 5. WebView Shell vs. Locally-Hosted Application — Security Analysis

This section provides a detailed comparison between two architectures:

**Architecture A — WebView Shell:** A native app containing a full-screen `WKWebView` / `WebView` that loads a remotely hosted web application (e.g., `https://app.service.canada.ca`).

**Architecture B — Local React Native App:** A React Native application where all HTML, JavaScript, and application logic is bundled into the binary and runs locally on the device.

| Security Dimension | WebView Shell (Remote) | React Native (Local) | Risk Delta |
|-------------------|----------------------|---------------------|------------|
| **Code Origin** | Downloaded at runtime from remote server | Bundled at build time, signed and distributed via app stores | **Critical** — Remote code cannot be verified at runtime |
| **Code Integrity** | No guarantee — CDN compromise or MITM injects code | App store code signing + binary integrity verification | **Critical** |
| **Token Storage** | `localStorage` / cookies — software-only, extractable | Keychain / Keystore via native modules — hardware-backed | **Critical** |
| **XSS Vulnerability** | Full exposure — any reflected/stored XSS in the web app compromises the WebView session | No DOM-based web context; React Native renders native views | **High** |
| **JavaScript Injection** | `evaluateJavaScript()` can inject arbitrary code into the WebView | JS bundle is static; no runtime injection vector (if CodePush is disabled) | **High** |
| **Network Dependency** | App is non-functional offline; degraded service on poor networks | Full offline capability for cached data and UI; API calls for new data | **Medium** |
| **Certificate Pinning** | Extremely difficult in WebView — system TLS stack is used | Achievable via native modules (`react-native-ssl-pinning`) | **High** |
| **Deep Linking / URL Schemes** | WebView URL handling can be manipulated to navigate to malicious sites | React Native navigation is internal; external URLs require explicit handling | **Medium** |
| **Cookie Security** | WebView cookies are shared with the system cookie jar; accessible to debuggers | No cookie layer; tokens managed in native encrypted storage | **High** |
| **Content Security Policy** | CSP headers help but are bypassable if attacker controls the response | Not applicable — no web content to protect | **Low** |
| **Device API Access** | Limited to what `WKWebView` / `WebView` exposes via bridge | Full native API access via native modules | **Medium** |
| **Debugging / Inspection** | Safari/Chrome DevTools can inspect WebView content in debug builds; some access on rooted devices in production | React Native Hermes bytecode is harder to debug; native modules are compiled | **Medium** |
| **Regulatory Compliance** | Difficult to demonstrate code integrity for security assessments | Build artifacts are auditable; SBOM generation is standard | **High** |

### Verdict

For any GC application that handles personal information, Protected A, or Protected B data:

> **WebView shell applications do not meet the minimum security requirements.** The inability to guarantee code integrity, protect tokens in hardware, or resist injection attacks makes this architecture unsuitable.

A locally-bundled React Native application or a fully native application should be used instead.

---

## 6. Cross-Cutting Concerns

### 6.1 Logging

Logging in a mobile context differs fundamentally from server-side logging. Logs reside on a user's device and must be treated with extreme sensitivity.

| Aspect | Guidance |
|--------|----------|
| **What to Log** | App lifecycle events, authentication success/failure, API call results (status codes only), navigation events, crash data, performance metrics. |
| **What NOT to Log** | Tokens, credentials, PII, request/response bodies, user input, biometric data, device identifiers that could enable tracking. |
| **Storage** | Logs must be encrypted at rest. Use OS-provided encrypted storage. Implement log rotation with maximum retention (e.g., 7 days on-device). |
| **Exfiltration Protection** | Logs must not be extractable from the device without the app's cooperation. On non-managed devices, logs should be encrypted with an app-specific key. |
| **Remote Collection** | For centralized observability, logs should be transmitted to the backend over mTLS channels. Collection must comply with GC privacy requirements. User consent may be required. |
| **Structured Format** | Use structured logging (JSON) with consistent fields: timestamp (ISO 8601), correlation ID, severity, component, event type. |

**Platform Comparison:**

| Feature | Native iOS | Native Android | React Native |
|---------|-----------|---------------|--------------|
| OS-level logging | `os_log` with privacy annotations | `Log` (filtered in release) | `console.log` (must be stripped) |
| Crash reporting | MetricKit, native crash handlers | `Thread.UncaughtExceptionHandler` | Requires native crash handler bridge |
| Log encryption | Straightforward with CryptoKit | Straightforward with Jetpack Security | Requires native module |
| Privacy annotations | `os_log` supports `%{private}` | Manual redaction required | Manual redaction required |

### 6.2 Auditing

Auditing captures **who did what, when, and from where** for accountability and compliance. Unlike logging, audit records are **immutable, authoritative, and retained long-term**.

| Requirement | Implementation |
|-------------|---------------|
| **Audit Events** | Login, logout, data access, data modification, permission changes, export operations, attestation results. |
| **Audit Fields** | User ID (sub claim), device ID, timestamp, action, resource, outcome, session ID, IP address (captured server-side). |
| **Client-Side Role** | The mobile app generates audit event payloads and transmits them to the backend audit service. The app is NOT the system of record. |
| **Tamper Resistance** | Audit events must be signed with the device's HSM-bound key before transmission. The backend verifies the signature against the registered device public key. |
| **Offline Audit** | Events generated offline must be queued in encrypted storage and transmitted when connectivity is restored, with original timestamps preserved. |
| **Retention** | Audit records retained per GC MITS and departmental retention schedules (typically 2–7 years). |

### 6.3 Distributed Tracing

Distributed tracing correlates a single user operation across the mobile app, API gateway, backend microservices, and data stores.

| Aspect | Implementation |
|--------|---------------|
| **Standard** | W3C Trace Context (`traceparent` / `tracestate` headers) |
| **Trace Initiation** | The mobile app generates a trace ID at the start of each user operation and propagates it through all API calls. |
| **Span Structure** | Mobile app creates spans for: UI interaction → API call → response processing. Backend continues the trace. |
| **Correlation** | Every API request includes `traceparent` header. Backend logs and traces share the same trace ID. |
| **Sensitive Data** | Spans must NOT include PII, tokens, or request/response bodies. |
| **SDK Options** | OpenTelemetry SDKs exist for iOS (swift), Android (kotlin), and JavaScript (React Native). |

**Platform Comparison:**

| Feature | Native iOS | Native Android | React Native |
|---------|-----------|---------------|--------------|
| OTEL SDK maturity | Stable | Stable | Stable (JS SDK) |
| Automatic instrumentation | Network (URLSession) | Network (OkHttp) | Fetch/XMLHttpRequest |
| UI interaction tracing | Manual spans required | Manual spans required | Manual spans required |
| Performance overhead | Low | Low | Low-Medium (bridge calls) |

### 6.4 Authorization

Authorization determines **what an authenticated user is allowed to do**. This is distinct from authentication (which establishes identity).

| Pattern | Description | Pros | Cons |
|---------|-------------|------|------|
| **Token-embedded claims** | Roles/permissions encoded in the access token (JWT claims) | Fast — no network call for authorization decisions; offline-capable | Token bloat; stale permissions until token refresh; limited complexity |
| **Remote policy evaluation** | Each operation queries a Policy Decision Point (PDP) like OPA or Cedar | Fine-grained, real-time, centralized policy management | Network dependency; latency on every decision; single point of failure |
| **Hybrid** | Token claims for broad role checks; remote PDP for sensitive operations | Balanced performance and granularity | More complex implementation |

**Recommendations for GC Mobile:**
- Use **token claims** for basic role-based access (e.g., "is this user an inspector?")
- Use **remote policy evaluation** for sensitive operations (e.g., "can this user export this file from this device at this location?")
- Cache policy decisions locally with a **short TTL** (e.g., 5 minutes) for offline resilience
- Implement **RBAC at minimum**; consider **ABAC** (Attribute-Based Access Control) for complex multi-departmental scenarios

### 6.5 Error Handling and Resilience

| Concern | Practice |
|---------|----------|
| **Error Classification** | Differentiate between recoverable (network timeout), user-actionable (auth expired), and fatal (data corruption) errors. |
| **User-Facing Messages** | Never expose stack traces, server error details, or technical identifiers to the user. Use generic, bilingual error messages with error codes for support reference. |
| **Retry Strategy** | Implement exponential backoff with jitter for transient failures. Circuit breaker pattern for persistent failures. |
| **Offline Mode** | Define explicit offline capabilities. Queue mutations for sync. Clearly indicate stale data to the user. |
| **Crash Recovery** | Persist application state periodically. On restart after crash, restore to last known good state. Never resume a session that may have been compromised by the crash. |

### 6.6 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Cold Start** | < 2 seconds to interactive UI | Time from app launch to first meaningful paint |
| **API Response Handling** | < 200ms for UI update after response | Time from response receipt to UI render |
| **Token Operations** | < 100ms for HSM signing | Time for DPoP proof generation |
| **Memory Footprint** | < 150MB active, < 50MB background | Instruments (iOS) / Profiler (Android) |
| **Battery Impact** | < 5% per hour of active use | System battery profiling tools |
| **Bundle Size** | < 50MB (ideally < 25MB for low-bandwidth users) | App store submission size |

**Platform Comparison:**

| Factor | Native iOS | Native Android | React Native |
|--------|-----------|---------------|--------------|
| Cold start time | Fastest | Fast | Slower (JS engine init) |
| Crypto operations | Direct HSM | Direct HSM | Bridge overhead (50-200ms added) |
| Memory efficiency | Best | Good | Higher (JS engine + native) |
| UI rendering | 60fps native | 60fps native | 60fps (new arch); drops on complex lists |
| Bundle size | Smallest | Small | Larger (JS engine + bundle) |

### 6.7 Testability

| Test Level | Description | Tools |
|------------|-------------|-------|
| **Unit Tests** | Business logic, data transformation, state management | XCTest (iOS), JUnit (Android), Jest (RN) |
| **Integration Tests** | Native module interfaces, API client behavior, token flows | XCTest (iOS), AndroidX Test (Android), Detox/Appium (RN) |
| **UI Tests** | User flows, accessibility compliance, localization | XCUITest (iOS), Espresso (Android), Detox (RN) |
| **Security Tests** | Frida scripts for runtime analysis, MobSF for static analysis, certificate pinning verification | Platform-independent tools |
| **Performance Tests** | Cold start, memory leaks, CPU profiling | Instruments (iOS), Android Profiler, Flipper (RN) |
| **Penetration Tests** | OWASP MASTG (Mobile Application Security Testing Guide) | Burp Suite, Frida, objection |

**Platform Comparison:**

| Aspect | Native iOS | Native Android | React Native |
|--------|-----------|---------------|--------------|
| Unit test maturity | Excellent | Excellent | Excellent (Jest) |
| UI test reliability | Very good (XCUITest) | Good (Espresso) | Moderate (Detox — flaky on CI) |
| Security test tooling | Rich (native binary analysis) | Rich (APK decompilation) | Complex (JS bundle + native) |
| CI/CD integration | Xcode Cloud, Fastlane | Gradle, Fastlane | Expo EAS, Fastlane |
| Test isolation | Excellent | Excellent | Moderate (bridge side effects) |

### 6.8 Scalability

Scalability for mobile apps is primarily a **backend concern**, but the mobile app architecture influences scalable behavior:

| Dimension | Mobile App Responsibility |
|-----------|--------------------------|
| **User Base Growth** | App should not assume backend topology. Use API versioning and feature flags for progressive rollout. |
| **Data Volume** | Implement pagination (cursor-based preferred). Avoid loading unbounded data sets. Cache with eviction policies. |
| **Concurrent Operations** | Use background processing for uploads/downloads. Don't block the main thread with synchronous network calls. |
| **Multi-Tenancy** | If the app serves multiple GC departments, ensure tenant isolation in local storage, configuration, and API routing. |
| **Push Notifications** | Use APNs (iOS) and FCM (Android) or a unified service. Design for notification at scale without thundering herd on backend. |
| **Release Scalability** | Automated CI/CD pipelines with staged rollouts (1% → 10% → 50% → 100%). Feature flags for server-driven capability exposure. |

### 6.9 Accessibility (WCAG / GC Standard on Accessible ICT)

GC applications must comply with **WCAG 2.1 AA** and the **GC Standard on Accessible ICT**.

| Requirement | Native iOS | Native Android | React Native |
|-------------|-----------|---------------|--------------|
| Screen reader support | VoiceOver (built-in) | TalkBack (built-in) | AccessibilityInfo + native mapping |
| Dynamic type / font scaling | Full support | Full support | Partial (requires explicit implementation) |
| Color contrast | Xcode Accessibility Inspector | Android Accessibility Scanner | Manual verification |
| Keyboard / switch control | Full platform support | Full platform support | Inconsistent across custom components |
| Automated accessibility testing | XCUITest + accessibility audits | Espresso + AccessibilityChecks | Limited automated tooling |

**React Native caveat:** Custom components (non-native) require explicit accessibility props (`accessible`, `accessibilityLabel`, `accessibilityRole`). Native platform components have accessibility built in.

### 6.10 Localization (Official Languages)

All GC applications must support **English and French** as per the Official Languages Act.

| Concern | Practice |
|---------|----------|
| **String Externalization** | All user-facing strings must be in localization files (`.strings`/`.stringsdict` on iOS, `strings.xml` on Android, i18n JSON for RN). |
| **Layout Flexibility** | French text is typically 15–30% longer than English. UI must accommodate variable text length without truncation. |
| **Date/Time/Number Formatting** | Use `Locale`-aware formatters. Never hardcode date formats. |
| **Accessibility + Localization** | `accessibilityLabel` values must also be localized. |
| **RTL Consideration** | While not required for EN/FR, if the app will serve Indigenous languages or other scripts, RTL layout support should be architecturally considered. |

### 6.11 Data Sovereignty and Privacy

| Requirement | Implementation |
|-------------|---------------|
| **Data Residency** | All backend services must be hosted within Canada. API endpoints must resolve to Canadian data centers. |
| **On-Device Data** | Minimize data stored on device. Encrypt all local data at rest. Implement remote wipe capability (via MDM or app-level). |
| **Privacy Impact Assessment** | Required before deployment. Mobile-specific considerations: device telemetry, location data, biometric data processing. |
| **Data Minimization** | Collect only what is necessary. Do not cache sensitive data beyond session requirements. |
| **Consent** | If collecting analytics or telemetry beyond essential functionality, user consent must be obtained with clear bilingual explanation. |

### 6.12 Configuration Management

| Concern | Practice |
|---------|----------|
| **No Hardcoded Secrets** | API keys, client IDs, endpoints — none should be hardcoded in the binary. Use build-time injection or remote configuration. |
| **Environment Separation** | Dev, Staging, Production configurations must be isolated. Build variants / schemes for each. |
| **Remote Configuration** | Feature flags and non-sensitive configuration can be fetched from a secure remote config service. Cached locally with TTL. |
| **Build Reproducibility** | Builds must be reproducible from source for audit. Pin all dependency versions. Use lockfiles. |

### 6.13 Dependency and Supply-Chain Security

| Concern | Native iOS/Android | React Native |
|---------|-------------------|--------------|
| **Package Ecosystem** | CocoaPods/SPM (iOS), Maven/Gradle (Android) — smaller, curated | npm — massive, higher risk of typosquatting and malicious packages |
| **Dependency Count** | Typically 10–30 direct dependencies | Typically 30–100+ direct dependencies (each with transitive deps) |
| **SBOM Generation** | Standard tooling available | Standard tooling available (CycloneDX, SPDX) |
| **Vulnerability Scanning** | Dependabot, Snyk | Dependabot, Snyk, `npm audit` |
| **Lock Files** | `Podfile.lock`, Gradle dependency locking | `package-lock.json` / `yarn.lock` — must be committed |
| **Integrity Verification** | Package signatures (SPM, Maven Central) | npm package provenance (partial adoption) |

**Recommendation:** For GC applications, maintain a **curated allow-list** of approved dependencies. Conduct security review of any new dependency before inclusion. Automate vulnerability scanning in CI/CD.

---

## 7. Security Controls Comparison — Native vs. React Native vs. WebView

| Security Control | Native iOS (Swift) | Native Android (Kotlin) | React Native | WebView Shell |
|-----------------|-------------------|------------------------|--------------|---------------|
| **Secure Enclave / StrongBox** | ✅ Direct API | ✅ Direct API | ⚠️ Native module required | ❌ Not accessible |
| **Certificate Pinning** | ✅ `URLSession` delegate | ✅ Network Security Config + OkHttp | ⚠️ Native module | ❌ Not feasible |
| **App Attestation** | ✅ App Attest (DeviceCheck) | ✅ Play Integrity API | ⚠️ Native module | ❌ Not possible |
| **Jailbreak / Root Detection** | ✅ Native checks | ✅ SafetyNet / Play Integrity | ⚠️ Native module | ❌ Not possible |
| **Code Obfuscation** | ✅ Compiled binary; symbols strippable | ✅ ProGuard / R8 | ⚠️ Hermes bytecode (less effective) | ❌ Plain JavaScript |
| **Anti-Tampering** | ✅ Code signing verification at OS level | ✅ APK signature verification | ⚠️ Code signing applies to native shell only; JS bundle can be modified on jailbroken devices | ❌ No local integrity |
| **Biometric Gate for Keys** | ✅ `SecAccessControl` with biometry | ✅ `setUserAuthenticationRequired` | ⚠️ Via native module bridge | ❌ Not available |
| **Secure IPC** | ✅ App Groups with encryption | ✅ Content Providers with permissions | ⚠️ Depends on implementation | ❌ Not applicable |
| **Screenshot / Screen Recording Prevention** | ✅ `UITextField.isSecureTextEntry`, scene delegate | ✅ `FLAG_SECURE` | ⚠️ Native module | ❌ Not possible |
| **Clipboard Protection** | ✅ `UIPasteboard` with expiration (iOS 16+) | ✅ `ClipboardManager` with flags | ⚠️ Native module | ❌ Web clipboard API only |
| **Debugger Detection** | ✅ `sysctl` / `ptrace` checks | ✅ Debug.isDebuggerConnected() | ⚠️ Native module | ❌ Not possible |
| **Runtime Integrity** | ✅ Binary is verified by OS on every launch | ✅ APK integrity on install | ⚠️ JS bundle integrity must be manually verified | ❌ No runtime integrity |
| **Network Traffic Inspection Resistance** | ✅ Custom URLProtocol + pinning | ✅ Custom TrustManager + pinning | ⚠️ Achievable with native modules | ❌ System proxy is used |

**Key Insight:** React Native can achieve **most** of the security controls available to native platforms, but every security-critical capability requires a native module bridge. This means:

1. The development team must have **native iOS and Android expertise** in addition to React Native skills
2. Each security feature is a **custom integration** rather than a platform-provided capability
3. The security surface area is **larger** because both the JS layer and the native bridge must be secured

If the team does not have native mobile expertise, React Native's security posture will be significantly weaker than a native implementation.

---

## 8. Decision Tree — Selecting the Right Architecture

```
START: What is the data classification?
│
├─── Protected B or higher
│    │
│    ├─── Do you have native iOS + Android developers?
│    │    ├── YES → Native iOS (Swift) + Native Android (Kotlin)
│    │    │         [Maximum security controls, direct HSM access,
│    │    │          app attestation, no JS bridge attack surface]
│    │    │
│    │    └── NO → React Native with mandatory native security modules
│    │              [Custom native modules for: HSM key management,
│    │               DPoP proof generation, mTLS, app attestation,
│    │               jailbreak detection. Requires native expertise
│    │               for security-critical components.]
│    │
│    └─── ⛔ DO NOT USE WebView Shell
│
├─── Protected A
│    │
│    ├─── Is offline capability critical?
│    │    ├── YES → React Native or Native
│    │    │         [Local data storage with encryption, background
│    │    │          sync, offline-first architecture]
│    │    │
│    │    └── NO → React Native (recommended for cost efficiency)
│    │              [Standard OIDC + PKCE + DPoP, Keychain/Keystore
│    │               via react-native-keychain]
│    │
│    └─── ⛔ DO NOT USE WebView Shell
│
├─── Unclassified (Public-facing informational app)
│    │
│    ├─── Does the app require authentication?
│    │    ├── YES → React Native with standard OIDC + PKCE
│    │    └── NO  → React Native or Progressive Web App (PWA)
│    │
│    └─── WebView hybrid MAY be acceptable (with informed risk acceptance)
│
└─── Questions to ask for any path:
     │
     ├── Q1: What is the user base size? (hundreds vs. millions)
     │   → Influences backend scalability and push notification architecture
     │
     ├── Q2: What devices are supported? (GC-managed only vs. BYOD)
     │   → Managed devices enable mTLS via MDM-provisioned certificates
     │   → BYOD requires alternative device attestation (App Attest / Play Integrity)
     │
     ├── Q3: What is the expected offline duration?
     │   → Extended offline needs local encrypted database + sync strategy
     │
     ├── Q4: What is the maintenance budget?
     │   → Two native codebases = ~2x maintenance; RN = ~1.3x vs single web app
     │
     ├── Q5: Are there existing native development teams?
     │   → Leveraging existing capability reduces risk and ramp-up time
     │
     └── Q6: What is the deployment model?
         → Public app stores vs. enterprise MDM distribution vs. both
```

### Decision Summary Table

| Scenario | Recommended Platform | Rationale |
|----------|---------------------|-----------|
| High-assurance, Protected B, managed devices | Native iOS + Native Android | Maximum security controls, direct HSM, app attestation |
| High-assurance, Protected B, BYOD | Native or React Native + native security modules | Device attestation replaces MDM-provisioned certs |
| Standard internal app, Protected A | React Native | Cost-efficient; security achievable with native modules |
| Public-facing informational | React Native or PWA | Widest reach; minimal security requirements |
| Field app with extended offline | Native (preferred) or React Native | Complex sync + crypto operations benefit from native perf |
| App requiring frequent iteration | React Native | Faster development cycle; shared codebase |

---

## 9. Recommendations and Next Steps

### Immediate Actions

1. **Establish a GC Mobile Security Baseline**
   - Define minimum security requirements per data classification
   - Mandate OIDC + PKCE + DPoP for all new mobile applications
   - Prohibit WebView shell architecture for any app handling sensitive data
   - Require hardware-backed key storage on all supported devices

2. **Create a Shared Security Module Library**
   - Whether choosing native or React Native, build (or procure) a shared library of security primitives:
     - HSM key generation and signing
     - DPoP proof generation
     - mTLS client certificate handling
     - Device attestation (App Attest / Play Integrity)
     - Jailbreak/root detection
   - This library should be maintained centrally and consumed by all GC mobile projects

3. **Develop a Mobile Threat Model Template**
   - Based on OWASP MASTG and STRIDE, create a GC-specific threat model template
   - Include GC-specific threats: cross-border device usage, official languages requirements, GC IdP integration

4. **Pilot FIDO2 / Passkeys**
   - Engage with the GC IdP team to pilot FIDO2 / Passkey support
   - This is the most significant usability + security improvement on the horizon
   - Eliminates passwords entirely; hardware-bound; phishing-resistant

### Architecture Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Assume the device is compromised** | Design all security controls to be resilient to a rooted/jailbroken device. Defense-in-depth, not perimeter-only. |
| 2 | **Never trust the client** | All authorization decisions must be validated server-side. Client-side checks are for UX only. |
| 3 | **Hardware-bind all secrets** | Every cryptographic key and credential must be stored in the platform's hardware security module. Software-only key storage is unacceptable. |
| 4 | **Minimize on-device data** | Store the minimum data required for functionality. Treat the device as a transient view into backend data, not a data store. |
| 5 | **Log everything, expose nothing** | Comprehensive observability with strict PII/credential redaction. |
| 6 | **Build for both languages from day one** | Retrofitting localization is expensive. String externalization and flexible layout must be in the initial architecture. |
| 7 | **Test security continuously** | Automated security testing (SAST, DAST, dependency scanning) in CI/CD. Periodic OWASP MASTG assessments. |
| 8 | **Plan for offline** | Even if offline is not a V1 requirement, the data layer should support it. Retrofitting offline sync is architecturally disruptive. |

---

## 10. Appendix — Glossary and References

### Glossary

| Term | Definition |
|------|-----------|
| **DPoP** | Demonstrating Proof-of-Possession — RFC 9449. Mechanism to bind access tokens to a client's public key. |
| **HSM** | Hardware Security Module — dedicated hardware for cryptographic operations and key storage. On mobile: Secure Enclave (iOS), StrongBox/TEE (Android). |
| **mTLS** | Mutual TLS — both client and server present certificates during the TLS handshake. |
| **PKCE** | Proof Key for Code Exchange — RFC 7636. Mitigates authorization code interception in public clients. |
| **OIDC** | OpenID Connect — identity layer built on OAuth 2.0/2.1. Provides ID tokens and standard claims. |
| **GC IdP** | Government of Canada Identity Provider — the enterprise identity service for federal authentication. |
| **MASTG** | Mobile Application Security Testing Guide — OWASP's comprehensive mobile security testing methodology. |
| **App Attest** | Apple's API for generating a hardware-backed assertion that the app is genuine and unmodified. |
| **Play Integrity** | Google's API for verifying app and device integrity on Android. |
| **RBAC** | Role-Based Access Control — permissions assigned to roles, users assigned to roles. |
| **ABAC** | Attribute-Based Access Control — permissions based on attributes of user, resource, action, and context. |
| **COPE** | Corporate-Owned, Personally-Enabled — MDM deployment model where the organization owns the device. |
| **BYOD** | Bring Your Own Device — user-owned device accessing organizational resources. |
| **FIDO2** | Fast IDentity Online 2 — passwordless authentication standard using public-key cryptography. |

### References

- OAuth 2.1 — RFC 9700 (draft consolidated from RFC 6749 + best practices)
- DPoP — RFC 9449
- PKCE — RFC 7636
- OpenID Connect Core — https://openid.net/specs/openid-connect-core-1_0.html
- OWASP Mobile Application Security Testing Guide (MASTG)
- OWASP Mobile Application Security Verification Standard (MASVS)
- Apple Secure Enclave Documentation
- Android Keystore System Documentation
- GC Standard on Accessible ICT
- Treasury Board Policy on Service and Digital
- CCCS — Canadian Centre for Cyber Security Guidance
- NIST SP 800-63B — Digital Identity Guidelines: Authentication and Lifecycle Management
- W3C Trace Context — https://www.w3.org/TR/trace-context/

---

*This document is a living guide. It should be reviewed and updated as GC identity infrastructure evolves, new platform security features emerge, and threat landscapes change.*
