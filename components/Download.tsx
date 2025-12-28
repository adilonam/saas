import Image from "next/image";

const Download: React.FC = () => (
  <section className="container mx-auto py-24 px-4 md:px-6">
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-1/2 order-1 p-4 flex justify-center md:justify-start items-center">
        <Image
          src="/images/pdf.png"
          alt="PDF management interface"
          width={500}
          height={500}
          className="w-1/2 h-auto mx-auto md:mx-0"
        />
      </div>
      <div className="w-full md:w-1/2 order-2 flex justify-center md:justify-end">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
            Start Managing Your PDFs Today
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-300 mb-6 font-light">
            Access powerful PDF management tools from anywhere. Encrypt, sign, and organize your documents with our secure platform.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Download;
