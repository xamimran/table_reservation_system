import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, User } from "lucide-react";

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
  const maxChildren = parseInt(adults) - 1;
  const childrenOptions = Array.from(
    { length: maxChildren >= 0 ? maxChildren + 1 : 1 },
    (_, i) => i
  );

  return (
    <div className="space-y-6  h-[400px]">
      <h2 className="text-2xl font-bold mb-4">Party Size</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="adults"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Adults</span>
          </Label>
          <Select
            value={adults}
            onValueChange={(value) => {
              setAdults(value);
              setChildren("0");
            }}
          >
            <SelectTrigger id="adults" className="w-full text-lg p-3">
              <SelectValue placeholder="Select number of adults" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-lg"
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
            className="text-lg font-medium flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Children</span>
          </Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger id="children" className="w-full text-lg p-3">
              <SelectValue placeholder="Select number of children" />
            </SelectTrigger>
            <SelectContent>
              {childrenOptions.map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-lg"
                >
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-lg flex items-center space-x-2 bg-blue-100 p-4 rounded-md border border-blue-200 text-blue-700">
        <Users className="w-6 h-6" />
        <span>
          <strong>{adults}</strong> {adults === "1" ? "adult" : "adults"} and{" "}
          <strong>{children}</strong> {children === "1" ? "child" : "children"}{" "}
          are selected for your party.
        </span>
      </p>
    </div>
  );
}
