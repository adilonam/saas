import React from "react";
import Link from "next/link";
import { IconType } from "react-icons";

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  href?: string;
  comingSoon: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, href, comingSoon }: FeatureCardProps) => {
  const content = (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200 h-full flex flex-col relative ${
      comingSoon ? 'opacity-75' : 'hover:shadow-lg cursor-pointer'
    }`}>
      {comingSoon && (
        <span className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded">
          Coming Soon
        </span>
      )}
      <Icon size={34} className="mb-4 text-gray-800 dark:text-white" />
      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 font-light flex-grow">
        {description}
      </p>
    </div>
  );

  if (href && !comingSoon) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default FeatureCard;
