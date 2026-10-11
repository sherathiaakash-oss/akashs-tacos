import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all 17 independent separate collection models natively
import Shell from './models/Shell.js';
import Size from './models/Size.js';
import Protein from './models/Protein.js';
import Cheese from './models/Cheese.js';
import Sauce from './models/Sauce.js';
import Salsa from './models/Salsa.js';
import Topping from './models/Topping.js';
import Side from './models/Side.js';
import Drink from './models/Drink.js';
import Dessert from './models/Dessert.js';
import SideAndExtra from './models/SideAndExtra.js';
import MenuItem from './models/MenuItem.js';
import Deal from './models/Deal.js';
import User from './models/User.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import OrderItem from './models/OrderItem.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Secure connection established with MongoDB Cloud Cluster!");

    // 1. FLUSH ALL 17 SEPARATE TABLES CLEAN
    await Shell.deleteMany({});
    await Size.deleteMany({});
    await Protein.deleteMany({});
    await Cheese.deleteMany({});
    await Sauce.deleteMany({});
    await Salsa.deleteMany({});
    await Topping.deleteMany({});
    await Side.deleteMany({});
    await Drink.deleteMany({});
    await Dessert.deleteMany({});
    await SideAndExtra.deleteMany({});
    await MenuItem.deleteMany({});
    await Deal.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    console.log("🧹 Clean Slate: Old records flushed clean across all 17 individual collections.");
    // 2. 🔔 SEED SHELL TABLE (Table 1)
    await Shell.insertMany([
      { _id: "SH_01", name: "Crispy White Corn Taco Shell", type: "Hard Shell", price: 15, isGlutenFree: true, inStock: true, small_pack_in_stock: 150, regular_pack_in_stock: 250, large_pack_in_stock: 100 },
      { _id: "SH_02", name: "Crispy Red Hot Corn Shell", type: "Hard Shell", price: 18, isGlutenFree: true, inStock: true, small_pack_in_stock: 100, regular_pack_in_stock: 200, large_pack_in_stock: 150 },
      { _id: "SH_03", name: "Soft Flour Tortilla", type: "Soft Tortilla", price: 12, isGlutenFree: false, inStock: true, small_pack_in_stock: 200, regular_pack_in_stock: 300, large_pack_in_stock: 100 },
      { _id: "SH_04", name: "Soft Whole Wheat Tortilla", type: "Soft Tortilla", price: 15, isGlutenFree: false, inStock: true, small_pack_in_stock: 100, regular_pack_in_stock: 200, large_pack_in_stock: 100 },
      { _id: "SH_05", name: "Doritos Nacho Cheese Shell", type: "Hard Shell", price: 25, isGlutenFree: true, inStock: true, small_pack_in_stock: 80, regular_pack_in_stock: 170, large_pack_in_stock: 100 },
      { _id: "SH_06", name: "Doritos Sweet Chilli Shell", type: "Hard Shell", price: 25, isGlutenFree: true, inStock: true, small_pack_in_stock: 90, regular_pack_in_stock: 150, large_pack_in_stock: 60 },
      { _id: "SH_07", name: "Corn Tortilla chips Box", type: "Box", price: 25, isGlutenFree: true, inStock: true, small_pack_in_stock: 200, regular_pack_in_stock: 400, large_pack_in_stock: 100 },
      { _id: "SH_08", name: "Peri Peri Corn Tortilla chips Box", type: "Box", price: 28, isGlutenFree: true, inStock: true, small_pack_in_stock: 150, regular_pack_in_stock: 350, large_pack_in_stock: 150 }
    ]);
    console.log("🐚 Shell parameters loaded into active memory.");

    // 3. 📐 SEED SIZE TABLE (Table 2)
    await Size.insertMany([
      { _id: "SZ_01", name: "Small", multiplier: 1.0, inStock: true },
      { _id: "SZ_02", name: "Regular", multiplier: 1.2, inStock: true },
      { _id: "SZ_03", name: "Large", multiplier: 1.5, inStock: true }
    ]);
    console.log("📐 Size scaling parameters mounted.");

    // 4. 🌱 SEED PROTEIN TABLE (Table 3)
    await Protein.insertMany([
      { _id: "PR_01", name: "Smashed Classic Pinto Beans", price: 30, isVegan: true, inStock: true, pack_in_stock: 400 },
      { _id: "PR_02", name: "Smashed Spicy Black Beans", price: 35, isVegan: true, inStock: true, pack_in_stock: 350 },
      { _id: "PR_03", name: "Smashed Crispy Potato Bites", price: 25, isVegan: true, inStock: true, pack_in_stock: 500 },
      { _id: "PR_04", name: "Smashed Sweet Corn & Herb Mash", price: 30, isVegan: true, inStock: true, pack_in_stock: 300 },
      { _id: "PR_05", name: "Smashed Mock-Meat Strips (Plant-Based)", price: 55, isVegan: true, inStock: true, pack_in_stock: 200 },
      { _id: "PR_06", name: "Smashed Spiced Paneer Cubes", price: 45, isVegan: false, inStock: true, pack_in_stock: 250 }
    ]);
    console.log("🌱 Protein Table data successfully mounted.");

    // 5. 🧀 SEED CHEESE TABLE (Table 4)
    await Cheese.insertMany([
      { _id: "CH_01", name: "Shredded Cheddar Cheese", price: 20, isDairyFree: false, inStock: true, pack_in_stock: 400 },
      { _id: "CH_02", name: "Shredded Quesadilla Mozzarella & Jack Blend", price: 25, isDairyFree: false, inStock: true, pack_in_stock: 450 },
      { _id: "CH_03", name: "Liquid Warm Nacho Cheese Sauce", price: 20, isDairyFree: false, inStock: true, pack_in_stock: 500 },
      { _id: "CH_04", name: "Creamy Cheese Spread", price: 22, isDairyFree: false, inStock: true, pack_in_stock: 300 },
      { _id: "CH_05", name: "Shredded Vegan Cheddar Alternative", price: 35, isDairyFree: true, inStock: true, pack_in_stock: 150 },
      { _id: "CH_06", name: "Shredded Vegan Mozzarella Alternative", price: 35, isDairyFree: true, inStock: true, pack_in_stock: 150 }
    ]);
    console.log("🧀 Cheese Table entries populated successfully.");
    // 6. 🌶️ SEED SAUCE TABLE (Table 5)
    await Sauce.insertMany([
      { _id: "SC_01", name: "Signature Lava Sauce", price: 15, inStock: true, pack_in_stock: 400 },
      { _id: "SC_02", name: "Creamy Haborno Sauce", price: 15, inStock: true, pack_in_stock: 450 },
      { _id: "SC_03", name: "Cool Sour Cream", price: 15, inStock: true, pack_in_stock: 500 },
      { _id: "SC_04", name: "Creamy Avocado Ranch Dressing", price: 18, inStock: true, pack_in_stock: 350 },
      { _id: "SC_05", name: "Chipotle Mayo", price: 12, inStock: true, pack_in_stock: 400 },
      { _id: "SC_06", name: "Garlic Aioli", price: 12, inStock: true, pack_in_stock: 300 }
    ]);
    console.log("🌶️ Sauce Table elements configured cleanly.");

    // 7. 🍅 SEED SALSA TABLE (Table 6)
    await Salsa.insertMany([
      { _id: "SL_01", name: "Tangy Mango Salsa", price: 25, inStock: true, pack_in_stock: 200 },
      { _id: "SL_02", name: "Smoked Chipotle & Roasted Corn Salsa", price: 25, inStock: true, pack_in_stock: 250 },
      { _id: "SL_03", name: "Classic Mexican Salsa - Level 1 (Mild)", price: 20, inStock: true, pack_in_stock: 300 },
      { _id: "SL_04", name: "Classic Mexican Salsa - Level 2 (Medium)", price: 20, inStock: true, pack_in_stock: 300 },
      { _id: "SL_05", name: "Classic Mexican Salsa - Level 3 (Hot)", price: 20, inStock: true, pack_in_stock: 300 },
      { _id: "SL_06", name: "Classic Mexican Salsa - Level 4 (Extra Hot)", price: 22, inStock: true, pack_in_stock: 200 },
      { _id: "SL_07", name: "Classic Mexican Salsa - Level 5 (Insane Inferno)", price: 25, inStock: true, pack_in_stock: 150 },
      { _id: "SL_08", name: "Zesty Guacamole Premium Avocado", price: 45, inStock: true, pack_in_stock: 180 },
      { _id: "SL_09", name: "Mexican Seasoned Rice Base", price: 20, inStock: true, pack_in_stock: 600 },
      { _id: "SL_10", name: "Brown Cilantro-Lime Rice Base", price: 25, inStock: true, pack_in_stock: 400 }
    ]);
    console.log("🍅 Salsa Table matrix initialized.");

    // 8. 🥬 SEED TOPPING TABLE (Table 7)
    await Topping.insertMany([
      { _id: "TP_01", name: "Shredded Iceberg Lettuce", price: 10, inStock: true, pack_in_stock: 500 },
      { _id: "TP_02", name: "Diced Tomatoes", price: 10, inStock: true, pack_in_stock: 400 },
      { _id: "TP_03", name: "Chopped White Onions", price: 8, inStock: true, pack_in_stock: 300 },
      { _id: "TP_04", name: "Sliced Pickled Jalapeños", price: 12, inStock: true, pack_in_stock: 250 },
      { _id: "TP_05", name: "Fresh Diced Cilantro", price: 5, inStock: true, pack_in_stock: 200 },
      { _id: "TP_06", name: "Sliced Black Olives", price: 12, inStock: true, pack_in_stock: 200 },
      { _id: "TP_07", name: "Shredded Purple Cabbage", price: 10, inStock: true, pack_in_stock: 250 },
      { _id: "TP_08", name: "Grilled Bell Peppers Mix", price: 15, inStock: true, pack_in_stock: 300 }
    ]);
    console.log("🥬 Topping Table items locked into place.");
    // 9. 🍿 SEED APPETIZERS & SIDES TABLE (Table 8)
    await Side.insertMany([
      { _id: "SD_01", name: "Mexican Seasoned Fries", price: 60, inStock: true, pack_in_stock: 400, description: "Crispy skin-on potato fries dusted heavily in our house-blend Mexican seasoning powder mix." },
      { _id: "SD_02", name: "Tortilla Chips with Warm Nacho Cheese", price: 75, inStock: true, pack_in_stock: 350, description: "Crispy salted corn tortilla chips accompanied by a side of hot liquid golden nacho cheese dip." },
      { _id: "SD_03", name: "Veg Zingy Kicks (Mushroom & Paneer Pops)", price: 119, inStock: true, pack_in_stock: 280, description: "Bite-sized button mushrooms and fresh paneer cubes fried inside a high-crunch zesty herb batter casing." },
      { _id: "SD_04", name: "Smashed Potato Loaded Fries", price: 139, inStock: true, pack_in_stock: 200, description: "Our seasoned potato fries topped with signature warm cheese spreads, cool sour cream, and fresh chives." },
      { _id: "SD_05", name: "Cheesy Fiesta Corn Bowl", price: 89, inStock: true, pack_in_stock: 340, description: "Warm sweet kernel corn tossed with premium peppers, herb infusions, and melted stringy cheese blends." },
      { _id: "SD_06", name: "Crispy Onion Ring Crisps", price: 79, inStock: true, pack_in_stock: 210, description: "Hand-cut white onion rings coated inside a specialized cornmeal crumb shell for maximum crunch duration." }
    ]);
    console.log("🍿 Appetizers & Sides Table items generated.");

    // 10. 🥤 SEED BEVERAGES & CHILL FREEZES TABLE (Table 9)
    await Drink.insertMany([
      { _id: "DK_01", name: "Pepsi Masala Fizz", price: 72, inStock: true, pack_in_stock: 500, description: "Carbonated dark cola customized with a spicy local tang masala blend twist." },
      { _id: "DK_02", name: "Mirinda Orange Carbonated Drink", price: 60, inStock: true, pack_in_stock: 600, description: "High-fizz orange soda blend matching citrus notes with sweet bubble matrices." },
      { _id: "DK_03", name: "Seven-Up Clear Lemon Drink", price: 60, inStock: true, pack_in_stock: 450, description: "Crisp and clear lemon-lime fizzy soda crafted for instant clean palate cleansing." },
      { _id: "DK_04", name: "Mango Chilli Twist Freeze", price: 95, inStock: true, pack_in_stock: 300, description: "Thick icy slush freeze blending sweet seasonal mango fruit pulps with a punch of red chilli kick." },
      { _id: "DK_05", name: "Cold Brew Iced Coffee", price: 110, inStock: true, pack_in_stock: 250, description: "14-hour steep coffee extract layer balanced cleanly over cold whole milk and sweet syrup folds." },
      { _id: "DK_06", name: "Fresh Lime Mint Cooler", price: 80, inStock: true, pack_in_stock: 400, description: "Squeezed citrus lime juice shaken dynamically with crushed mint leaves and pure iced water sheets." },
      { _id: "DK_07", name: "Wild Berry Slush Freeze", price: 95, inStock: true, pack_in_stock: 320, description: "Pureed summer strawberries, blueberries, and raspberries blended into a thick cooling icy crystal mix." },
      { _id: "DK_08", name: "Salted Caramel Shake", price: 130, inStock: true, pack_in_stock: 180, description: "Creamy vanilla bean ice cream spun with deep artisanal caramel drizzles and a pinch of rock salt." }
    ]);
    console.log("🥤 Beverages & Chill Freezes Table parameters built.");

    // 11. 🍩 SEED SWEET DESSERTS TABLE (Table 10)
    await Dessert.insertMany([
      { _id: "DS_01", name: "Crispy Cinnamon Twists", price: 50, inStock: true, pack_in_stock: 700, description: "Light, crispy puffed corn twists rolled out heavily in sweet cinnamon and powdered sugar crusts." },
      { _id: "DS_02", name: "Churros with Melted Chocolate Dip", price: 135, inStock: true, pack_in_stock: 250, description: "Fried golden-brown choux dough sticks dusted in sugar and served with a warm premium dark chocolate pot." },
      { _id: "DS_03", name: "Melted Choco Quesadilla", price: 99, inStock: true, pack_in_stock: 320, description: "Warm grilled soft flour tortilla loaded with hot, oozing melted premium chocolate chunks." },
      { _id: "DS_04", name: "Warm Apple Cinnamon Soft Pie", price: 89, inStock: true, pack_in_stock: 190, description: "Flaky, buttery baked turnover pie stuffed with local sweet orchard apple chunks and warm baking spices." },
      { _id: "DS_05", name: "Dark Chocolate Smashed Brownie", price: 120, inStock: true, pack_in_stock: 240, description: "Thick, decadent, dense cocoa fudge cake block topped with local walnut crumbs and hot fudge swirls." },
      { _id: "DS_06", name: "Creamy Vanilla Bean Frost Dip", price: 60, inStock: true, pack_in_stock: 400, description: "A rich, cooling whipped vanilla cream dip cup designed for sweet companion dessert pairings." }
    ]);
    console.log("🍩 Sweet Desserts Table entries synchronized.");

    // 12. 📦 SEED SIDE AND EXTRA TABLE (Table 11)
    await SideAndExtra.insertMany([
      { _id: "SE_01", name: "Mild Sauce Packet", itemType: "Sauce Packet", price: 0, inStock: true, pack_in_stock: 5000 },
      { _id: "SE_02", name: "Hot Sauce Packet", itemType: "Sauce Packet", price: 0, inStock: true, pack_in_stock: 5000 },
      { _id: "SE_03", name: "Fire Sauce Packet", itemType: "Sauce Packet", price: 0, inStock: true, pack_in_stock: 4000 },
      { _id: "SE_04", name: "Diablo Sauce Packet", itemType: "Sauce Packet", price: 0, inStock: true, pack_in_stock: 3000 }
    ]);
    console.log("📦 SideAndExtra Sauce Packet Table successfully set.");
    // 13. 📋 SEED MENUITEM TABLE (Table 12 - with exact benefit properties injected)
    await MenuItem.insertMany([
      // Category 1: 🌮 SOFT SHELL TACO SELECTION
      { _id: "MN_01", productName: "Loaded Pinto Soft Taco", description: "Soft flour shell packed with multi-proteins, mixed cheeses, and garden toppings.", category: "🌮 SOFT SHELL TACO SELECTION", benefit: 25, linked_ingredients: ["SH_03", "PR_01", "PR_03", "CH_01", "CH_03", "SC_03", "SL_03", "TP_01", "TP_02", "TP_03"] },
      { _id: "MN_02", productName: "Habanero Fiesta Soft Taco", description: "Wheat shell stacked with black beans, corn mash, double sauces, and pickled toppings.", category: "🌮 SOFT SHELL TACO SELECTION", benefit: 28, linked_ingredients: ["SH_04", "PR_02", "PR_04", "CH_02", "SC_02", "SC_05", "SL_04", "TP_01", "TP_03", "TP_04"] },
      { _id: "MN_03", productName: "Ultimate Potato Crunch Soft Taco", description: "Soft wrap loaded with smashed potato bites, paneer cubes, lava cheese blends, and cilantro.", category: "🌮 SOFT SHELL TACO SELECTION", benefit: 30, linked_ingredients: ["SH_03", "PR_03", "PR_06", "CH_03", "CH_04", "SC_01", "SL_05", "TP_01", "TP_04", "TP_05"] },
      { _id: "MN_04", productName: "Creamy Garden Veggie Soft Taco", description: "Sweet corn mash, pinto beans, avocado ranch dressings, mango fruit salsa matrices, and herbs.", category: "🌮 SOFT SHELL TACO SELECTION", benefit: 22, linked_ingredients: ["SH_03", "PR_01", "PR_04", "CH_02", "SC_04", "SL_01", "TP_01", "TP_02", "TP_05"] },
      { _id: "MN_05", productName: "Plant Supreme Soft Wrap", description: "Double plant-based proteins, vegan cheeses, garlic spreads, chipotle salsas, and fresh purple cabbage layers.", category: "🌮 SOFT SHELL TACO SELECTION", benefit: 35, linked_ingredients: ["SH_04", "PR_05", "CH_05", "CH_06", "SC_06", "SL_02", "TP_01", "TP_06", "TP_07"] },

      // Category 2: ⚡ CRUNCHY HARD SHELL SELECTION
      { _id: "MN_06", productName: "Classic Crunchy Bean Multi-Cheese", description: "White corn shell layered with pinto beans, potato bits, cheddar, and warm nacho liquid cheese layers.", category: "⚡ CRUNCHY HARD SHELL SELECTION", benefit: 26, linked_ingredients: ["SH_01", "PR_01", "PR_03", "CH_01", "CH_03", "SC_03", "SL_03", "TP_01", "TP_02", "TP_03"] },
      { _id: "MN_07", productName: "Doritos Nacho Cheese Paneer Blast", description: "Doritos Nacho shell stacked with spiced paneer, black beans, hot sauces, and diced toppings.", category: "⚡ CRUNCHY HARD SHELL SELECTION", benefit: 32, linked_ingredients: ["SH_05", "PR_02", "PR_06", "CH_02", "CH_03", "SC_05", "SL_04", "TP_01", "TP_03", "TP_04"] },
      { _id: "MN_08", productName: "Inferno Crispy Red Fire Taco", description: "Red hot shell stuffed with black beans, plant strips, lava sauces, and level 5 ghost pepper salsas.", category: "⚡ CRUNCHY HARD SHELL SELECTION", benefit: 30, linked_ingredients: ["SH_02", "PR_02", "PR_05", "CH_01", "SC_01", "SL_07", "TP_01", "TP_03", "TP_04"] },
      { _id: "MN_09", productName: "Doritos Sweet Chilli Fiesta Combo", description: "Doritos Sweet Chilli shell filled with corn mash, potato bites, garlic spreads, and green blends.", category: "⚡ CRUNCHY HARD SHELL SELECTION", benefit: 28, linked_ingredients: ["SH_06", "PR_03", "PR_04", "CH_04", "SC_06", "SL_01", "TP_01", "TP_02", "TP_06"] },
      { _id: "MN_10", productName: "Crunchy Loaded Spiced Mash Taco", description: "White corn shell holding pinto mash, paneer cubes, cheese spreads, and fresh mango chunks.", category: "⚡ CRUNCHY HARD SHELL SELECTION", benefit: 25, linked_ingredients: ["SH_01", "PR_01", "PR_06", "CH_04", "SC_04", "SL_01", "TP_01", "TP_02", "TP_05"] },

      // Category 3: 🌯 LARGE TORTILLA BURRITOS
      { _id: "MN_11", productName: "Layered Bean & Rice Tortilla Wrap", description: "Giant flour tortilla packed with pinto beans, black beans, seasoned rice, cheddar, and salsa.", category: "🌯 LARGE TORTILLA BURRITOS", benefit: 28, linked_ingredients: ["SH_03", "PR_01", "PR_02", "CH_01", "SC_03", "SL_09", "TP_01", "TP_02", "TP_03"] },
      { _id: "MN_12", productName: "Cheesy Paneer Rice Burrito Tortilla", description: "Soft wrap with paneer cubes, potato chunks, cilantro-lime rice, mozzarella blends, and garlic spreads.", category: "🌯 LARGE TORTILLA BURRITOS", benefit: 32, linked_ingredients: ["SH_03", "PR_03", "PR_06", "CH_02", "CH_04", "SC_06", "SL_10", "TP_01", "TP_04", "TP_05"] },
      { _id: "MN_13", productName: "Plant-Based Whole Wheat Burrito Wrap", description: "Whole wheat wrap filled with mock-meat, corn mash, vegan cheeses, and smoky chipotle spreads.", category: "🌯 LARGE TORTILLA BURRITOS", benefit: 36, linked_ingredients: ["SH_04", "PR_04", "PR_05", "CH_05", "CH_06", "SL_02", "TP_01", "TP_06", "TP_07"] },
      { _id: "MN_14", productName: "Lava Potato Rice Burrito Tortilla", description: "Soft tortilla wrapping potato bites, pinto beans, Mexican rice, lava cheese, and habanero sauces.", category: "🌯 LARGE TORTILLA BURRITOS", benefit: 30, linked_ingredients: ["SH_03", "PR_01", "PR_03", "CH_03", "SC_01", "SC_02", "SL_09", "TP_01", "TP_03", "TP_04"] },
      { _id: "MN_15", productName: "Avocado Ranch Garden Tortilla Taco", description: "Soft wrap tracking corn mash, paneer, double white cheeses, avocado spreads, and mixed bell peppers.", category: "🌯 LARGE TORTILLA BURRITOS", benefit: 30, linked_ingredients: ["SH_03", "PR_04", "PR_06", "CH_02", "CH_04", "SC_04", "SL_01", "TP_01", "TP_02", "TP_08"] },

      // Category 4: 🍟 CORN TORTILLA CHIPS BOXES
      { _id: "MN_16", productName: "Standard Chips Box Supreme", description: "Corn tortilla chips box loaded with pinto beans, melted nacho cheese, sour cream, and salsas.", category: "🍟 CORN TORTILLA CHIPS BOXES", benefit: 40, linked_ingredients: ["SH_07", "PR_01", "CH_03", "SC_03", "SL_04", "TP_01", "TP_02", "TP_03"] },
      { _id: "MN_17", productName: "Peri Peri Chips Box Blast", description: "Spicy peri peri chips box packed with black beans, paneer cubes, lava cheese, and hot pepper mashes.", category: "🍟 CORN TORTILLA CHIPS BOXES", benefit: 45, linked_ingredients: ["SH_08", "PR_02", "PR_06", "CH_03", "SC_01", "SL_05", "TP_01", "TP_03", "TP_04"] },
      { _id: "MN_18", productName: "Loaded Potato Chips Box Extravaganza", description: "Regular chips box covered in potato mash, corn mash, cheese spreads, garlic sauces, and garden toppings.", category: "🍟 CORN TORTILLA CHIPS BOXES", benefit: 42, linked_ingredients: ["SH_07", "PR_03", "PR_04", "CH_04", "SC_06", "SL_01", "TP_01", "TP_02", "TP_05"] },
      { _id: "MN_19", productName: "Vegan Chips Box Master", description: "Corn chips box layered with plant-based strips, vegan cheddars, vegan mozzarellas, and guacamoles.", category: "🍟 CORN TORTILLA CHIPS BOXES", benefit: 50, linked_ingredients: ["SH_07", "PR_05", "CH_05", "CH_06", "SL_08", "TP_01", "TP_06", "TP_07"] },
      { _id: "MN_20", productName: "Inferno Chips Box Hellfire", description: "Peri peri chips box smothered in black beans, mock meat, triple cheeses, and inferno level 5 salsas.", category: "🍟 CORN TORTILLA CHIPS BOXES", benefit: 48, linked_ingredients: ["SH_08", "PR_02", "PR_05", "CH_01", "CH_02", "CH_03", "SL_07", "TP_01", "TP_04", "TP_08"] },

      // Category 5: 🌟 MULTI-SHELL MIX & MATCH COMBOS
      { _id: "MN_21", productName: "Cheesy Double Decker Master", description: "Hard corn shell glued to a soft flour wrap via nacho sauce, encasing pinto and potato mashes.", category: "🌟 MULTI-SHELL MIX & MATCH COMBOS", benefit: 32, linked_ingredients: ["SH_01", "SH_03", "CH_03", "PR_01", "PR_03", "SC_03", "SL_04", "TP_01", "TP_02", "TP_03"] },
      { _id: "MN_22", productName: "Doritos Hybrid Paneer Fusion", description: "Doritos Nacho shell joined to a whole wheat wrap via cheese spreads, filled with paneer and black beans.", category: "🌟 MULTI-SHELL MIX & MATCH COMBOS", benefit: 38, linked_ingredients: ["SH_05", "SH_04", "CH_04", "PR_02", "PR_06", "SC_05", "SL_02", "TP_01", "TP_03", "TP_05"] },
      { _id: "MN_23", productName: "Inferno Red Flour Double Decker", description: "Red hot crispy corn shell fused to a flour tortilla via lava sauces, stuffed with mock meat codes.", category: "🌟 MULTI-SHELL MIX & MATCH COMBOS", benefit: 36, linked_ingredients: ["SH_02", "SH_03", "CH_01", "CH_03", "SC_01", "SL_07", "TP_01", "TP_04", "TP_08"] },
      { _id: "MN_24", productName: "Doritos Sweet Wheat Double Shell", description: "Doritos Sweet Chilli shell mounted inside a whole wheat wrap with potato and corn mash layers.", category: "🌟 MULTI-SHELL MIX & MATCH COMBOS", benefit: 35, linked_ingredients: ["SH_06", "SH_04", "CH_01", "CH_02", "PR_03", "PR_04", "SC_06", "SL_01", "TP_01", "TP_02", "TP_06"] },
      { _id: "MN_25", productName: "Triple Shell Hybrid Extravaganza", description: "Advanced custom configuration stacking hard shell, red shell, and soft tortilla layers together.", category: "🌟 MULTI-SHELL MIX & MATCH COMBOS", benefit: 42, linked_ingredients: ["SH_01", "SH_02", "SH_03", "PR_01", "PR_05", "CH_01", "SC_01", "SL_06", "TP_01", "TP_03", "TP_07"] },

            // Category 6: 🥤 BIG BELL VALUE MEAL BOXES
      { _id: "MN_26", productName: "Classic Veg Block Combo Box", description: "Features Loaded Pinto Soft Taco, Seasoned Fries, Cinnamon Twists, and a Pepsi Masala Fizz drink.", category: "🥤 BIG BELL VALUE MEAL BOXES", benefit: 55, linked_ingredients: ["MN_01", "SD_01", "DS_01", "DK_01"] },
      { _id: "MN_27", productName: "Doritos Premium Value Box", description: "Features Doritos Nacho Paneer Blast served next to Loaded Chips, Churros, and a Mirinda Orange drink.", category: "🥤 BIG BELL VALUE MEAL BOXES", benefit: 65, linked_ingredients: ["MN_07", "SD_02", "DS_02", "DK_02"] },
      { _id: "MN_28", productName: "Smashed Inferno Fire Combo Box", description: "Features Inferno Crispy Red Fire Taco paired with Smashed Loaded Fries, Apple Pie, and a Mango Twist freeze.", category: "🥤 BIG BELL VALUE MEAL BOXES", benefit: 62, linked_ingredients: ["MN_08", "SD_04", "DS_04", "DK_04"] },
      { _id: "MN_29", productName: "Plant-Based Healthy Value Box", description: "Features Plant Supreme Soft Wrap grouped with a Fiesta Corn Bowl, Frost Dip, and Fresh Lime Mint Cooler.", category: "🥤 BIG BELL VALUE MEAL BOXES", benefit: 70, linked_ingredients: ["MN_05", "SD_05", "DS_06", "DK_06"] },
      { _id: "MN_30", productName: "Cheesy Smashed Potato Combo Box", description: "Features Ultimate Potato Crunch Soft Taco alongside Onion Rings, Choco Quesadilla, and an Iced Coffee brew.", category: "🥤 BIG BELL VALUE MEAL BOXES", benefit: 60, linked_ingredients: ["MN_03", "SD_06", "DS_03", "DK_05"] }
    ]);
    console.log("📋 MenuItem Table initialized with new dynamic benefit offset numbers successfully.");

    // 14. 🏷️ SEED LIVE OFFERS & LOYALTY DEALS TABLE (Table 17)
    await Deal.insertMany([
      { _id: "DL_01", dealCode: "TACOCLUB60", title: "💳 [MEMBERS ONLY] WELCOME 60% BOX EXPLOSION", subtitle: "60% off your custom box build sequence.", discountType: "Percentage", discountValue: 60, minCartValue: 199, maxDiscount: 120, for_member: true, isActive: true },
      { _id: "DL_02", dealCode: "FREEFRY", title: "🍟 [MEMBERS ONLY] FREE FIESTA FRIES REWARD", subtitle: "Claim a free Mexican Seasoned Fries side row.", discountType: "FreeItem", discountValue: 0, minCartValue: 350, maxDiscount: 0, for_member: true, isActive: true },
      { _id: "DL_03", dealCode: "BELL100", title: "💰 [ALL USERS] FLAT ₹100 BIG BELL VALUE CRUNCH", subtitle: "Flat ₹100 instant cash discount on value boxes.", discountType: "FlatAmount", discountValue: 100, minCartValue: 499, maxDiscount: 100, for_member: false, isActive: true },
      { _id: "DL_04", dealCode: "LAVABOOST", title: "⚡ [MEMBERS ONLY] ALL-DAY LAVA BOOST COMBO REWARD", subtitle: "Free Pepsi Masala Fizz and Cinnamon Twists combo.", discountType: "FreeItem", discountValue: 0, minCartValue: 299, maxDiscount: 0, for_member: true, isActive: true },
      { _id: "DL_05", dealCode: "PANEERFREE", title: "🧀 [MEMBERS ONLY] FREE SPICED PANEER UPGRADE LOYALTY", subtitle: "Unlock a complimentary Mushroom & Paneer Pops side.", discountType: "FreeItem", discountValue: 0, minCartValue: 399, maxDiscount: 0, for_member: true, isActive: true },
      { _id: "DL_06", dealCode: "WEEKENDVIP", title: "👑 [MEMBERS ONLY] 20% OFF WEEKEND VIP FIESTA FEAST", subtitle: "VIP Member weekend accelerator group discount.", discountType: "Percentage", discountValue: 20, minCartValue: 699, maxDiscount: 200, for_member: true, isActive: true },
      { _id: "DL_07", dealCode: "SWEETCHILLI", title: "🍩 [ALL USERS] FREE ELITE CHOCO QUESADILLA ROLLOVER", subtitle: "Claim a free Melted Choco Quesadilla sweet plate.", discountType: "FreeItem", discountValue: 0, minCartValue: 249, maxDiscount: 0, for_member: false, isActive: true },
      { _id: "DL_08", dealCode: "CASHCRUNCH", title: "🚀 [MEMBERS ONLY] VIP STATUS FLAT ₹150 MEAL ACCELERATOR", subtitle: "Flat ₹150 off on bulk orders to celebrate level status.", discountType: "FlatAmount", discountValue: 150, minCartValue: 1099, maxDiscount: 150, for_member: true, isActive: true }
    ]);
    console.log("🏷️ Active membership deals catalog seeded cleanly.");

    console.log("🎉 Complete Data Migration Execution Finished Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Engine Failure Stack Loop:", error.message);
    process.exit(1);
  }
};

seedDatabase();
