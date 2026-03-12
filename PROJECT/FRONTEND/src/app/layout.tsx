import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import LightWavesBackground from "../components/common/LightWavesBackground";
import Footer from "@/components/layout/Footer";

export default function Layout() {
  return (
    <div className="relative min-h-screen">
      <LightWavesBackground />

      <div className="relative z-10">
        <Navbar />
        <main className="pt-16 px-6">
          <Outlet />
        </main>
      </div>

      <div className="relative z-10 mt-5">
        <Footer />
      </div>
    </div>
  );
}
