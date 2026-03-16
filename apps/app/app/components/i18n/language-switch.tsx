import { useTranslation } from "react-i18next"
import { SelectControl } from "@cavok/ui/components/control/select"

export function LanguageSwitch() {

    const values = ['en', 'fr'] as const

    const {t, i18n} = useTranslation();

    return <SelectControl
        name="Switch Language"
        options={values.map(lang => ({
            label: t(`components.languageSwitcher.locale.${lang}`),
            value: lang
        }))} placeholder={""} required={false} value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)} label={""}    />
}