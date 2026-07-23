import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const INSTAGRAM_POSTS = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Relaxing professional hair wash and conditioning treatment",
    likes: "142",
    comments: "18",
    category: "Hair Spa"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Stunning volumetric curls and professional hair styling",
    likes: "256",
    comments: "31",
    category: "Hairstyling"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Hydrafacial deep pore cleansing skin therapy session",
    likes: "312",
    comments: "42",
    category: "Facial"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Elegant ombre pink to peach gel manicured nails",
    likes: "420",
    comments: "56",
    category: "Nail Care"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Classic French tip nail extensions with a modern glossy finish",
    likes: "378",
    comments: "29",
    category: "Nails"
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Premium custom eyelash extension volume mapping close-up",
    likes: "245",
    comments: "22",
    category: "Eyelashes"
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Soothing aromatherapy hot stone full body massage therapy",
    likes: "289",
    comments: "27",
    category: "Massage"
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Silky keratin hair smoothening and straightening transformation",
    likes: "367",
    comments: "48",
    category: "Hair Therapy"
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Relaxing wellness herbal steam room and sauna sanctuary",
    likes: "224",
    comments: "19",
    category: "Sauna"
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600&h=600",
    alt: "Exfoliating chocolate clay facial mask treatment skin wellness",
    likes: "340",
    comments: "35",
    category: "Facial Mask"
  }
];

export default function InstagramSection() {
  return (
    <section id="instagram-gallery" className="py-12 bg-rose-50/10 border-t border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 12-Image Beautiful Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <div 
              key={post.id} 
              className="relative group aspect-square bg-white border border-rose-100 rounded-sm overflow-hidden shadow-3xs cursor-pointer"
            >
              <img 
                src={post.url} 
                alt={post.alt} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Elegant Overlay */}
              <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                <span className="self-start text-[9px] uppercase tracking-wider font-bold bg-rose-500 text-white px-2 py-0.5 rounded-xs">
                  {post.category}
                </span>
                
                <div className="flex items-center justify-around text-white font-mono text-xs">
                  <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                    <Heart className="w-4 h-4 fill-white hover:fill-rose-500" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <MessageCircle className="w-4 h-4 fill-white hover:fill-amber-500" />
                    {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
