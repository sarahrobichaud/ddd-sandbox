import { PresencePreview } from "@cavok/widgets/components/presence-preview";
import { withForm } from "~/utils/form-utils";
import { usePresenceFormOptions } from "../hooks/use-presence-step";
import { VALUE } from "@cavok/core/values";
import type { Username } from "@cavok/core/contracts/auth.contracts";
import { useTranslation } from "react-i18next";
import SecondaryHeading from "@cavok/ui/components/typography/secondary-heading";
import Lead from "@cavok/ui/components/typography/lead";

export const OnboardingPresenceStepForm = withForm({
  ...usePresenceFormOptions(),
  props: {
    username: {
      value:'',
      discriminator: ''
    } satisfies Username
  },
  render: function Render({ form, username}) {

    const {t} = useTranslation(undefined,{keyPrefix: "modules.onboarding.presenceStep.content"});

    return (
      <div className="space-y-6">
        <div>
          <SecondaryHeading>{t('title')}</SecondaryHeading>
          <Lead>
            {t('description')}
          </Lead>
        </div>

        {/* Two-column layout: Form on left, Preview on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <form className="space-y-8" onSubmit={form.handleSubmit}>
            {/* Personal Identity Section */}
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Personal Identity</h4>
                <p className="text-xs text-muted-foreground">How you'll appear to others</p>
              </div>
              {/* Display Name with custom InputGroup */}
              <form.AppField
                name="presenceData.displayName"
                children={(field) => (
                  <field.DisplayNameField
                    name="presenceData.displayName"
                    label={t('form.fields.displayName.label')}
                    hint={t('form.fields.displayName.hint')}
                    placeholder={t('form.fields.displayName.placeholder')}
                    required={true}
                    type="text"
                    errors={field.state.meta.errors?.map((e) => String(e)) || []}
                    username={{
                      copy: () => {
                        if (username.value) {
                          field.handleChange(username.value);
                        }
                      },
                      value: username.value ?? "",
                    }}
                  />
                )}
              />
              {/* First and Last Name Grid */}
              <div className="grid grid-cols-2 gap-4">
                <form.AppField
                  name="presenceData.firstName"
                  children={(field) => {
                    const clientErrors = field.state.meta.errors?.map((e) => String(e)) || [];
                    return (
                      <field.InputField
                        name="presenceData.firstName"
                        label={t('form.fields.firstName.label')}
                        placeholder={t('form.fields.firstName.placeholder')}
                        required={false}
                        type="text"
                        errors={clientErrors}
                      />
                    );
                  }}
                />

                <form.AppField
                  name="presenceData.lastName"
                  children={(field) => {
                    const clientErrors = field.state.meta.errors?.map((e) => String(e)) || [];
                    return (
                      <field.InputField
                        name="lastName"
                        label={t('form.fields.lastName.label')}
                        placeholder={t('form.fields.lastName.placeholder')}
                        required={false}
                        type="text"
                        errors={clientErrors}
                      />
                    );
                  }}
                />
              </div>

              <form.AppField
                name="presenceData.pronouns"
                children={(field) => (
                  <field.PronounsField
                    name="presenceData.pronouns"
                    label={t('form.fields.pronouns.label')}
                    placeholder={t('form.fields.pronouns.placeholder')}
                    required={false}
                  />
                )}
              />
            </div>

            {/* Flight Information Section */}
            <div className="space-y-5 pt-5 border-t">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{t("form.section.generalInfo.title")}</h4>
                <p className="text-xs text-muted-foreground">{t('form.section.generalInfo.description')}</p>
              </div>
              <form.AppField
                name="presenceData.experienceLevel"
                children={(field) => {
                  return (
                    <field.SelectField
                      label={t('form.fields.experienceLevel.label')}
                      placeholder="fe"
                      name="presenceData.experienceLevel"
                      hint={(value) => t(`form.fields.experienceLevel.${value}.hint`)}
                      required={true}
                      options={VALUE.SKILL_LEVEL_LIST.map(skill => ({
                        label: t(`form.fields.experienceLevel.${skill}.label`),
                        value: VALUE.SKILL_LEVEL[skill]
                      }))}
                    />
                  );
                }}
              />

              <form.AppField
                name="presenceData.homeAirport"
                children={(field) => {
                  const clientErrors = field.state.meta.errors?.map((e) => String(e)) || [];
                  return (
                    <field.AirportField
                      placeholder={t('form.fields.homeAirport.placeholder')}
                      hint={t('form.fields.homeAirport.hint')}
                      name="homeAirport"
                      label={t('form.fields.homeAirport.label')}
                      required={false}
                      type="text"
                      errors={clientErrors}
                    />
                  );
                }}
              />
            </div>

            <form.Field name="userId">
              {(field) => <input type="hidden" name={field.name} value={field.state.value} />}
            </form.Field>
          </form>

          {/* Preview Section - Sticky on desktop */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <form.Subscribe selector={(state) => state.values.presenceData}>
              {(presenceData) => <PresencePreview data={{...presenceData, username}} />}
            </form.Subscribe>
          </div>
        </div>
      </div>
    );
  },
});
