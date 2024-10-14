import React from "react";
import { useTranslations } from "@/app/hooks/useTranslations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Book,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  PawPrint,
} from "lucide-react";

export function PolicyModal() {
  const t = useTranslations();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer mt-4 transition-colors duration-200">
          {t("BookingPolices")}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-xl">
        <DialogHeader className="p-6 bg-white rounded-t-xl border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {t("BookingPolices")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {t("instructions")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="space-y-6">
            <PolicySection
              icon={<Book className="w-6 h-6 text-blue-500" />}
              title={t("greeting")}
              content={
                <>
                  <p className="font-medium">{t("thanks")}</p>
                  <p>{t("instructions")}</p>
                </>
              }
            />
            <PolicySection
              icon={<CreditCard className="w-6 h-6 text-green-500" />}
              title={t("credit_card_policy")}
              content={<p>{t("credit_card_policy")}</p>}
            />
            <PolicySection
              icon={<Clock className="w-6 h-6 text-yellow-500" />}
              title={t("duration_delays_title")}
              content={<p>{t("duration_delays_text")}</p>}
            />
            <PolicySection
              icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
              title={t("cancellations_title")}
              content={<p>{t("cancellations_text")}</p>}
            />
            <PolicySection
              icon={<Users className="w-6 h-6 text-purple-500" />}
              title={t("groups_title")}
              content={<p>{t("groups_text")}</p>}
            />
            <PolicySection
              icon={<CreditCard className="w-6 h-6 text-indigo-500" />}
              title={t("deposit_title")}
              content={<p>{t("deposit_text")}</p>}
            />
            <PolicySection
              icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
              title={t("allergies_title")}
              content={<p>{t("allergies_text")}</p>}
            />
            <PolicySection
              icon={<PawPrint className="w-6 h-6 text-teal-500" />}
              title={t("animals_title")}
              content={<p>{t("animals_text")}</p>}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function PolicySection({ icon, title, content }: any) {
  return (
    <div className="flex space-x-4 p-4 bg-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="text-gray-600">{content}</div>
      </div>
    </div>
  );
}
