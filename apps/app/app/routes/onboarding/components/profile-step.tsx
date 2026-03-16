import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@cavok/ui/components/shad/input";

import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@cavok/ui/components/shad/input-group";
import { Label } from "@cavok/ui/components/shad/label";
import { Lead, SecondaryHeading } from "@cavok/ui/typography";
import { useUsername } from "~/data/store/auth-store";
import { useState } from "react";

export type ProfileFormData = {
  pronouns: string;
  displayName: string;
  firstName: string;
  lastName: string;
};

export interface ProfileStepProps {
  onDataChange?: (data: ProfileFormData, isValid: boolean) => void;
  defaultValues?: Partial<ProfileFormData>;
}

export function ProfileStep({ onDataChange, defaultValues }: ProfileStepProps) {
  const form = useForm({
    defaultValues: defaultValues ?? {
      pronouns: "",
      displayName: "",
      firstName: "",
      lastName: "",
    },
  });
  const username = useUsername();
  const handleUseUsername = () => {
    // You can replace this with actual logic to get username from auth context
    form.setFieldValue("displayName", username);
  };

  // Expose form data and validation state to parent
  React.useEffect(() => {
    if (onDataChange) {
      const unsubscribe = form.store.subscribe(() => {
        const state = form.store.state;
        const data = state.values as ProfileFormData;

        // Check if all fields are valid
        const fieldStates = Object.values(state.fieldMeta);
        const hasErrors = fieldStates.some((meta: any) => meta.errors && meta.errors.length > 0);
        const isValid =
          !hasErrors &&
          data.displayName.length >= 3 &&
          data.displayName.length <= 30 &&
          data.firstName.length > 0 &&
          data.lastName.length > 0;
        onDataChange(data, isValid);
      });
      return unsubscribe;
    }
  }, [form, onDataChange]);

  return (
    <div className="space-y-6">
      <SecondaryHeading>Create Your Presence</SecondaryHeading>
      <p className="text-muted-foreground">This information will be visible to other users. You can change it later.</p>

      <div className="flex gap-16">
        <form className="space-y-4 flex-1">
          <div className="flex gap-4">
            <form.Field name="displayName">
              {(field) => (
                <div className="space-y-2 flex-1">
                  <Label htmlFor="displayName">Display Name</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="displayName"
                      placeholder="Display Name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton onClick={handleUseUsername}>Copy Username</InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              )}
            </form.Field>
            <form.Field name="pronouns">
              {(field) => (
                <div className="space-y-2 flex-1">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    placeholder="Pronouns"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <div className="space-y-4">
            <form.Field name="firstName">
              {(field) => (
                <div className="space-y-2 flex-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="lastName">
              {(field) => (
                <div className="space-y-2 flex-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </form>
        <div className="flex-1">
          <Lead className="mb-4">How you will be seen by others</Lead>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {/* Avatar preview (use initials) */}
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-foreground">
                  {form.store.state.values.displayName
                    ? form.store.state.values.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-lg">{form.store.state.values.displayName || "Display Name"}</div>
                <div className="text-sm text-muted-foreground">
                  {form.store.state.values.firstName || "First Name"} {form.store.state.values.lastName || "Last Name"}
                </div>
                {form.store.state.values.pronouns && (
                  <div className="text-xs text-muted-foreground">{form.store.state.values.pronouns}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
