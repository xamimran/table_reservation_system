import { useIntl } from "react-intl";

export const useTranslations = () => {
  const intl = useIntl();

  const t = (id: string, values = {}) => {
    return intl.formatMessage({ id }, values);
  };

  return t;
};
