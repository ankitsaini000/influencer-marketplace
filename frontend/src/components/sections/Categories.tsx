"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { demoCategoryIcons } from "../../lib/demoImages";

// Demo categories with actual icons
const demoCategories = [
  {
    icon: demoCategoryIcons[0],
    title: "Fashion & Beauty",
  },
  {
    icon: demoCategoryIcons[1],
    title: "Travel",
  },
  {
    icon: demoCategoryIcons[2],
    title: "Fitness & Health",
  },
  {
    icon: demoCategoryIcons[3],
    title: "Gaming",
  },
  {
    icon: demoCategoryIcons[4],
    title: "Food & Cooking",
  },
  {
    icon: demoCategoryIcons[5],
    title: "Technology",
  },
  {
    icon: demoCategoryIcons[6],
    title: "Arts & Crafts",
  },
  {
    icon: demoCategoryIcons[7],
    title: "Finance",
  },
];

export const Categories = () => {
  const [categoryScroll, setCategoryScroll] = React.useState(0);

  const scrollCategories = (direction: "left" | "right") => {
    const container = document.getElementById("categories-container");
    if (container) {
      const scrollAmount = 200;
      const newScroll =
        direction === "left"
          ? categoryScroll - scrollAmount
          : categoryScroll + scrollAmount;

      container.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
      setCategoryScroll(newScroll);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header with Title and Navigation */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Choose your Categories
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCategories("left")}
              className="p-2 rounded-full border border-gray-200 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollCategories("right")}
              className="p-2 rounded-full border border-gray-200 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Slider */}
        <div className="relative max-w-6xl mx-auto">
          <div
            id="categories-container"
            className="flex overflow-x-hidden scroll-smooth gap-8 px-4"
          >
            {demoCategories.map((category) => (
              <div
                key={category.title}
                className="flex-shrink-0 w-[160px] cursor-pointer group"
              >
                <div className="flex flex-col items-center">
                  {/* Circle with Icon */}
                  <div className="w-32 h-32 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center mb-4 group-hover:border-purple-200 group-hover:shadow-md transition-all duration-300">
                    <img
                      src={category.icon}
                      alt={category.title}
                      className="w-16 h-16 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Category Title */}
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {category.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
