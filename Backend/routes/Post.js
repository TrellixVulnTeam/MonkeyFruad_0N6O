const express = require("express"),
  passport = require("passport");

router = express.Router();
const { firestore } = require("../models/index");
const admin = require("firebase-admin");
const moment = require("moment");
const { v4: uuidv4, NIL } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const path = require("path");
const e = require("express");
const { text } = require("body-parser");
const { search, image } = require("../utils/cloudinary");

let storage = multer.diskStorage({
  // destination: (req,file,cb) =>{
  //   cb(null, path.join(__dirname, '../../Frontend/public/uploads'))

  // },
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname +
        "-" +
        Date.now() +
        "-" +
        path.extname(file.originalname)
    );
  },
});

let fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    return cb(new Error("** ต้องเป็นไฟล์ png หรือ jpeg เท่านั้น **"));
  }
};

let upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
});

const uploadFile = (req, res, next) => {
  const upload2 = upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "eiei", maxCount: 20 },
  ]);
  upload2(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ msg: "** ไฟล์รูปรวมกันต้องมีขนาดไม่เกิน 1 MB **" });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

const uploadphotocomment = (req, res, next) => {
  const upload2 = upload.fields([{ name: "photocomment", maxCount: 20 }]);
  upload2(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ msg: "** ไฟล์รูปรวมกันต้องมีขนาดไม่เกิน 1 MB **" });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};
const uploadfilereports = (req, res, next) => {
  const upload2 = upload.fields([{ name: "filereports", maxCount: 20 }]);
  upload2(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ msg: "** ไฟล์รูปรวมกันต้องมีขนาดไม่เกิน 1 MB **" });
    } else if (err) {
      return res.status(400).json({ msg: err.message });
    }
    next();
  });
};

// router.get("/", function (req, res) {
//   res.json({ success: true });
// });

