export const BRAND_DATA = {
  brand: {
    name: "Ghar ka Swaad",
    subName: "Nagpur Tiffin Hub",
    tagline: "Ghar Jaisa Khana, Roz Roz",
    phone: "+91 8275116821",
    email: "contact@gharkaswaad.com",
    address: "Nandanvan, KDK Collage road, Nagpur",
    whatsapp: "+918275116821",
    instagram: "https://www.instagram.com/gharkaswaadngp/"
  },

  locations: [
    "Nandanvan", "Ashok Nagar", "Chapru Nagar", "Jagnade Square", 
    "Ganesh Nagar", "Guru Dev Nagar", "Shree Krishna Nagar", 
    "Vyankatesh Nagar", "Shashtri Nagar", "Darshan Colony"
  ],

  plans: [
    {
      id: 0,
      name: "Trial Offer",
      price_per_meal: 99,
      monthly_price: "99 (One Time)",
      meals_per_day: 1,
      menu: ["Standard Meal", "Taste our quality", "Dal, Rice, Roti, Sabzi", "Salad/Raita"],
      target: "First Timers",
      description: "The trial mill is available for two days. The trial mill is applicable for today only. The trial mill is for the first 100 trials. Registration and login are required for this."
    },
    {
      id: 1,
      name: "Daily Veg Plan",
      price_per_meal: 100,
      monthly_price: 2999,
      meals_per_day: 2,
      menu: ["Dal Tadka / Rajma / Chole", "Mix Veg / Paneer / Aloo", "Rotis & Rice", "Salad & Buttermilk"],
      target: "Regular Meals",
      description: "Our classic vegetarian tiffin delivered daily. Affordable and hygienic."
    },
    {
      id: 2,
      name: "Daily Non-Veg Plan",
      price_per_meal: 116,
      monthly_price: 3499,
      meals_per_day: 2,
      menu: ["Non-Veg on Wed/Sat/Sun", "Chicken / Egg / Mutton", "Rotis & Rice", "Salad"],
      target: "Protein Lovers",
      description: "Enjoy special non-veg dishes. Veg meals on other days."
    }
  ],

  daily_menu: {
    monday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Roti (~120 kcal)", "Aloogobi (~140 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"],
    tuesday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Roti (~120 kcal)", "Mix Veg (~130 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"],
    wednesday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Pattagobi (~110 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "(NV: Anda Curry ~200 kcal)"],
    thursday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Baigan & Mix Veg (~140 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "Roti (~120 kcal)"],
    friday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Rajma Masala (~180 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "Roti (~120 kcal)"],
    sunday: ["Morning: South Indian Nasta (~300 kcal)", "Night: Veg Pulao & Kadi (~400 kcal)", "(NV: Chicken & Biriyani ~600 kcal)"]
  },

  testimonials: [
    {
      name: "Rahul Sharma",
      review: "Best tiffin service in Nagpur. Food tastes like home!",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Priya Verma",
      review: "Affordable and hygienic. Perfect for working professionals.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Aniket Deshmukh",
      review: "The Paneer on Thursdays is amazing! Delivery is always on time.",
      image: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=150&q=80"
    }
  ],

  features: [
    {
      title: "Fresh Ingredients",
      description: "We source our vegetables and grains fresh every morning.",
      icon: "Leaf"
    },
    {
      title: "Hygienic Kitchen",
      description: "Zero-compromises on cleanliness and food safety.",
      icon: "ShieldCheck"
    },
    {
      title: "On-time Delivery",
      description: "Hot meals delivered to your doorstep exactly when you need them.",
      icon: "Clock"
    },
    {
      title: "Custom Plans",
      description: "Choose from student, professional, or premium options.",
      icon: "Zap"
    }
  ]
};
