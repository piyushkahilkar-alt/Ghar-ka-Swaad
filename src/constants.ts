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
      price_per_meal: 79,
      monthly_price: "79 (One Time)",
      meals_per_day: 1,
      menu: ["Standard Meal", "Taste our quality", "Dal, Rice, Roti, Sabzi", "Salad & Aachar"],
      target: "First Timers",
      description: "Try our quality before subscribing. On 9th June, we are going to provide 50% off on trial, so stay updated!"
    },
    {
      id: 1,
      name: "Daily Veg Plan",
      price_per_meal: 100,
      monthly_price: 2999,
      meals_per_day: 2,
      menu: ["Fresh Sabzi & Dal Tadka", "Rice & Rotis", "Salad & Aachar", "Morning Off, Night meal on Sundays"],
      target: "Regular Meals",
      description: "Our classic vegetarian tiffin delivered daily. Affordable and hygienic."
    }
  ],

  daily_menu: {
    monday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Roti (~120 kcal)", "Aloogobi (~140 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"],
    tuesday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Roti (~120 kcal)", "Mix Veg (~130 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"],
    wednesday: ["Veg Biryani (~350 kcal)", "Raita (~80 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"],
    thursday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Baigan & Mix Veg (~140 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "Roti (~120 kcal)"],
    friday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Rajma Masala (~180 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "Roti (~120 kcal)"],
    saturday: ["Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Chole Masala (~180 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)", "Roti (~120 kcal)"],
    sunday: ["Morning: Off", "Night: Dal Tadka (~150 kcal)", "Rice (~130 kcal)", "Roti (~120 kcal)", "Special Sabzi (~130 kcal)", "Salad (~20 kcal)", "Aachar (~30 kcal)"]
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
