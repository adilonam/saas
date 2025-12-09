import React from "react";
import FeatureCard from "./FeatureCard";
import {
  FaFilePdf,
  FaLock,
  FaUnlock,
  FaFileArchive,
  FaShieldAlt,
  FaKey,
} from "react-icons/fa";
import { HiDocumentText, HiPencil } from "react-icons/hi";

const Features = () => {
  const features = [
    {
      icon: HiPencil,
      title: "Manual Sign PDF",
      description:
        "Sign PDF documents manually using your mouse or convert text to signature. Draw your signature or type it out.",
      href: "/sign-pdf",
    },
    {
      icon: FaLock,
      title: "Encrypt PDF",
      description:
        "Protect your PDF documents with strong encryption. Secure sensitive files with password protection.",
      href: "/encrypt-pdf",
    },
    {
      icon: FaUnlock,
      title: "Decrypt PDF",
      description:
        "Remove encryption from PDF files. Unlock password-protected documents with ease.",
      href: "/decrypt-pdf",
    },
    {
      icon: FaFilePdf,
      title: "Merge PDFs",
      description:
        "Combine multiple PDF files into one document. Merge, organize, and rearrange pages effortlessly.",
      href: "/merge-pdf",
    },
    {
      icon: HiDocumentText,
      title: "Split PDF",
      description:
        "Split large PDF files into smaller documents. Extract specific pages or divide by page ranges.",
      href: "/split-pdf",
    },
    {
      icon: FaShieldAlt,
      title: "PDF Watermark",
      description:
        "Add watermarks to your PDF documents. Protect your content with custom text or image watermarks.",
      href: "/watermark-pdf",
    },
    {
      icon: FaKey,
      title: "Password Protect",
      description:
        "Add password protection to your PDF files. Control access with strong encryption algorithms.",
      href: "/password-protect",
    },
    {
      icon: FaFileArchive,
      title: "Compress PDF",
      description:
        "Reduce PDF file sizes without losing quality. Optimize documents for faster sharing and storage.",
      href: "/compress-pdf",
    },
    {
      icon: FaLock,
      title: "Secure File Storage",
      description:
        "Store and manage your encrypted files securely. Access your documents from anywhere with confidence.",
      href: "/storage",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <p className="mt-8 text-xl text-gray-600 dark:text-gray-300 font-light">
            Powerful PDF tools and encryption features to secure and manage your
            documents. Click on any feature to get started.
          </p>
        </div>
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
