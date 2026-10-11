// backend/routes/menu.js
import express from 'express';

// Import all independent inventory asset models natively
import Shell from '../models/Shell.js';
import Protein from '../models/Protein.js';
import Cheese from '../models/Cheese.js';
import Sauce from '../models/Sauce.js';
import Salsa from '../models/Salsa.js';
import Topping from '../models/Topping.js';
import Side from '../models/Side.js';
import Drink from '../models/Drink.js';
import Dessert from '../models/Dessert.js';
import MenuItem from '../models/MenuItem.js';
import SideAndExtra from '../models/SideAndExtra.js';

const router = express.Router();

// @route   GET /api/menu
// @desc    Dynamic aggregation pipeline fetching all separate tables
router.get('/', async (req, res) => {
  try {
    // 1. Fetch raw rows concurrently from MongoDB Atlas cloud clusters
    const [
      dbShells, dbProteins, dbCheeses, dbSauces,
      dbSalsas, dbToppings, dbSides, dbDrinks, dbDesserts, dbMenuItems
    ] = await Promise.all([
      Shell.find({}), Protein.find({}), Cheese.find({}), Sauce.find({}),
      Salsa.find({}), Topping.find({}), Side.find({}), Drink.find({}), 
      Dessert.find({}), MenuItem.find({})
    ]);

    // Create a unified master lookup catalog directory dictionary out of all internal pantry rows
    const pantryLookup = {};
    const registerItems = (itemsList) => {
      itemsList.forEach(item => { pantryLookup[item._id] = item.price; });
    };

    registerItems(dbShells); registerItems(dbProteins); registerItems(dbCheeses);
    registerItems(dbSauces); registerItems(dbSalsas); registerItems(dbToppings);

    // 2. Stream standalone assets natively (Tables 8, 9, 10)
    const formattedSides = dbSides.map(item => ({
      _id: item._id, productName: item.name, description: item.description, baseCost: item.price, category: "🍿 APPETIZERS & SIDES", benefit: 0, inStock: item.inStock
    }));

    const formattedDrinks = dbDrinks.map(item => ({
      _id: item._id, productName: item.name, description: item.description, baseCost: item.price, category: "🥤 BEVERAGES & CHILL FREEZES", benefit: 0, inStock: item.inStock
    }));

    const formattedDesserts = dbDesserts.map(item => ({
      _id: item._id, productName: item.name, description: item.description, baseCost: item.price, category: "🍩 SWEET DESSERTS", benefit: 0, inStock: item.inStock
    }));

    // 3. Dynamic Cost Calculator Core Engine: Reconstruct MenuItem values on the fly
    const computedMenuItems = dbMenuItems.map(item => {
      let liveAggregatedCost = 0;

      // Loop over matching relational array references and compile sums dynamically
      if (item.linked_ingredients && item.linked_ingredients.length > 0) {
        item.linked_ingredients.forEach(idKey => {
          const matchedSubMenuItem = dbMenuItems.find(m => m._id === idKey);
          if (matchedSubMenuItem) {
            matchedSubMenuItem.linked_ingredients.forEach(subId => {
              liveAggregatedCost += (pantryLookup[subId] || 0);
            });
          } else {
            liveAggregatedCost += (pantryLookup[idKey] || 0);
          }
        });
      }

      // If the item falls under Category 6 (Value Boxes), apply package combo deal discount adjustment
      if (item.category.includes("BIG BELL VALUE MEAL BOXES")) {
        liveAggregatedCost = Math.round(liveAggregatedCost * 0.70);
      } else {
        liveAggregatedCost = Math.round(liveAggregatedCost);
      }

      return {
        _id: item._id,
        productName: item.productName,
        description: item.description,
        category: item.category,
        linked_ingredients: item.linked_ingredients || [], // 🔗 needed by the popup to pre-select the recipe
        benefit: item.benefit || 0, // 💰 Streams the baseline benefit number safely to frontend state
        baseCost: liveAggregatedCost,
        inStock: true
      };
    });

    // Combine all primary menu item selections and secondary extra dishes into one single production catalog array feed
    const unifiedMasterCatalogFeed = [
      ...computedMenuItems,
      ...formattedSides,
      ...formattedDrinks,
      ...formattedDesserts
    ];

    res.status(200).json(unifiedMasterCatalogFeed);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "API Dynamic Router Aggregator failure stack error", 
      error: error.message 
    });
  }
});

// GET /api/menu/names — { "SH_01": "Soft Flour Tortilla", ... } so cart/order pages can print readable recipes
router.get('/names', async (req, res) => {
  try {
    const tables = [Shell, Protein, Cheese, Sauce, Salsa, Topping, Side, Drink, Dessert, SideAndExtra];
    const lists = await Promise.all(tables.map((m) => m.find({}).select('name').lean()));
    const map = {};
    lists.flat().forEach((row) => { map[row._id] = row.name; });
    (await MenuItem.find({}).select('productName').lean()).forEach((row) => { map[row._id] = row.productName; });
    res.status(200).json(map);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
