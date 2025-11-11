import Image from "next/image";
import OCRUploader from "./dashboard/page";
import NewDashboard from "./dashboard/newpage";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <OCRUploader/>
    </div>
  );
}
