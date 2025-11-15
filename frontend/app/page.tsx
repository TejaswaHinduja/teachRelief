import Image from "next/image";
import OCRUploader from "./dashboard/page";
import NewDashboard from "./dashboard/newpage";
import SignPage from "./auth/[type]/page";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignPage/>
    </div>
  );
}
