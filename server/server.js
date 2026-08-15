const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const multer = require("multer");
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

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WEBP images are allowed.")
      );
    }

    callback(null, true);
  },
});

function getImageExtension(mimetype) {
  if (mimetype === "image/png") {
    return "png";
  }

  if (mimetype === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/listing-images/";

  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.slice(markerIndex + marker.length)
  );
}

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
      .order("created_at", {
        ascending: false,
      });

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

app.post(
  "/api/listings",
  upload.single("image"),
  async (req, res) => {
    let uploadedImagePath = null;

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

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          error: "Price must be a valid positive number.",
        });
      }

      let imageUrl = null;

      if (req.file) {
        const extension = getImageExtension(
          req.file.mimetype
        );

        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}.${extension}`;

        uploadedImagePath = `listings/${uniqueName}`;

        const {
          error: storageUploadError,
        } = await supabase.storage
          .from("listing-images")
          .upload(
            uploadedImagePath,
            req.file.buffer,
            {
              contentType: req.file.mimetype,
              upsert: false,
            }
          );

        if (storageUploadError) {
          console.error(
            "Supabase Storage upload error:",
            storageUploadError
          );

          return res.status(500).json({
            error: "Could not upload listing image.",
          });
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("listing-images")
            .getPublicUrl(uploadedImagePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const listingToCreate = {
        title: title.trim(),
        price: numericPrice,
        location: location.trim(),
        category: category.trim(),
        description: description.trim(),
        image_url: imageUrl,
      };

      const { data, error } = await supabase
        .from("listings")
        .insert(listingToCreate)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase POST error:",
          error
        );

        if (uploadedImagePath) {
          await supabase.storage
            .from("listing-images")
            .remove([uploadedImagePath]);
        }

        return res.status(500).json({
          error: "Could not create listing.",
        });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error(
        "POST /api/listings error:",
        error
      );

      if (uploadedImagePath) {
        await supabase.storage
          .from("listing-images")
          .remove([uploadedImagePath]);
      }

      return res.status(500).json({
        error: "Could not create listing.",
      });
    }
  }
);

/* =========================================================
   DELETE LISTING
   DEVELOPMENT ONLY FOR NOW
   ========================================================= */

app.delete(
  "/api/listings/:id",
  async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error:
          "Deleting listings is disabled until authentication is enabled.",
      });
    }

    try {
      const listingId = Number(req.params.id);

      if (!Number.isFinite(listingId)) {
        return res.status(400).json({
          error: "Invalid listing ID.",
        });
      }

      const {
        data: existingListing,
        error: lookupError,
      } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "Supabase listing lookup error:",
          lookupError
        );

        return res.status(500).json({
          error: "Could not delete listing.",
        });
      }

      if (!existingListing) {
        return res.status(404).json({
          error: "Listing not found.",
        });
      }

      const { data, error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error(
          "Supabase DELETE error:",
          error
        );

        return res.status(500).json({
          error: "Could not delete listing.",
        });
      }

      if (existingListing.image_url) {
        const storagePath =
          getStoragePathFromPublicUrl(
            existingListing.image_url
          );

        if (storagePath) {
          const {
            error: storageDeleteError,
          } = await supabase.storage
            .from("listing-images")
            .remove([storagePath]);

          if (storageDeleteError) {
            console.error(
              "Could not remove listing image:",
              storageDeleteError
            );
          }
        }
      }

      return res.json({
        message: "Listing deleted.",
        listing: data,
      });
    } catch (error) {
      console.error(
        "DELETE /api/listings/:id error:",
        error
      );

      return res.status(500).json({
        error: "Could not delete listing.",
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
   ========================================================= */

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error:
          "Image is too large. Maximum size is 5 MB.",
      });
    }

    return res.status(400).json({
      error: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(
    `✅ Swap API running on http://localhost:${PORT}`
  );
  console.log("✅ Supabase connected");
});