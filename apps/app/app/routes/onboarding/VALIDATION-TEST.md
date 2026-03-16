# Onboarding Stepper - Validation Flow Testing

## Overview

This document describes the validation flow for the onboarding stepper and how to test it.

## Validation Architecture

### Component Hierarchy

```
OnboardingStepper (Widget)
└── Steps Configuration (App)
    ├── WelcomeStep (No validation)
    ├── ProfileStep (Form validation via @tanstack/react-form)
    ├── PreferencesStep (Form validation via @tanstack/react-form)
    └── CompleteStep (No validation)
```

## Validation Flow

### Step 1: Welcome

- **Validation**: None required
- **Behavior**: User can proceed immediately
- **Test**: Click "Continue" button - should proceed to Profile step

### Step 2: Profile

- **Validation**: Real-time form validation using Tanstack Form field validators
- **Required Fields**:

  - `displayName`: 3-30 characters, alphanumeric + hyphens/underscores only
  - `firstName`: Required, min 1 character
  - `lastName`: Required, min 1 character
  - `email`: Valid email format

- **Test Cases**:
  1. **Initial State**: Continue button should be disabled/fail validation
  2. **Invalid Display Name**:
     - Enter "ab" → Should show error (too short)
     - Enter "hello world" → Should show error (invalid characters)
  3. **Invalid Email**:
     - Enter "notanemail" → Should show error
     - Enter "test@example.com" → Should be valid
  4. **Complete Valid Form**:
     - Fill all fields correctly → Continue button should allow proceeding
  5. **Back Navigation**:
     - Go back to Welcome, then return → Data should persist

### Step 3: Preferences

- **Validation**: Form validation via Tanstack Form field validators
- **Required Fields**:
  - `timezone`: Must select a timezone
- **Optional Fields**:

  - `emailNotifications`: Boolean (default: true)
  - `flightAlerts`: Boolean (default: true)
  - `marketingEmails`: Boolean (default: false)

- **Test Cases**:
  1. **Initial State**: Continue button should fail validation (no timezone selected)
  2. **Select Timezone**: Choose any timezone → Should enable validation
  3. **Toggle Notifications**: Checkboxes should work and persist
  4. **Back Navigation**: Go back to Profile → Data should persist

### Step 4: Complete

- **Validation**: None required
- **Behavior**: Finish button completes onboarding and navigates to home
- **Test**: Click "Complete Setup" → Should redirect to home page

## Error Handling

### Validation Error Display

1. **Field-Level Errors**:

   - Displayed below each input field
   - Red text color (destructive variant)
   - Powered by FormMessage component

2. **Step-Level Errors**:

   - Step indicator shows error state (red border)
   - Validation prevents proceeding to next step

3. **User Feedback**:
   - Button shows "Validating..." during async validation
   - Error messages are clear and actionable

## Data Persistence

### State Management

- Profile data stored in `profileData` state
- Preferences data stored in `preferencesData` state
- Validation status tracked in refs (`profileValidRef`, `preferencesValidRef`)

### Navigation Behavior

- **Forward**: Only allowed if current step passes validation
- **Backward**: Always allowed, data persists
- **Re-entry**: Previous data pre-populated in forms

## Integration Points

### OnboardingStepper Widget

- Manages step navigation state
- Executes validation callbacks
- Controls progress indicator
- Handles completion callback

### Step Components

- Expose validation state via callbacks
- Use Tanstack Form for field validation
- Field-level validators using inline functions

## Manual Testing Checklist

- [ ] Can load onboarding page at /onboarding
- [ ] Welcome step displays correctly
- [ ] Can proceed from Welcome without entering data
- [ ] Profile step shows all form fields
- [ ] Profile validation prevents invalid submissions
- [ ] Profile validation allows valid submissions
- [ ] Can navigate back from Profile to Welcome
- [ ] Profile data persists when navigating back/forward
- [ ] Preferences step shows all form fields
- [ ] Preferences validation requires timezone selection
- [ ] Preferences checkboxes work correctly
- [ ] Can navigate back from Preferences to Profile
- [ ] Preferences data persists when navigating back/forward
- [ ] Complete step shows success message
- [ ] Finish button redirects to home page
- [ ] Console logs show correct data on completion

## Validation Logic Summary

```typescript
// Welcome Step
validate: async () => true;

// Profile Step
validate: async () => profileValidRef.current && profileData !== null;

// Preferences Step
validate: async () => preferencesValidRef.current && preferencesData !== null;

// Complete Step
validate: async () => true;
```

## Success Criteria

✅ All validation rules enforced
✅ User cannot skip steps without valid data
✅ Data persists across navigation
✅ Clear error messages displayed
✅ Smooth user experience with loading states
✅ Final data correctly passed to completion handler
