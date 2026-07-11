import React from 'react';
import { Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about-section" className="py-20 bg-white border-t border-b border-rose-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 cursor-default">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full mb-4 transition-all duration-300 hover:bg-rose-100 hover:scale-105">
            <Award className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-rose-500">
              Credentials & Artistry
            </span>
          </div>
          <h2 className="title-font text-3xl sm:text-4xl md:text-5xl font-light text-charcoal tracking-tight mb-4 transition-colors duration-500 hover:text-rose-600">
            Certified Beauty <span className="font-serif italic text-rose-500">Excellence</span>
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-rose-300 via-amber-300 to-rose-300 mx-auto mb-4" />
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed transition-colors duration-300 hover:text-gray-700">
            Trisha Beauty Parlour combines professional academy training, master certifications, and a passion for bespoke styling to deliver unparalleled results.
          </p>
        </div>

        {/* Text-Centric Presentation */}
        <div className="space-y-12">
          {/* Main Statement */}
          <div className="text-center max-w-3xl mx-auto bg-rose-50/20 border border-rose-100/60 p-8 rounded-sm shadow-3xs cursor-default transition-all duration-500 hover:bg-rose-50/40 hover:-translate-y-0.5 hover:shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 transition-colors duration-300">OUR COMMITMENT</span>
            <h3 className="title-font text-xl sm:text-2xl font-light text-charcoal tracking-tight mt-2 mb-4 transition-colors duration-300 hover:text-rose-600">
              Where Elite Training Meets Personalized Care
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed transition-colors duration-300 hover:text-charcoal">
              With master-class training from prestigious beauty academies, Trisha and her expert team are highly certified in complex skin treatment therapies, precision styling, custom bridal cosmetology, and high-definition makeups. Every service is fully personalized to enrich your natural features and skin tone.
            </p>
          </div>

          {/* Key Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-rose-100">
            
            <div className="flex flex-col items-center text-center p-4 group/item cursor-default">
              <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xs text-rose-500 mb-4 transition-all duration-300 group-hover/item:bg-rose-500 group-hover/item:text-white group-hover/item:scale-110">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-charcoal transition-colors duration-300 group-hover/item:text-rose-600">Elite Academy Certified</h4>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed transition-colors duration-300 group-hover/item:text-charcoal">
                Formal credentials in the latest bridal makeup trends, advanced skin therapies, and cosmetic hair designs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 group/item cursor-default">
              <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xs text-rose-500 mb-4 transition-all duration-300 group-hover/item:bg-rose-500 group-hover/item:text-white group-hover/item:scale-110">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-charcoal transition-colors duration-300 group-hover/item:text-rose-600">Prestige Products & Hygiene</h4>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed transition-colors duration-300 group-hover/item:text-charcoal">
                We strictly use clinical hair-care brands, dermatologically tested skin solutions, and authentic premium cosmetic products.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 group/item cursor-default">
              <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-xs text-rose-500 mb-4 transition-all duration-300 group-hover/item:bg-rose-500 group-hover/item:text-white group-hover/item:scale-110">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-charcoal transition-colors duration-300 group-hover/item:text-rose-600">Personalized Consultation</h4>
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed transition-colors duration-300 group-hover/item:text-charcoal">
                Complimentary pre-treatment mapping to analyze skin undertones and hair texture, ensuring optimal aesthetic results.
              </p>
            </div>

          </div>

          {/* Trust Footer */}
          <div className="pt-8 border-t border-rose-100 text-center cursor-default">
            <p className="text-xs text-gray-400 font-light transition-colors duration-300 hover:text-gray-600">
              Join over <strong className="text-charcoal font-medium hover:text-rose-600 transition-colors duration-300">500+ happy clients</strong> who trust Trisha Beauty Parlour for their special life milestones!
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
