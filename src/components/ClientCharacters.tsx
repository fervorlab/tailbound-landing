"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WeaponIcon = ({ src, alt, cols = 1, className = "" }: { src: string; alt: string; cols?: number; className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 bg-black/40 border border-white/10 rounded-xl hover:scale-110 hover:border-[#E39F54] hover:shadow-[0_0_15px_rgba(227,159,84,0.4)] transition-all cursor-pointer group ${className}`}>
      <div 
         className="absolute w-[80%] h-[80%] pixel-art group-hover:brightness-125 transition-all"
         style={{ 
           backgroundImage: `url(${src})`,
           backgroundSize: cols > 1 ? `${cols * 100}% auto` : 'contain',
           backgroundPosition: 'left center',
           backgroundRepeat: 'no-repeat'
         }}
         title={alt}
      />
    </div>
  );
};

const CharacterSprite = ({ src, alt, cols, heightClass = "h-40 md:h-56", className = "", shadowColor = "rgba(227,159,84,0.6)" }: { src: string; alt: string; cols: number; heightClass?: string; className?: string; shadowColor?: string }) => {
  const [frame, setFrame] = useState(0);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    if (cols <= 1) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % cols);
    }, 150); 
    return () => clearInterval(interval);
  }, [cols]);

  return (
    <div 
      className={`inline-block ${heightClass} ${className}`}
      style={{ aspectRatio: aspect, filter: `drop-shadow(0 0 30px ${shadowColor})` }}
    >
      <div className="relative w-full h-full overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          title={alt}
          className="absolute top-0 left-0 max-w-none h-full w-auto pixel-art" 
          onLoad={(e) => {
            const w = e.currentTarget.naturalWidth;
            const h = e.currentTarget.naturalHeight;
            setAspect((w / cols) / h);
          }}
          style={{ 
            transform: `translateX(-${(frame / cols) * 100}%)`,
            transition: 'none'
          }}
        />
      </div>
    </div>
  );
};

interface CharacterTranslations {
  shamanTab: string;
  shamanHeading: string;
  shamanName: string;
  shamanDesc: string;
  reaperTab: string;
  reaperHeading: string;
  reaperName: string;
  reaperDesc: string;
}

export default function ClientCharacters({ translations }: { translations: CharacterTranslations }) {
  const [activeTab, setActiveTab] = useState<"shaman" | "reaper">("shaman");

  const weaponClasses = "w-14 h-14 md:w-16 md:h-16";

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      <div className="flex justify-center gap-6">
        <button
          onClick={() => setActiveTab("shaman")}
          className={`px-6 py-3 text-xl md:text-2xl font-bold transition-all border-b-2 ${
            activeTab === "shaman" ? "text-[#E39F54] border-[#E39F54]" : "text-[#A0A0A5] border-transparent hover:text-[#EFEFEF]"
          }`}
        >
          {translations.shamanTab}
        </button>
        <button
          onClick={() => setActiveTab("reaper")}
          className={`px-6 py-3 text-xl md:text-2xl font-bold transition-all border-b-2 ${
            activeTab === "reaper" ? "text-[#902621] border-[#902621]" : "text-[#A0A0A5] border-transparent hover:text-[#EFEFEF]"
          }`}
        >
          {translations.reaperTab}
        </button>
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === "shaman" ? (
            <motion.div
              key="shaman"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel flex flex-col md:flex-row items-center gap-10 w-full p-8 md:p-12"
            >
              <div className="flex-1 text-left">
                <h3 className="text-3xl md:text-4xl text-[#A0A0A5] leading-tight mb-2 font-medium">
                  {translations.shamanHeading}
                </h3>
                <h2 className="text-5xl md:text-7xl font-black text-[#E39F54] drop-shadow-[0_0_15px_rgba(227,159,84,0.3)] mb-6">
                  {translations.shamanName}
                </h2>
                <p className="text-lg md:text-xl text-[#EFEFEF] mb-10 leading-relaxed">
                  {translations.shamanDesc}
                </p>
                <div className="grid grid-cols-3 max-w-[fit-content] gap-3 md:gap-4">
                  <WeaponIcon src="/assets/weapon/talisman.png" alt="부적" cols={6} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/purifying-water.png" alt="정화수" cols={1} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/jakdu.png" alt="작두" cols={3} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/dokkabi-fire.png" alt="도깨비불" cols={6} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/mocktak.png" alt="목탁" cols={6} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/wind.png" alt="부채바람" cols={12} className={weaponClasses} />
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center py-10">
                <CharacterSprite 
                   src="/assets/player/shaman-idle-v2.png"
                   alt="무당 스프라이트" 
                   cols={6} 
                   heightClass="h-40 md:h-56" 
                   shadowColor="rgba(227,159,84,0.6)" 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reaper"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel flex flex-col md:flex-row items-center gap-10 w-full p-8 md:p-12"
            >
              <div className="flex-1 text-left">
                <h3 className="text-3xl md:text-4xl text-[#A0A0A5] leading-tight mb-2 font-medium">
                  {translations.reaperHeading}
                </h3>
                <h2 className="text-5xl md:text-7xl font-black text-[#902621] drop-shadow-[0_0_15px_rgba(144,38,33,0.3)] mb-6">
                  {translations.reaperName}
                </h2>
                <p className="text-lg md:text-xl text-[#EFEFEF] mb-10 leading-relaxed">
                  {translations.reaperDesc}
                </p>
                <div className="grid grid-cols-3 max-w-[fit-content] gap-3 md:gap-4">
                  <WeaponIcon src="/assets/weapon/reaper/karma-scythe.png" alt="업보의 낫" cols={11} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/reaper/death-sword.png" alt="망자의 검" cols={11} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/reaper/spirit-bell.png" alt="명두방울" cols={10} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/reaper/chain-of-fate.png" alt="운명의 사슬" cols={10} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/reaper/river-styx.png" alt="삼도천" cols={14} className={weaponClasses} />
                  <WeaponIcon src="/assets/weapon/reaper/gate-underworld.png" alt="지옥문" cols={7} className={weaponClasses} />
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center py-10">
                <CharacterSprite 
                   src="/assets/player/reaper-idle-new.png"
                   alt="저승사자 스프라이트" 
                   cols={6} 
                   heightClass="h-44 md:h-64" 
                   shadowColor="rgba(144,38,33,0.6)" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
