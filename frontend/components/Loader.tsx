import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number; // Optional size prop to control the size of the spinner
  color?: string; // Optional color prop for the spinner
  text?: string; // Optional text prop to display a message with the loader
}

const Loader: React.FC<LoaderProps> = ({
  size = 24,
  color = "text-blue-600",
  text = "Loading...",
}) => {
  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Spinner */}
      <Loader2
        className={`animate-spin ${color}`} // Dynamic color
        style={{ width: size, height: size }} // Dynamic size
      />
      {/* Text */}
      {text && <span className="ml-2 text-gray-500">{text}</span>}
    </div>
  );
};

export default Loader;
