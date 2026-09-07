// ==========================================================================
// FHE Traders — Per-variant detail
//
// Selecting a model chip on a product page should tell the customer something
// useful about THAT variant, not just re-send the same paragraph. This module
// resolves a product + model name into:
//
//   { desc, image }
//
//   desc   what this specific variant is / what it suits  (always returned)
//   image  a variant-specific photo, when one exists      (may be null)
//
// Descriptions are derived per category from the model name, with an explicit
// table for the fittings lines where each "model" is genuinely a different
// product rather than a different size of the same one.
//
// Guidance figures are indicative for sizing conversations only — confirm the
// exact spec against the datasheet for the unit in stock.
// ==========================================================================

// --------------------------------------------------------------------------
// Electrical fittings: each item is its own product.
// image keys point at files in images/products/variants/
// --------------------------------------------------------------------------
const FITTING_ITEMS = {
  "1-Gang Switch": {
    img: "switch-1gang",
    desc: "A single rocker on one plate — one light or fan point. The standard switch for a bedroom light, a stair light or any single point fed from its own box.",
  },
  "2-Gang Switch": {
    img: null,   // no accurate stock shot — falls back to the brand photo
    desc: "Two rockers on a single plate, so two points are controlled from one box — a room light plus its fan, or a light plus an outside light.",
  },
  "3-Gang Switch": {
    img: "switch-3gang",
    desc: "Three rockers on one plate. Common at a room entrance where the ceiling light, the fan and a side light are all switched from the same position.",
  },
  "5-Gang Board": {
    img: "board-multigang",
    desc: "A five-way board for a room that needs several points switched together — lights, fan and sockets on one plate rather than three separate boxes.",
  },
  "6-Gang Board": {
    img: "board-multigang",
    desc: "Six ways on one board. Usually the main plate in a living room or shop counter, where everything in the space is switched from one place.",
  },
  "5A Socket": {
    img: "socket-5a",
    desc: "A light-duty 5A outlet for lamps, phone chargers, a TV or a router. Not intended for heating or motor loads — use the 15A socket for those.",
  },
  "15A Power Socket": {
    img: "socket-15a",
    desc: "A heavy-duty 15A outlet for air conditioners, water heaters, irons and pump motors. Run it on its own properly-rated circuit and breaker.",
  },
  "2-Pin Socket": {
    img: "socket-5a",
    desc: "A two-pin outlet for small unearthed appliances and chargers. For anything with a metal body or a motor, use a 3-pin earthed socket instead.",
  },
  "3-Pin Socket": {
    img: "socket-3pin",
    desc: "A three-pin earthed outlet — the right choice for anything with a metal body or a motor, because the earth pin gives a fault path away from the user.",
  },
  "Fan Dimmer / Regulator": {
    img: "fan-regulator",
    desc: "Controls ceiling fan speed from the wall plate. Electronic regulators run cooler and waste less than the old resistive type, and fit a standard gang position.",
  },
  "Bell Push": {
    img: "bell-push",
    desc: "A momentary push for a door bell or buzzer — it makes contact only while pressed, so nothing is left switched on.",
  },
  "TV & Telephone Outlet": {
    img: null,   // no accurate stock shot — falls back to the brand photo
    desc: "A faceplate carrying TV aerial and telephone connections, so signal cabling terminates neatly at the wall instead of hanging loose behind furniture.",
  },
  "Switch-Socket Combined Board": {
    img: "board-multigang",
    desc: "A switch and socket sharing one plate, with the switch controlling the outlet. Handy where an appliance should be isolated without unplugging it.",
  },
  "Blank Plate": {
    img: null,   // no accurate stock shot — falls back to the brand photo
    desc: "Closes off a box that isn't in use — either kept for a future point or left over after a change. It keeps live terminals covered and the wall tidy.",
  },
  "Lamp Holder": {
    img: "lamp-holder",
    desc: "A batten or pendant holder for a bulb, in the standard B22 bayonet fitting. Ceiling or wall mounted, and it takes any of the LED bulbs we stock.",
  },
  "3-Pin Plug Top": {
    img: null,   // no accurate stock shot — falls back to the brand photo
    desc: "A rewireable three-pin plug for fitting to appliance flex. Screw terminals mean a damaged plug can be replaced without cutting the cable short.",
  },
};

