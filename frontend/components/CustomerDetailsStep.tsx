import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";

interface CustomerDetailsStepProps {
  customerDetails: {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_notes: string;
  };
  setCustomerDetails: (details: {
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_notes: string;
  }) => void;
}

export default function CustomerDetailsStep({
  customerDetails,
  setCustomerDetails,
}: CustomerDetailsStepProps) {
  const details = customerDetails || {
    user_name: "",
    first_name: "",
    last_name: "",
    user_notes: "",
    email: "",
    phone: "",
  };

  return (
    <div className="space-y-6  h-[500px]">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>First Name</span>
          </Label>
          <Input
            id="first_name"
            value={details.first_name}
            onChange={(e) =>
              setCustomerDetails({ ...details, first_name: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Last Name</span>
          </Label>
          <Input
            id="last_name"
            value={details.last_name}
            onChange={(e) =>
              setCustomerDetails({ ...details, last_name: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={details.email}
            onChange={(e) =>
              setCustomerDetails({ ...details, email: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div>
        {/* <div className="space-y-2">
          <Label
            htmlFor="user_name"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>User Name</span>
          </Label>
          <Input
            id="user_name"
            type="user_name"
            value={details.user_name}
            onChange={(e) =>
              setCustomerDetails({ ...details, user_name: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div> */}
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>Phone</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={details.phone}
            onChange={(e) =>
              setCustomerDetails({ ...details, phone: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div>
        {/* <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-lg font-medium flex items-center space-x-2"
          >
            <Phone className="w-5 h-5" />
            <span>User Notes</span>
          </Label>
          <Input
            id="user_notes"
            type="textarea"
            value={details.user_notes}
            onChange={(e) =>
              setCustomerDetails({ ...details, user_notes: e.target.value })
            }
            required
            className="text-lg p-3"
          />
        </div> */}
      </div>
    </div>
  );
}
