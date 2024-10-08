"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useTranslations } from "@/app/hooks/useTranslations";

interface PartySizeStepProps {
  adults: string;
  setAdults: (value: string) => void;
  children: string;
  setChildren: (value: string) => void;
}

export default function PartySizeStep({
  adults,
  setAdults,
  children,
  setChildren,
}: PartySizeStepProps) {
  const t = useTranslations();
  const maxChildren = parseInt(adults) - 1;
  const childrenOptions = Array.from(
    { length: maxChildren >= 0 ? maxChildren + 1 : 1 },
    (_, i) => i
  );

  return (
    <div className="space-y-4 sm:space-y-6 h-full sm:h-[400px]">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">{t("partySize")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="adults"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <Image
              src="/party-size.png"
              alt={t("adults")}
              width="20"
              height="20"
            />
            <span>{t("adults")}</span>
          </Label>
          <Select
            value={adults}
            onValueChange={(value) => {
              setAdults(value);
              setChildren("0");
            }}
          >
            <SelectTrigger
              id="adults"
              className="w-full text-base sm:text-lg p-2 sm:p-3"
            >
              <SelectValue placeholder={t("selectNumberOfAdults")} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-base sm:text-lg"
                >
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="children"
            className="text-base sm:text-lg font-medium flex items-center space-x-2"
          >
            <Image
              src="/party-size.png"
              alt={t("children")}
              width="20"
              height="20"
            />
            <span>{t("children")}</span>
          </Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger
              id="children"
              className="w-full text-base sm:text-lg p-2 sm:p-3"
            >
              <SelectValue placeholder={t("selectNumberOfChildren")} />
            </SelectTrigger>
            <SelectContent>
              {childrenOptions.map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-base sm:text-lg"
                >
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-base sm:text-lg flex items-center space-x-2 bg-yellow-50 border-[#eab24f] p-3 sm:p-4 rounded-md border text-[#eab24f]">
        <Image
          src="/party-size.png"
          alt={t("partySize")}
          width="28"
          height="28"
        />
        <span>
          {t("partySizeMessage", { adults, children })}
        </span>
      </p>
    </div>
  );
}