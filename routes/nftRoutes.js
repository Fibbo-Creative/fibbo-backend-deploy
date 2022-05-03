import {
  registerListingEvent,
  registerMintEvent,
  registerTransferEvent,
} from "./utils.js";

import { uploadToCDN } from "../utils/sanity.js";
import { removeFiles } from "../utils/multer.js";
import { getCollectionInfo } from "../utils/collections.js";
import Nft from "../models/nft.js";
import {
  changeNftOwner,
  getAllNfts,
  getNftInfo,
  getNftInfoById,
  getNftsByAddress,
} from "../utils/nfts.js";
import NftForSale from "../models/nftForSale.js";
import {
  deleteNftForSale,
  getAllNftsForSale,
  getNftForSaleById,
} from "../utils/nftsForSale.js";
import { getEventsFromNft } from "../utils/events.js";
import {
  getProfileInfo,
  updateProfileBanner,
  updateProfileImg,
  updateUsername,
} from "../utils/profiles.js";
import Profile from "../models/profile.js";

export default (app, upload, imgsDir, sanity_client) => {
  //POST NFT ENDPOINTS
  app.post("/newNftItem", async (req, res) => {
    const {
      collection,
      name,
      description,
      creator,
      itemId,
      royalty,
      sanityImgUrl,
    } = req.body;

    const collectionInfo = await getCollectionInfo(collection);

    console.log(collectionInfo);

    if (collectionInfo) {
      const newCollection = await Nft.create({
        name: name,
        description: description,
        owner: creator,
        creator: creator,
        itemId: parseInt(itemId),
        royalty: parseFloat(royalty),
        image: sanityImgUrl,
        collectionAddress: collection,
      });

      if (newCollection) {
        res.status(200).send(newCollection);

        await registerMintEvent(collection, itemId, creator);
      }
    } else {
      res.send("No collection Found");
    }
  });

  app.post("/putForSale", async (req, res) => {
    const { collectionAddress, itemId, forSaleItemId, owner, price } = req.body;
    if (!itemId || !owner || !price) {
      res.status(204).send("No params supplied");
    }

    const nft = await getNftInfo(owner, itemId, collectionAddress);

    if (nft) {
      const doc = {
        name: nft.name,
        itemId: forSaleItemId,
        image: nft.image,
        tokenId: itemId,
        collectionAddress: collectionAddress,
        price: price,
        forSaleAt: new Date().toISOString().split("T")[0],
      };

      const createdDoc = await NftForSale.create(doc);

      await registerListingEvent(collectionAddress, itemId, owner, price);
      res.status(200).send(createdDoc);
    }
  });

  app.post("/nftBought", async (req, res) => {
    const {
      prevOwner,
      newOwner,
      boughtFor,
      sanityItemId,
      nftItemId,
      nftForSaleItemId,
      collectionAddress,
    } = req.body;
    if (!prevOwner || !newOwner || !boughtFor || !sanityItemId || !nftItemId) {
      res.status(204).send("No params supplied");
    }

    try {
      //Update NFT new Owner...
      const updatedOwner = await changeNftOwner(
        nftItemId,
        collectionAddress,
        prevOwner,
        newOwner
      );

      if (updatedOwner) {
        const deletedNftForSale = await deleteNftForSale(
          collectionAddress,
          nftForSaleItemId
        );

        const eventCreated = await registerTransferEvent(
          collectionAddress,
          nftItemId,
          prevOwner,
          newOwner,
          boughtFor
        );

        res.status(200).send(eventCreated);
      }

      //Create transfer doc
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  });

  //GET NFT ENDPOINTS

  app.get("/getAllNfts", async (req, res) => {
    console.log("Fetching collections");

    const allNfts = await getAllNfts();

    res.status(200).send(allNfts);
  });

  app.get("/getNftsForSale", async (req, res) => {
    const allNftsForSale = await getAllNftsForSale();

    res.status(200).send(allNftsForSale);
  });

  app.get("/getNftInfoById", async (req, res) => {
    const { collection, nftId } = req.query;

    console.log(collection, nftId);

    if (!nftId) {
      res.status(204).send("No identifier supplied");
    }

    const nft = await getNftInfoById(nftId, collection);

    if (nft) {
      const nftForSale = await getNftForSaleById(collection, nftId);
      let nftResult = nft;
      if (nftForSale) {
        nftResult = {
          ...nft,
          forSale: true,
          price: nftForSale.price,
          forSaleAt: nftForSale.forSaleAt,
          forSaleItemId: nftForSale.itemId,
        };
      } else {
        nftResult = {
          ...nft,
          forSale: false,
        };
      }
      res.status(200).send(nftResult);
    } else {
      res.status(205).send("Nft with id not found!");
    }
  });

  app.get("/getNftsByAddress", async (req, res) => {
    const { address } = req.query;

    if (!address) {
      res.status(204).send("No address supplied");
    }

    const nfts = await getNftsByAddress(address);

    res.status(200).send(nfts);
  });

  //UPLOAD IMG ENDPOINTS

  app.post("/uploadTestImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );

    await removeFiles(imgsDir);

    res.send(uploadedImgSanity.url);
  });

  app.post("/uploadProfileImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const { wallet } = req.body;

    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );
    //Add nft transfer/Creation

    const userProfile = await getProfileInfo(wallet);
    if (userProfile) {
      const profileImgUrl = uploadedImgSanity.url;

      await updateProfileImg(wallet, profileImgUrl);

      await removeFiles(imgsDir);

      res.status(200).send(profileImgUrl);
    } else {
    }
  });

  app.post("/uploadBannerImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const { wallet } = req.body;

    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );

    const userProfile = await getProfileInfo(wallet);
    if (userProfile) {
      const bannerImgUrl = uploadedImgSanity.url;

      await updateProfileBanner(wallet, bannerImgUrl);

      await removeFiles(imgsDir);

      res.status(200).send(bannerImgUrl);
    } else {
      res.status(205).send("Profile not found!");
    }
    //Add nft transfer/Creation
  });

  app.post("/makeOffer", async (req, res) => {});

  app.get("/getCollectionData", async (req, res) => {
    const { collection } = req.query;
    const collectionInfo = await getCollectionInfo(collection);
    if (collectionInfo) {
      res.status(200).send(collectionInfo);
    } else {
      res.status(204).send("Collection not found");
    }
  });

  app.get("/getItemHistory", async (req, res) => {
    const { collection, tokenId } = req.query;

    const result = await getEventsFromNft(collection, tokenId);

    res.status(200).send(result);
  });

  //Profile endpoints
  app.post("/newProfile", async (req, res) => {
    const { wallet } = req.body;

    const profileInfo = await getProfileInfo(wallet);
    if (profileInfo) {
      res.status(205).send("profile already created!");
    } else {
      //Create Profile
      const profileDoc = {
        wallet: wallet,
        username: "Fibbo Artist",
        profileImg: `https://avatars.dicebear.com/api/bottts/${wallet}.svg`,
        profileBanner: "",
        following: [],
        followers: [],
      };

      const createdProfile = await Profile.create(profileDoc);
      res.status(200).send(createdProfile);
    }
  });

  app.get("/userProfile", async (req, res) => {
    const { wallet } = req.query;

    const userProfile = await getProfileInfo(wallet);
    if (userProfile) {
      res.status(200).send(userProfile);
    } else {
      res.status(205).send("Profile not found!");
    }
  });

  app.post("/uploadUsername", async (req, res) => {
    const { username, wallet } = req.body;

    const userProfile = await getProfileInfo(wallet);
    if (userProfile) {
      await updateUsername(wallet, username);
      res.status(200).send("Profile Updated");
    } else {
      res.status(205).send("Profile not found!");
    }
  });

  app.post("/followUser", async (req, res) => {
    const { from, to } = req.body;

    const followerQuery = `*[_type == "profile" && wallet=='${from}' ] {_id, wallet, username, profileImg, profileBanner, following, followers}`;

    const followingQuery = `*[_type == "profile" && wallet=='${to}' ] {_id, wallet, username, profileImg, profileBanner, following, followers}`;

    const followerProfile = await sanity_client.fetch(followerQuery);
    const followingProfile = await sanity_client.fetch(followingQuery);

    if (followerProfile.length > 0) {
      //Update Following array
      console.log(followerProfile, followingProfile);
      await sanity_client
        .patch(followerProfile[0]._id)
        .append("following", [to])
        .commit();
    }

    if (followingProfile.length > 0) {
      //Update Followers array
      await sanity_client
        .patch(followingProfile[0]._id)
        .append("followers", [from])
        .commit();
    }

    res.status(200).send("OK");
  });
};
