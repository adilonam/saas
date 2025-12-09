import React from "react";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, description, href }) => {
  const content = (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200 hover:shadow-lg cursor-pointer h-full flex flex-col">
      <Icon size={34} className="mb-4 text-gray-800 dark:text-white" />
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 font-light flex-grow">
        {description}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default FeatureCard;