// --------------------------------------------------------------------------
// Helpers to read a figure out of a model label
// --------------------------------------------------------------------------
function numFrom(model) {
  const m = String(model).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function band(value, table, fallback) {
  for (const [limit, text] of table) {
    if (value <= limit) return text;
  }
  return fallback;
}

// --------------------------------------------------------------------------
// Per-category description builders
// --------------------------------------------------------------------------
function inverterDesc(kw, name) {
  const guide = band(kw, [
    [2, "Enough for lights, fans and a TV through an outage — an essentials-only backup rather than a whole-house system."],
    [3.6, "Suits a small home or a shop: lights, fans, a fridge and a few sockets, with a little headroom."],
    [5.8, "The most common domestic size. Runs a typical 3–4 bedroom house including a fridge and a water pump, though not usually air conditioning."],
    [8, "Comfortable for a larger house, or a smaller one that needs to run an inverter air conditioner off solar."],
    [12, "For a large house or a small commercial load — several ACs, a deep freezer, or shop equipment running through the day."],
  ], "A high-capacity unit for commercial loads.");
  return kw + "kW " + name + ". " + guide +
    " Actual capability depends on your surge loads and battery bank, so bring us your appliance list and we will size it properly.";
}

function batteryDesc(kwh, name) {
  const guide = band(kwh, [
    [2.5, "A small bank for essential loads — lights, fans and a router for a few hours."],
    [5, "The usual starting point for a home: an evening of lights, fans and a fridge, or a shorter run including heavier appliances."],
    [10, "Covers a full evening and overnight for most households, and enough to ride out long outages."],
    [16, "Enough to run a house through the night with air conditioning on part of it, or to store a full day of solar for later use."],
  ], "A large bank for whole-house independence or commercial backup, and for storing a full day of generation.");
  return kwh + "kWh " + name + ". " + guide +
    " Usable energy depends on the depth of discharge the BMS allows, so treat these as planning figures.";
}

function panelDesc(w) {
  return w + "W module. Around " + Math.round(1000 / w * 10) / 10 +
    " panels give roughly 1kW of array, so a " + Math.ceil(5000 / w) +
    "-panel string is about a 5kW system. Higher-wattage modules mean fewer panels, fewer clamps and less stand steel for the same output — usually the cheaper way to reach a given size.";
}

function lightDesc(w, kind) {
  const guide = band(w, [
    [7, "Suited to accent points, corridors and small spaces."],
    [15, "A good general fitting for a bedroom or bathroom."],
    [30, "Bright enough for a living room, kitchen or shop aisle."],
    [72, "A high-output fitting for large rooms, offices and retail floors."],
  ], "A high-power unit for yards, facades and industrial spaces.");
  return w + "W " + kind + ". " + guide +
    " As a rough guide an LED gives 90–110 lumens per watt, so this is in the region of " +
    (w * 90) + "–" + (w * 110) + " lumens.";
}

function bladeDesc(n) {
  const map = {
    2: "Two blades move the most air for a given motor, which is why they are still the choice where cooling matters more than quiet — workshops, kitchens and verandas.",
    3: "Three blades are the everyday balance of airflow and noise, and the most widely fitted configuration in Pakistani homes.",
    4: "Four blades push a gentler, wider spread of air and run quieter than a 2 or 3 blade at the same speed. A good bedroom choice.",
    5: "Five blades give the smoothest, quietest air movement. Least draughty of the options, and the usual pick for a bedroom or a formal room.",
    6: "Six blades move a lot of air at low speed, so you get the cooling without the noise of a fan running flat out.",
  };
  return n + " blade. " + (map[n] || "");
}

function inchDesc(inches, kind) {
  const guide = band(inches, [
    [8, "Sized for a bathroom, a small toilet or a compact kitchen."],
    [12, "The usual size for a domestic kitchen or a larger bathroom."],
    [18, "Moves enough air for a big kitchen, a workshop or a small hall."],
  ], "A commercial size for restaurant kitchens, factories and production areas.");
  return inches + " inch " + kind + ". " + guide;
}

function vfdDesc(model) {
  const m = String(model).match(/(\d+)\D+(\d+)/);
  if (!m) return null;
  const lo = parseInt(m[1], 10), hi = parseInt(m[2], 10);
  return lo + "–" + hi + "kW drive, roughly " + Math.round(lo * 1.34) + "–" + Math.round(hi * 1.34) +
    " HP of motor. Match the drive to the motor's rated current rather than to its horsepower alone, and allow headroom for a hard-starting pump. We can check the plate rating with you before you order.";
}

function cableDesc(model) {
  const table = {
    "3/.029": "About 1.5 mm². Lighting circuits and bell wiring — not for sockets.",
    "7/.029": "About 2.5 mm². The standard size for general socket circuits in a home.",
    "7/.036": "About 4 mm². Heavier socket circuits and short sub-mains.",
    "7/.044": "About 6 mm². Air conditioner points, water heaters and pump feeds.",
    "7/.052": "About 10 mm². Sub-main runs and heavy single loads.",
    "7/.064": "About 16 mm². Main feeds to a distribution board.",
    "7/.076": "About 25 mm². Main incoming and larger sub-mains.",
    "19/.064": "About 35 mm². Main incoming on a larger property.",
    "19/.075": "About 50 mm². Heavy main incoming and commercial feeds.",
    "1.0 mm²": "Lighting circuits and control wiring.",
    "1.5 mm²": "Lighting circuits; the metric equivalent of 3/.029.",
    "2.5 mm²": "General socket circuits; the metric equivalent of 7/.029.",
    "4 mm²": "Heavier socket circuits and short sub-mains.",
    "6 mm²": "AC points, water heaters and pump feeds.",
    "10 mm²": "Sub-mains and heavy single loads.",
    "16 mm²": "Main feeds to a distribution board.",
  };
  const t = table[model];
  return t ? model + " — " + t + " Always size the cable to the load and the run length; a long run needs the next size up to hold the voltage drop." : null;
}

const STAND_DESC = {
  "L2 / C Type": "Two-level frame in C-channel, carrying two panels per set. The lighter and cheaper of the two profiles — right where the roof is sheltered and the array is small.",
  "L2 / U Type": "Two-level frame in the heavier U-channel. Same two-panel layout, more rigidity for an exposed roof or a windier site.",
  "L3 / C Type": "Three-level C-channel frame for three panels per set. The extra height clears parapet walls and water tanks that would otherwise shade the bottom row — our most-specified stand.",
  "L3 / U Type": "Three-level frame in U-channel. Choose this over the C type when the array is both tall and large enough to want the extra structural margin.",
  "L4 / C Type": "Four-level C-channel frame — the tallest we stock. For roofs boxed in by walls or neighbouring buildings, and it leaves usable shaded space underneath.",
};

// --------------------------------------------------------------------------
// Public resolver
// --------------------------------------------------------------------------
function getVariantInfo(product, model) {
  if (!product || !model) return { desc: null, image: null };
  const cat = product.category;
  const n = numFrom(model);

  // Fittings: each item is a distinct product with its own photo
  if (cat === "fittings") {
    const item = FITTING_ITEMS[model];
    if (item) {
      return {
        desc: item.desc,
        image: item.img ? "images/products/variants/" + item.img + ".jpg" : null,
      };
    }
  }

  if (cat === "solar-stands") return { desc: STAND_DESC[model] || null, image: null };
  if (cat === "vfd") return { desc: vfdDesc(model), image: null };
  if (cat === "wiring") return { desc: cableDesc(model), image: null };

  if (cat === "solar-panels" && n) return { desc: panelDesc(n), image: null };
  if (cat === "inverters" && n) return { desc: inverterDesc(n, "hybrid inverter"), image: null };
  if (cat === "batteries" && n) return { desc: batteryDesc(n, "LiFePO4 bank"), image: null };

  if (cat === "fans") {
    if (/blade/i.test(model) && n) return { desc: bladeDesc(n), image: null };
    if (/inch/i.test(model) && n) {
      const kind = /exhaust/i.test(product.name) ? "exhaust fan"
        : /pedestal/i.test(product.name) ? "pedestal fan"
        : /bracket/i.test(product.name) ? "bracket fan" : "fan";
      return { desc: inchDesc(n, kind), image: null };
    }
  }

  if (cat === "lighting") {
    if (n && /w$/i.test(String(model).trim())) {
      const kind = product.name.replace(/^LED\s+/i, "").toLowerCase();
      return { desc: lightDesc(n, kind), image: null };
    }
    // colour / supply options on rope and neon
    if (/white|rgb|red|blue|green|pink/i.test(model)) {
      return {
        desc: model + ". " + (/rgb/i.test(model)
          ? "Colour-changing, driven by the supplied controller — used for signage and feature lighting rather than as a room light."
          : "A fixed-colour run, which holds its tone consistently along the whole length."),
        image: null,
      };
    }
    if (/per metre|per roll/i.test(model)) {
      return {
        desc: /roll/i.test(model)
          ? "Sold as a full roll — the cheaper way to buy it for a large job, and it avoids joins mid-run."
          : "Sold by the metre, cut to the length you need at the marked intervals.",
        image: null,
      };
    }
  }

  if (cat === "distribution" && n) {
    if (/way/i.test(model)) {
      return {
        desc: n + "-way board: room for " + n + " breakers. Leave two or three ways spare — adding a circuit later is far cheaper than replacing the board.",
        image: null,
      };
    }
    if (/a$/i.test(String(model).trim())) {
      return {
        desc: n + "A breaker. Size it to the cable, not to the appliance: a breaker larger than the cable can carry removes the protection the cable needs.",
        image: null,
      };
    }
  }

  return { desc: null, image: null };
}

// Expose for product.html
window.getVariantInfo = getVariantInfo;
