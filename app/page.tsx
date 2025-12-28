import Header from "components/Header";
import Hero from "components/Hero";
import Features from "components/Features";
import Section from "components/Section";
import Footer from "components/Footer";
import Customers from "components/Customers";
import Image from "next/image";
import Accordion from "components/Accordion";
import Reviews from "components/Reviews";
import Download from "components/Download";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header />
      <main>
        <Hero />
        <Features />
        <Section
          leftHalf={
            <>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Complete PDF Management Solution
              </h2>
              <p className="text-xl font-light">
                Manage all your PDF documents in one place. Encrypt, sign,
                merge, split, and protect your files with our comprehensive PDF
                management tools. Everything you need for secure document
                handling.
              </p>
            </>
          }
          rightHalf={
            <Image
              src={"/images/pdf.png"}
              alt="PDF management interface"
              width={500}
              height={100}
              className="w-1/2 h-auto"
            />
          }
        />
        <Customers />
        <Section
          leftHalf={<Accordion />}
          rightHalf={
            <div className="flex flex-col justify-end">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                Secure PDF Tools at Your Fingertips
              </h2>
              <p className="text-xl font-light">
                Discover powerful PDF management features designed to keep your
                documents secure and organized. From encryption to signing, we
                provide all the tools you need for professional PDF handling.
              </p>
            </div>
          }
        />
        <Reviews />
        <Download />
      </main>
      <Footer />
    </div>
  );
}
