const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("❌ Missing Supabase environment variables.");
  console.error(
    "Make sure server/.env contains SUPABASE_URL and SUPABASE_SECRET_KEY."
  );

  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Swap API is running",
  });
});

/* =========================================================
   GET ALL LISTINGS
   ========================================================= */

app.get("/api/listings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET error:", error);

      return res.status(500).json({
        error: "Could not load listings.",
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("GET /api/listings error:", error);

    return res.status(500).json({
      error: "Could not load listings.",
    });
  }
});

/* =========================================================
   CREATE LISTING
   ========================================================= */

app.post("/api/listings", async (req, res) => {
  try {
    const {
      title,
      price,
      location,
      category,
      description,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      price === undefined ||
      price === null ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        error: "All listing fields are required.",
      });
    }

    const numericPrice = Number(
      String(price)
        .replace(/\$/g, "")
        .replace(/,/g, "")
        .trim()
    );

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: "Price must be a valid positive number.",
      });
    }

    const listingToCreate = {
      title: title.trim(),
      price: numericPrice,
      location: location.trim(),
      category: category.trim(),
      description: description.trim(),
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(listingToCreate)
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);

      return res.status(500).json({
        error: "Could not create listing.",
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error("POST /api/listings error:", error);

    return res.status(500).json({
      error: "Could not create listing.",
    });
  }
});

/* =========================================================
   DELETE LISTING
   DEVELOPMENT ONLY FOR NOW

   Later this will be replaced with authenticated,
   owner-only deletion.
   ========================================================= */

app.delete("/api/listings/:id", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      error: "Deleting listings is disabled until authentication is enabled.",
    });
  }

  try {
    const listingId = Number(req.params.id);

    if (!Number.isFinite(listingId)) {
      return res.status(400).json({
        error: "Invalid listing ID.",
      });
    }

    const { data, error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Supabase DELETE error:", error);

      return res.status(500).json({
        error: "Could not delete listing.",
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "Listing not found.",
      });
    }

    return res.json({
      message: "Listing deleted.",
      listing: data,
    });
  } catch (error) {
    console.error("DELETE /api/listings/:id error:", error);

    return res.status(500).json({
      error: "Could not delete listing.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Swap API running on http://localhost:${PORT}`);
  console.log("✅ Supabase connected");
});