router.post("/create", uploadFile, async (req, res) => {
  try {
    let file = req.files.photo;
    let files = req.files.eiei;
    const {
      name,
      surname,
      id,
      accountnumber,
      nameproduct,
      productcategory,
      money,
      bank,
      social,
      other,
      useruid,
      username,
      photoprofilepublic_id,
      photoprofileurl,
      datetime,
    } = req.body;

    const uid = uuidv4();
    const newmoney = Number(money);
    let photoURL = { public_id: photoprofilepublic_id, url: photoprofileurl };
    let date = new Date();
    let datetimes = new Date(datetime);

    if (!files) {
      return res
        .status(400)
        .json({ msg: "** กรุณาแนบหลักฐานการโอนเงินและหลักฐานการโดนโกง **" });
    } else if (file && files) {
      //single photo
      const resultfile = await cloudinary.uploader.upload(file[0].path);
      let { url, public_id } = resultfile;
      let singlephoto = { url, public_id };
      //multi photo
      let item = [];
      for (const file of files) {
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        item.push({ url, public_id });
      }
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          resultfile: singlephoto,
          item,
          username,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          resultfile: singlephoto,
          item,
          username,
          photoURL,
        });
      }
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");

      getpost.get().then((doc) => {
        let items = [];
        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
    } else if (file) {
      const resultfile = await cloudinary.uploader.upload(file[0].path);
      let { url, public_id } = resultfile;
      let singlephoto = { url, public_id };
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          resultfile: singlephoto,
          username,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          resultfile: singlephoto,
          username,
          photoURL,
        });
      }
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");

      getpost.get().then((doc) => {
        let items = [];

        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
    } else if (files) {
      //multi photo
      let item = [];
      for (const file of files) {
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        item.push({ url, public_id });
      }
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          item,
          username,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          item,
          username,
          photoURL,
        });
      }
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");
      getpost.get().then((doc) => {
        let items = [];
        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
    } else if (!file && !files) {
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          username,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const create = await firestore.collection("Post").doc(uid).set({
          name,
          surname,
          id,
          accountnumber,
          nameproduct,
          productcategory,
          money: newmoney,
          bank,
          datetimes,
          social,
          other,
          uid,
          useruid,
          date,
          username,
          photoURL,
        });
      }
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");

      getpost.get().then((doc) => {
        let items = [];

        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
    }
    return res.json({ success: "สร้างโพสสำเร็จ" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
});
router.post("/edit/:uid", uploadFile, async (req, res) => {
  try {
    let file = req.files.photo;
    let files = req.files.eiei;
    let uid = req.params.uid;

    console.log(files);

    // const date = moment().format('MM/DD/YYYY, h:mm:ss a')
    const {
      name,
      surname,
      id,
      accountnumber,
      nameproduct,
      productcategory,
      money,
      bank,
      social,
      other,
      oldaccountnumber,
    } = req.body;
    var { datetime } = req.body;

    const newmoney = Number(money);
    let date = new Date();
    let datetimes = new Date(datetime);

    if (file && files) {
      //single photo
      const resultfile = await cloudinary.uploader.upload(file[0].path);
      let { url, public_id } = resultfile;
      let singlephoto = { url, public_id };
      //multi photo
      let item = [];
      for (const file of files) {
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        item.push({ url, public_id });
      }

      const update = await firestore.collection("Post").doc(uid).update({
        name,
        surname,
        id,
        accountnumber,
        nameproduct,
        productcategory,
        money: newmoney,
        bank,
        datetimes,
        social,
        other,
        date,
        resultfile: singlephoto,
        item,
      });
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");
      getpost.get().then((doc) => {
        let items = [];
        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
      const getoldpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", oldaccountnumber)
        .orderBy("datetimes", "desc");
      getoldpost
        .get()
        .then((doc) => {
          let items = [];
          doc.forEach((doc2) => {
            items.push(doc2.data());
          });
          let sum = 0;
          let count = 0;
          items.forEach((res) => {
            sum += res.money;
            count++;
          });
          const wanteedon = items[0].datetimes;
          const Thief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .set({
              name,
              surname,
              accountnumber: oldaccountnumber,
              summoney: sum,
              bank,
              wanteedon,
              count,
            });
          for (let i = 0; i < items.length; i++) {
            firestore
              .collection("Post")
              .doc(items[i].uid)
              .update({ count, summoney: sum });
          }
        })
        .catch(() => {
          const deleteThief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .delete();
        });
    } else if (file) {
      const resultfile = await cloudinary.uploader.upload(file[0].path);
      let { url, public_id } = resultfile;
      let singlephoto = { url, public_id };
      const update = await firestore.collection("Post").doc(uid).update({
        name,
        surname,
        id,
        accountnumber,
        nameproduct,
        productcategory,
        money: newmoney,
        bank,
        datetimes,
        social,
        other,
        date,
        resultfile: singlephoto,
      });
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");

      getpost.get().then((doc) => {
        let items = [];

        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
      const getoldpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", oldaccountnumber)
        .orderBy("datetimes", "desc");
      getoldpost
        .get()
        .then((doc) => {
          let items = [];
          doc.forEach((doc2) => {
            items.push(doc2.data());
          });
          let sum = 0;
          let count = 0;
          items.forEach((res) => {
            sum += res.money;
            count++;
          });
          const wanteedon = items[0].datetimes;
          const Thief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .set({
              name,
              surname,
              accountnumber: oldaccountnumber,
              summoney: sum,
              bank,
              wanteedon,
              count,
            });
          for (let i = 0; i < items.length; i++) {
            firestore
              .collection("Post")
              .doc(items[i].uid)
              .update({ count, summoney: sum });
          }
        })
        .catch(() => {
          const deleteThief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .delete();
        });
    } else if (files) {
      //multi photo
      let item = [];
      for (const file of files) {
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        item.push({ url, public_id });
      }
      console.log(item);
      const update = await firestore.collection("Post").doc(uid).update({
        name,
        surname,
        id,
        accountnumber,
        nameproduct,
        productcategory,
        money: newmoney,
        bank,
        datetimes,
        social,
        other,
        date,
        item,
      });
      const getpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");

      getpost.get().then((doc) => {
        let items = [];

        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
      const getoldpost = await firestore
        .collection("Post")
        .where("accountnumber", "==", oldaccountnumber)
        .orderBy("datetimes", "desc");
      getoldpost
        .get()
        .then((doc) => {
          let items = [];
          doc.forEach((doc2) => {
            items.push(doc2.data());
          });
          let sum = 0;
          let count = 0;
          items.forEach((res) => {
            sum += res.money;
            count++;
          });
          const wanteedon = items[0].datetimes;
          const Thief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .set({
              name,
              surname,
              accountnumber: oldaccountnumber,
              summoney: sum,
              bank,
              wanteedon,
              count,
            });
          for (let i = 0; i < items.length; i++) {
            firestore
              .collection("Post")
              .doc(items[i].uid)
              .update({ count, summoney: sum });
          }
        })
        .catch(() => {
          const deleteThief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .delete();
        });
    } else if (!file && !files) {
      await firestore.collection("Post").doc(uid).update({
        name,
        surname,
        id,
        accountnumber,
        nameproduct,
        productcategory,
        money: newmoney,
        bank,
        social,
        other,
        date,
        datetimes,
      });
      const getpost = firestore
        .collection("Post")
        .where("accountnumber", "==", accountnumber)
        .orderBy("datetimes", "desc");
      getpost.get().then((doc) => {
        let items = [];

        doc.forEach((doc2) => {
          items.push(doc2.data());
        });
        let sum = 0;
        let count = 0;
        items.forEach((res) => {
          sum += res.money;
          count++;
        });
        const wanteedon = items[0].datetimes;
        const Thief = firestore.collection("Thief").doc(accountnumber).set({
          name,
          surname,
          accountnumber,
          summoney: sum,
          bank,
          wanteedon,
          count,
        });
        for (let i = 0; i < items.length; i++) {
          firestore
            .collection("Post")
            .doc(items[i].uid)
            .update({ count, summoney: sum });
        }
      });
      const getoldpost = firestore
        .collection("Post")
        .where("accountnumber", "==", oldaccountnumber)
        .orderBy("datetimes", "desc");
      getoldpost
        .get()
        .then((doc) => {
          let items = [];
          doc.forEach((doc2) => {
            items.push(doc2.data());
          });
          let sum = 0;
          let count = 0;
          items.forEach((res) => {
            sum += res.money;
            count++;
          });
          const wanteedon = items[0].datetimes;
          const Thief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .set({
              name,
              surname,
              accountnumber: oldaccountnumber,
              summoney: sum,
              bank,
              wanteedon,
              count,
            });
          for (let i = 0; i < items.length; i++) {
            firestore
              .collection("Post")
              .doc(items[i].uid)
              .update({ count, summoney: sum });
          }
        })
        .catch(() => {
          const deleteThief = firestore
            .collection("Thief")
            .doc(oldaccountnumber)
            .delete();
        });
    }
    return res.json({
      success: "แก้ไขสำเร็จ",
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/edit/:uid", async (req, res) => {
  let uid = req.params.uid;
  try {
    var item = [];
    let Datetime = null;
    const showdata = await firestore
      .collection("Post")
      .where("uid", "==", uid)
      .get();
    showdata.forEach((doc) => {
      item.push(doc.data());
      Datetime = moment(new Date(doc.get("datetimes").seconds * 1000)).format(
        "YYYY-MM-DDTHH:mm"
      );
      console.log(typeof Datetime);
    });
    return res.json({
      item: item,
      datetime: Datetime,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/delete/:uid", async (req, res) => {
  try {
    let { item, resultfile } = req.body;
    console.log(item);
    var postid = [];
    let getid = req.params.uid;
    if (item) {
      item.forEach((doc) => {
        cloudinary.uploader.destroy(doc.public_id, function (result) {
          console.log(result);
        });
      });
    }
    if (resultfile) {
      cloudinary.uploader.destroy(resultfile.public_id, function (result) {
        console.log(result);
      });
    }

    const getpost = await firestore
      .collection("Post")
      .where("uid", "==", getid)
      .get();
    getpost.forEach(async (docgetpost) => {
      const getPostsameaccountnumber = await firestore
        .collection("Post")
        .where("accountnumber", "==", docgetpost.get("accountnumber"))
        .get();
      getPostsameaccountnumber.forEach(async (doc) => {
        await postid.push(doc.data());
      });
      postid.forEach(async (doc) => {
        await firestore
          .collection("Post")
          .doc(doc.uid)
          .update({
            summoney: doc.summoney - docgetpost.get("money"),
            count: doc.count - 1,
          });
      });
      const getThief = await firestore
        .collection("Thief")
        .where("accountnumber", "==", docgetpost.get("accountnumber"))
        .get();
      getThief.forEach(async (doc) => {
        const updateThief = await firestore
          .collection("Thief")
          .doc(doc.get("accountnumber"))
          .update({
            summoney: doc.get("summoney") - docgetpost.get("money"),
            count: doc.get("count") - 1,
          });
      });
      const getThiefAfterUpdate = await firestore
        .collection("Thief")
        .where("accountnumber", "==", docgetpost.get("accountnumber"))
        .get();
      getThiefAfterUpdate.forEach(async (doc) => {
        if (doc.get("count") == 0) {
          firestore.collection("Thief").doc(doc.get("accountnumber")).delete();
        }
      });
    });

    const deletecomment = await firestore
      .collection("Comment")
      .where("postid", "==", getid);
    deletecomment.get().then((dokky) => {
      dokky.forEach(async (doc) => {
        await firestore
          .collection("Comment")
          .doc(doc.get("commentid"))
          .delete();
      });
    });
    const deleteReport = await firestore
      .collection("Report")
      .where("postid", "==", getid);
    deleteReport.get().then((element) => {
      element.forEach(async (doc) => {
        await firestore.collection("Report").doc(doc.get("uid")).delete();
      });
    });
    firestore.collection("Post").doc(getid).delete();

    return res.json({ success: "Delete" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/mypost/:uid", async (req, res) => {
  try {
    let getid = req.params.uid;

    const postdelete = await firestore
      .collection("Post")
      .where("uid", "==", getid)
      .get();

    postdelete.forEach((doc) => {
      let item = [];
      item.push(doc.data());
      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.post("/postapi", async (req, res) => {
  try {
    const { result } = req.body;
    const userRef = await firestore
      .collection("Post")
      .where("useruid", "==", result.uid)
      .orderBy("date", "desc");
    userRef.get().then((doc) => {
      let item = [];
      doc.forEach((doc2) => {
        item.push(doc2.data());
      });
      res.json({
        item,
      });
    });
  } catch {
    (err) => {
      console.log(err);
    };
  }
});

router.get("/post", async (req, res) => {
  try {
    const showdata = await firestore.collection("Post").orderBy("date", "desc");
    showdata.get().then((ok) => {
      let item = [];
      ok.forEach((doc) => {
        item.push(doc.data());
      });
      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.get("/postforfindthief", async (req, res) => {
  try {
    console.log("ok");
    var item = [];
    const showdata = await firestore.collection("Post").orderBy("date", "desc");
    showdata.get().then((ok) => {
      ok.forEach((doc, num) => {
        if (doc) item.push(doc.data());
      });
      console.log(item);
      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.get("/post/sortmoney", async (req, res) => {
  try {
    console.log("ok");
    const showdata = await firestore
      .collection("Post")
      .orderBy("money", "desc");
    showdata.get().then((ok) => {
      let item = [];
      ok.forEach((doc) => {
        item.push(doc.data());
      });
      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.get("/orderbyfacebook", async (req, res) => {
  try {
    const showdata = await firestore
      .collection("Post")
      .where("social", "==", "Facebook")
      .orderBy("date", "desc")
      .limit(4);
    showdata.get().then((element) => {
      let data = [];
      element.forEach((doc) => {
        data.push(doc.data());
      });
      return res.json({
        data: data,
      });
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/orderbyinstragram", async (req, res) => {
  try {
    var data = [];
    const showdata = await firestore
      .collection("Post")
      .where("social", "==", "Instagram")
      .orderBy("date", "desc")
      .limit(4)
      .get()
      .then((element) => {
        element.forEach((doc) => {
          data.push(doc.data());
        });
        console.log(data);
      });
    return res.json({
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/orderbyline", async (req, res) => {
  try {
    var data = [];
    const showdata = await firestore
      .collection("Post")
      .where("social", "==", "Line")
      .orderBy("date", "desc")
      .limit(4)
      .get()
      .then((element) => {
        element.forEach((doc) => {
          data.push(doc.data());
        });
      });
    return res.json({
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/orderbytwitter", async (req, res) => {
  try {
    const showdata = await firestore
      .collection("Post")
      .where("social", "==", "Twitter")
      .orderBy("date", "desc")
      .limit(4);
    showdata.get().then((element) => {
      let data = [];
      element.forEach((doc) => {
        data.push(doc.data());
      });
      return res.json({
        data: data,
      });
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/orderbywebsite", async (req, res) => {
  try {
    const showdata = await firestore
      .collection("Post")
      .where("social", "==", "other")
      .orderBy("date", "desc")
      .limit(4);
    showdata.get().then((element) => {
      let data = [];
      element.forEach((doc) => {
        data.push(doc.data());
      });
      return res.json({
        data: data,
      });
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/comment/:id", uploadphotocomment, async (req, res) => {
  try {
    const files = req.files.photocomment;

    const {
      textcomment,
      username,
      userid,
      photourl,
      photopublic_id,
    } = req.body;

    let photoURL = { url: photourl, public_id: photopublic_id };

    const postid = req.params.id;
    const uuid = uuidv4();
    let datetime = new Date();
    // moment.locale();
    // const datetime = moment().format("LTS");
    if (textcomment === "" && files === undefined) {
      console.log("ok");
      return res.status(404).json({
        msg: "กรุณาใส่ข้อความหรือรูปภาพ",
      });
    }
    if (files) {
      let photocomment = [];
      for (const file of files) {
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        photocomment.push({ url, public_id });
      }
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const savetodb = await firestore.collection("Comment").doc(uuid).set({
          commentid: uuid,
          postid,
          username,
          textcomment,
          datetime,
          userid,
          photocomment,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const savetodb = await firestore.collection("Comment").doc(uuid).set({
          commentid: uuid,
          postid,
          username,
          textcomment,
          datetime,
          userid,
          photoURL,
          photocomment,
        });
      }
    } else {
      if (photoURL.public_id === "undefined" && photoURL.url === "undefined") {
        const savetodb = await firestore.collection("Comment").doc(uuid).set({
          commentid: uuid,
          postid,
          username,
          textcomment,
          datetime,
          userid,
        });
      } else if (
        photoURL.public_id !== "undefined" &&
        photoURL.url !== "undefined"
      ) {
        const savetodb = await firestore.collection("Comment").doc(uuid).set({
          commentid: uuid,
          postid,
          username,
          textcomment,
          datetime,
          userid,
          photoURL,
        });
      }
    }
    return res.json({
      success: "โพสสำเร็จ",
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/commentmore/:id", async (req, res) => {
  try {
    let postid = req.params.id;
    console.log(postid);
    const getcomment = await firestore
      .collection("Comment")
      .where("postid", "==", postid)
      .orderBy("datetime", "desc");

    getcomment.get().then((doc) => {
      let item = [];
      doc.forEach((doc2) => {
        item.push(doc2.data());
      });

      return res.json({
        item,
      });
    });
  } catch (err) {
    return res.status(500).json({
      msg: err,
    });
  }
});

router.post("/delete/comment/:uid", async (req, res) => {
  try {
    let { photocomment } = req.body;

    let getid = req.params.uid;
    if (photocomment) {
      photocomment.forEach((doc) => {
        cloudinary.uploader.destroy(doc.public_id, function (result) {
          console.log(result);
        });
      });
    }
    const postdelete = await firestore
      .collection("Comment")
      .doc(getid)
      .delete();
    return res.json({ success: "Delete" });
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
});

router.post("/edit/comment/:id", uploadphotocomment, async (req, res) => {
  try {
    let files = req.files.photocomment;
    let id = req.params.id;
    let { edittextcomment, photocomment } = req.body;
    console.log(files);

    if (edittextcomment === "" && files === undefined) {
      console.log("ff");
      const commentdelete = await firestore
        .collection("Comment")
        .doc(id)
        .delete();
      return res.json({ success: "Delete" });
    } else if (files === undefined) {
      console.log("nahee");
      const commentedit = await firestore
        .collection("Comment")
        .doc(id)
        .update({ textcomment: edittextcomment, photocomment: "" });
      return res.json({ success: "Delete" });
    }
    if (files) {
      console.log("hee");
      let item = [];
      for (const file of files) {
        // console.log(files);
        const { path } = file;
        const resultfiles = await cloudinary.uploader.upload(path);
        let { url, public_id } = resultfiles;
        item.push({ url, public_id });
      }
      console.log(item);
      const commentedit = await firestore
        .collection("Comment")
        .doc(id)
        .update({ textcomment: edittextcomment, photocomment: item });
      return res.json({ success: "Edit" });
    } else {
      console.log("kuay");
      const commentedit = await firestore
        .collection("Comment")
        .doc(id)
        .update({ textcomment: edittextcomment });
      return res.json({ success: "Edit" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
});

router.post("/report/:postid", uploadfilereports, async (req, res) => {
  try {
    const postid = req.params.postid;
    const {
      description,
      selectOne,
      selectTwo,
      selectThree,
      userreport,
    } = req.body;
    const files = req.files.filereports;
    console.log(
      postid,
      description,
      selectOne,
      selectTwo,
      selectThree,
      userreport,
      files
    );
    const uid = uuidv4();
    moment.locale("th");
    let date = new Date();
    let reportdata = [];
    let fileUploads = [];
    let count = 0;
    for (const file of files) {
      const { path } = file;
      const resultfiles = await cloudinary.uploader.upload(path);
      let { url, public_id } = resultfiles;
      fileUploads.push({ url, public_id });
    }
    await firestore.collection("Report").doc(uid).set({
      postid,
      description,
      selectOne,
      selectTwo,
      selectThree,
      userreport,
      date,
      fileUploads,
      read: false,
      uid,
    });
    const reportcount = await firestore
      .collection("Report")
      .where("postid", "==", postid)
      .orderBy("date", "desc");
    await reportcount.get().then((element) => {
      element.forEach((doc) => {
        reportdata.push(doc.data());
      });
    });
    for (let i = 0; i < reportdata.length; i++) {
      count++;
    }
    await firestore.collection("Report").doc(uid).update({
      count: count,
    });
    reportdata.forEach(async (doc) => {
      await firestore.collection("Report").doc(doc.uid).update({
        count: count,
      });
    });
    return res.json({ msg: "succes" });
  } catch (err) {
    console.log(err);
  }
});
router.get("/report/non_verify", async (req, res) => {
  try {
    const report = [];
    await firestore
      .collection("Report")
      .where("read", "==", false)
      .orderBy("date", "desc")
      .get()
      .then((element) => {
        element.forEach((doc) => {
          report.push(doc.data());
        });
      });
    return res.json({ report });
  } catch (err) {
    console.log(err);
  }
});
router.get("/report/verify", async (req, res) => {
  try {
    const report = [];
    await firestore
      .collection("Report")
      .where("read", "==", true)
      .orderBy("date", "desc")
      .get()
      .then((element) => {
        element.forEach((doc) => {
          report.push(doc.data());
        });
      });
    return res.json({ report });
  } catch (err) {
    console.log(err);
  }
});
router.get("/report/hide", async (req, res) => {
  try {
    const report = [];
    await firestore
      .collection("Report")
      .where("read", "==", "hide")
      .orderBy("date", "desc")
      .get()
      .then((element) => {
        element.forEach((doc) => {
          report.push(doc.data());
        });
      });
    return res.json({ report });
  } catch (err) {
    console.log(err);
  }
});
router.post("/report/changeread/:uid", async (req, res) => {
  try {
    const reportid = req.params.uid;
    console.log(reportid);
    await firestore.collection("Report").doc(reportid).update({ read: true });
    return res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/report/changereadhide/:uid", async (req, res) => {
  try {
    const reportid = req.params.uid;
    console.log(reportid);
    await firestore.collection("Report").doc(reportid).update({ read: "hide" });
    return res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/report/delete/:uid", async (req, res) => {
  try {
    const reportid = req.params.uid;
    console.log(reportid);
    await firestore.collection("Report").doc(reportid).delete();
    return res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/notificationnonread/:postid/:userid", async (req, res) => {
  try {
    const postid = req.params.postid;
    const userid = req.params.userid;
    const userCommentData = null;
    const userPostid = null;
    const notiID = null;
    const uid = uuidv4();
    let date = new Date();
    await firestore
      .collection("User")
      .where("uid", "==", userid)
      .get()
      .then((element) => {
        element.forEach((doc) => {
          userCommentData = {
            userid: doc.get("uid"),
            username: doc.get("username"),
            photoURL: doc.get("photoURl"),
          };
        });
      });
    await firestore
      .collection("Post")
      .where("uid", "==", postid)
      .get()
      .then((element) => {
        element.forEach((doc) => {
          userPostid = doc.get("userid");
        });
      });
    await firestore.collection("Notification").doc(uid).set({
      userComment: userCommentData,
      read: false,
      date,
      postid,
      uid,
      userPostid,
    });
    await firestore
      .collection("Notification")
      .where("userPostid", "==", userPostid)
      .get()
      .then((element) => {
        element.forEach((doc) => {
          notiID.push(doc.get("uid"));
        });
      });
    await firestore
      .collection("User")
      .doc(userPostid)
      .update({ notification: notiID });
    return res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
  }
});
router.post("/notificationnread/:uid", async (req, res) => {
  try {
    const notiID = req.params.uid;
    await firestore
      .collection("Notification")
      .doc(notiID)
      .update({ read: true });
    return res.json({ msg: "success" });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;