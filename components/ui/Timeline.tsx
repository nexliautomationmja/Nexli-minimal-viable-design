"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useTheme } from "../../App";
import { WeatherFx } from "./WeatherFx";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { theme } = useTheme();
  const isInView = useInView(titleRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full font-sans md:px-10"
      ref={containerRef}
    >
      <div ref={titleRef} className="relative max-w-7xl mx-auto py-10 md:py-20 px-4 md:px-8 lg:px-10 bg-black rounded-3xl">
        {/* Heavy Rain Effect */}
        {isInView && (
          <WeatherFx
            height={20}
            type="rain"
            intensity={150}
            colors={["brand-solid-light"]}
          />
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-2xl md:text-5xl font-bold mb-4 max-w-4xl text-white"
        >
          {"The Digital Rainmaker System".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className={`inline-block mr-2 ${
                word === "Rainmaker"
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500"
                  : ""
              }`}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.5, type: "spring", stiffness: 200 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            &trade;
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 max-w-sm text-sm md:text-base text-neutral-300"
        >
          Your Firm's 24/7 Client Acquisition Machine
        </motion.p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className={`h-10 absolute left-3 md:left-3 w-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-black' : 'bg-white'
              }`}>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border border-blue-600 p-2" />
              </div>
              <h3 className={`hidden md:block text-xl md:pl-20 md:text-5xl font-bold ${
                theme === 'dark' ? 'text-neutral-500' : 'text-slate-400'
              }`}>
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className={`md:hidden block text-2xl mb-4 text-left font-bold ${
                theme === 'dark' ? 'text-neutral-500' : 'text-slate-400'
              }`}>
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-blue-500 via-cyan-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
