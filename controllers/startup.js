const formidable = require("formidable");
const _ = require("lodash");
const Startup = require("../models/startup");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const startup = require("../models/startup");
const needle = require("needle");
const { parse } = require("path");

const options = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
  },
};
exports.startupById = (req, res, next, id) => {
  Startup.findById(id)
    .populate("category")
    .exec((err, startup) => {
      if (err || !startup) {
        return res.status(400).json({
          error: "Startup not found !",
        });
      }
      req.startup = startup;
      next();
    });
};
exports.read = (req, res) => {
  return res.json(req.startup);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  console.log(form);
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    const {
      name,
      description,
      email,
      category,
      country,
      address,
      year_founded,
      employee_range,
      total_fundings,
    } = fields;
    if (
      !name ||
      !description ||
      !email ||
      !category ||
      !country ||
      !address ||
      !year_founded ||
      !employee_range ||
      !total_fundings
    ) {
      return res.status(400).json({
        error: "All fields are required !",
      });
    }
    let startup = new Startup(fields);

    console.log("files values");
    console.log(files);
    if (files.photo) {
      console.log("this is the path " + files.photo.filepath);

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image Should be less than 1mb size",
        });
      }
      startup.photo.data = fs.readFileSync(String(files.photo.filepath));
      console.log(files.photo.originalFilename);
      startup.photo.contentType = files.photo.type;
      console.log(files.photo.type);
    }
    console.log(startup.name);
    console.log(startup.description);
    console.log(startup.country);
    console.log(startup.address);
    console.log(startup.email);

    startup.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};
exports.remove = (req, res) => {
  let startup = req.startup;
  startup.remove((err, deletedStartup) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Startup deleted Seccussfuly !",
    });
  });
};
exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    const {
      name,
      description,
      email,
      category,
      country,
      address,
      year_founded,
      employee_range,
      total_fundings,
    } = fields;
    if (
      !name ||
      !description ||
      !email ||
      !category ||
      !country ||
      !address ||
      !year_founded ||
      !employee_range ||
      !total_fundings
    ) {
      return res.status(400).json({
        error: "All fields are required !",
      });
    }
    let startup = req.startup;
    startup = _.extend(startup, fields);

    if (files.photo) {
      console.log("this is the path " + files.photo.filepath);

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image Should be less than 1mb size",
        });
      }
      startup.photo.data = fs.readFileSync(String(files.photo.filepath));
      startup.photo.contentType = files.photo.type;
    }
    startup.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "couldn't update startup",
        });
      }
      res.json(result);
    });
  });
};

/**
 * sell /arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent , then all products are returned
 */
exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.params.limit ? parseInt(req.params.limit) : 10;

  Startup.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, startups) => {
      if (err) {
        return res.status(400).json({
          error: "Startup Not Found",
        });
      }
      res.json(startups);
    });
};

exports.listLimit = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.params.limit ? parseInt(req.params.limit) : 10;

  Startup.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, startups) => {
      if (err) {
        return res.status(400).json({
          error: "Startup Not Found",
        });
      }
      res.json(startups);
    });
};
/**
 * it will find the products based on the req products category
 * other products that has the same category , will be returned
 */
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  Startup.find({ _id: { $ne: req.startup }, category: req.startup.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, startups) => {
      if (err) {
        return res.status(400).json({
          error: "Startup Not Found",
        });
      }
      res.json(startups);
    });
};
exports.listCategories = (req, res) => {
  Startup.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Startup not found",
      });
    }
    res.json(categories);
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

// route - make sure its post

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? req.body.limit : 50;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  console.log(order, sortBy, limit, skip, req.body.filters);
  console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    console.log("the key is " + key);
    if (req.body.filters[key].length > 0) {
      findArgs[key] = req.body.filters[key];
    }
  }

  Startup.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Startups not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

exports.photo = (req, res) => {
  if (req.startup.photo.data) {
    res.set("content-Type", req.startup.photo.contentType);
    return res.send(req.startup.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    // assigne category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }

    Startup.find(query)
      .select("-photo")
      .exec((err, startups) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(startups);
      });
  }
};

exports.listSearchToManage = (req, res) => {
  // create query object to hold search value and category value
  let limit = req.body.limit ? parseInt(req.body.limit) : 25;
  const query = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    // assigne category value to query.categoryI

    Startup.find(query)
      .select("-photo")
      .limit(limit)
      .exec((err, startups) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json(startups);
      });
  }
};

exports.FirstCrawl = async (req, res) => {
  console.log("uii");
  console.log("hello");
  console.log("et uii");
  console.log("et uii 2");

  console.log("et uii 3");

  console.log("et uii 3");

  const result = await needle(
    "post",
    `https://www.disruptunisia.com/ajax/annuaire_ajax_map.php`,

    options
  );
  console.log("entre");
  console.log("entre");

  const Crawled = JSON.parse(result.body);
  //  console.log(result.body)
  const listStartup = [];
  Crawled.map((c, e) => {
    const firstClean = c.img_str.replace(/"/gi, "");
    const secondClean = firstClean.replace(/\\/g, "");
    let StartupCrawl = {
      name: c.nom.replace(/"/gi, ""),
      logo: "https://www.disruptunisia.com/" + secondClean,
      address: c.adresse ? c.adresse.replace(/"/gi, "") : "",
      lat: c.lat,
      lng: c.lng,
      email: "contact@" + c.nom.replace(/"/gi, "") + ".tn",
      country: "Tunisia",
    };

    console.log("hedhi ui");
    console.log(StartupCrawl);
    listStartup.push(StartupCrawl);
  });

  // await startup.insertMany(listStartup);

  await sleep(5000);

  await sleep(5000);
  console.log("done");
};

async function sleep(miliseconds) {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

exports.SecondCrawl = async (req, res) => {
  const listStartup = [];

  for (let offset = 1; offset < 6; offset = offset + 1) {
    console.log("et uii 3");

    const result = await needle(
      "POST",
      `https://api.startuplist.africa/v2/location/morocco?page=${offset}`,

      options
    );
    console.log("====================================");
    console.log("result ====>", result);
    console.log("====================================");
    const Crawled = result.body;

    Crawled.map((c, e) => {
      let StartupCrawl = {
        name: c.name,
        description: c.tagline,
        logo: c.logo,
        country: c.country,
        city: c.city,
        year_founded: c.year_founded,
        employee_range: c.employee_range,
        total_fundings: c.total_fundings,
      };

      listStartup.push(StartupCrawl);
    });

    await sleep(5000);

    await sleep(5000);
    console.log("done");
  }
  startup.insertMany(listStartup);
};

exports.updateLocation = (req, res) => {
  const startupid = req.params.startupId;
  console.log(startupid);
  let update = { lat: req.body.lat, lng: req.body.lng };
  Startup.findOneAndUpdate(
    { _id: startupid },
    { $set: update },
    { new: true },
    (err, startup) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authoraized to perform this action !",
        });
      }

      res.json(startup);
    }
  );
};
