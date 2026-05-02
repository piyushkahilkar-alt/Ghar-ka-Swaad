export const BRAND_DATA = {
  brand: {
    name: "Ghar ka Swaad",
    subName: "Nagpur Tiffin Hub",
    tagline: "Ghar Jaisa Khana, Roz Roz",
    phone: "+91 8275116821",
    email: "contact@gharkaswaad.com",
    address: "Nandanvan, KDK Collage road, Nagpur",
    whatsapp: "+918275116821"
  },

  locations: [
    "Nandanvan", "Tiranga Square", "Garba Maidan", "Darshan Colony", 
    "Kharabi", "Vathoda", "Sakkardara", "Reshimbagh", 
    "Dighori", "Bhandewadi"
  ],

  plans: [
    {
      id: 0,
      name: "1-Day Trial Meal",
      price_per_meal: 80,
      monthly_price: "80 (One Time)",
      meals_per_day: 1,
      menu: ["Standard Meal", "Taste our quality", "Dal, Rice, Roti, Sabzi", "Salad/Raita"],
      target: "First Timers",
      description: "Taste before you subscribe! Perfect for checking our food quality."
    },
    {
      id: 1,
      name: "Daily Veg Plan",
      price_per_meal: 80,
      monthly_price: 2200,
      meals_per_day: 1,
      menu: ["Dal Tadka / Rajma / Chole", "Mix Veg / Paneer / Aloo", "Rotis & Rice", "Salad & Buttermilk"],
      target: "Regular Meals",
      description: "Our classic vegetarian tiffin delivered daily. Affordable and hygienic."
    },
    {
      id: 2,
      name: "Daily Non-Veg Plan",
      price_per_meal: 120,
      monthly_price: 3200,
      meals_per_day: 1,
      menu: ["Non-Veg on Wed/Sat/Sun", "Chicken / Egg / Mutton", "Rotis & Rice", "Salad"],
      target: "Protein Lovers",
      description: "Enjoy special non-veg dishes. Veg meals on other days."
    },
    {
      id: 3,
      name: "Custom / Add-ons",
      price_per_meal: "Var",
      monthly_price: "Flex",
      meals_per_day: 1,
      menu: ["Extra Roti (₹10)", "Extra Sweet (₹20)", "Biryani Upgrade (₹30)", "Add any dish"],
      target: "Subscribed Members",
      description: "Customize your daily meal with extra add-ons just for subscribed members."
    }
  ],

  daily_menu: {
    monday: ["Dal Tadka", "Jeera Rice", "Roti", "Aloo Gobi", "Salad", "(Jain: Lauki Sabzi)"],
    tuesday: ["Mix Veg Curry", "Roti", "Rice", "Buttermilk", "(Jain: Tinda/Lauki)"],
    wednesday: ["Rajma Masala", "Rice", "Roti", "Salad", "(NV: Chicken Curry)", "(Jain: Rajma Jain Style)"],
    thursday: ["Veg Biryani", "Raita", "Gulab Jamun", "(Jain: Jain Veg Pulao)"],
    friday: ["Chole Masala", "Rice", "Roti", "Salad", "(Jain: Chole No Onion/Garlic)"],
    saturday: ["Paneer Butter Masala", "Roti", "Rice", "(NV: Egg Curry)", "(NV: Chicken Masala)", "(Jain: Paneer Jain Style)"],
    sunday: ["Paneer Biryani", "Raita", "Salad", "Kheer", "(NV: Chicken/Mutton Biryani)", "(Jain: Jain Veg Pulao)"]
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
