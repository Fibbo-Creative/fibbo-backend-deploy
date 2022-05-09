import {
  registerChangePriceEvent,
  registerListingEvent,
  registerMintEvent,
  registerTransferEvent,
  registerUnlistItem,
} from "./utils.js";

import { uploadToCDN } from "../utils/sanity.js";
import { removeFiles } from "../utils/multer.js";
import { getCollectionInfo, updateTotalNfts } from "../utils/collections.js";
import Nft from "../models/nft.js";
import {
  changeNftOwner,
  filterItemsByTitle,
  getAllNfts,
  getNftInfo,
  getNftInfoById,
  getNftsByAddress,
} from "../utils/nfts.js";
import NftForSale from "../models/nftForSale.js";
import {
  changePrice,
  deleteNftForSale,
  getAllNftsForSale,
  getNftForSaleById,
} from "../utils/nftsForSale.js";
import { getEventsFromNft } from "../utils/events.js";
import {
  filterProfilesByUsername,
  getProfileInfo,
  updateProfileBanner,
  updateProfileImg,
  updateUsername,
} from "../utils/profiles.js";
import Profile from "../models/profile.js";
import { ethers } from "ethers";
import { marketAddress, nftColectionAddress } from "../contracts/address.js";
import { marketAbi, nftColectionAbi } from "../contracts/abi.js";

const ADDRES_REGISTRY = "";
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.testnet.fantom.network/"
);

const wallet = new ethers.Wallet(
  "3821d437efcd3bca28893b25eff8424fa2966589300b0d77b9adfa2153de41bf",
  provider
);

const MARKET_CONTRACT = new ethers.Contract(marketAddress, marketAbi, wallet);
const COLLECTION_CONTRACT = new ethers.Contract(
  nftColectionAddress,
  nftColectionAbi,
  provider
);

export default (app, upload, imgsDir, sanity_client) => {
  //POST NFT ENDPOINTS
  app.post("/newNftItem", async (req, res) => {
    const {
      collection,
      name,
      description,
      creator,
      tokenId,
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
        tokenId: parseInt(tokenId),
        royalty: parseFloat(royalty),
        image: sanityImgUrl,
        collectionAddress: collection,
      });

      const tx = await MARKET_CONTRACT.registerRoyalty(
        creator,
        nftColectionAddress,
        parseInt(tokenId),
        parseFloat(royalty) * 100
      );

      tx.wait(1);

      await updateTotalNfts(collection, collectionInfo.numberOfItems);

      if (newCollection) {
        res.status(200).send(newCollection);

        await registerMintEvent(collection, tokenId, creator);
      }
    } else {
      res.send("No collection Found");
    }
  });

  app.post("/putForSale", async (req, res) => {
    const { collectionAddress, tokenId, owner, price } = req.body;
    if (!tokenId || !owner || !price) {
      res.status(204).send("No params supplied");
    }

    const nft = await getNftInfo(owner, tokenId, collectionAddress);

    if (nft) {
      const doc = {
        name: nft.name,
        image: nft.image,
        tokenId: tokenId,
        collectionAddress: collectionAddress,
        price: price,
        owner: owner,
        forSaleAt: new Date().toISOString(),
      };

      const createdDoc = await NftForSale.create(doc);

      await registerListingEvent(collectionAddress, tokenId, owner, price);
      res.status(200).send(createdDoc);
    }
  });

  app.post("/nftBought", async (req, res) => {
    const { prevOwner, newOwner, boughtFor, tokenId, collectionAddress } =
      req.body;
    if (
      !prevOwner ||
      !newOwner ||
      !boughtFor ||
      !tokenId ||
      !collectionAddress
    ) {
      res.status(204).send("No params supplied");
    }

    try {
      //Update NFT new Owner...
      const updatedOwner = await changeNftOwner(
        collectionAddress,
        tokenId,
        prevOwner,
        newOwner
      );

      if (updatedOwner) {
        const deletedNftForSale = await deleteNftForSale(
          collectionAddress,
          tokenId
        );

        const eventCreated = await registerTransferEvent(
          collectionAddress,
          tokenId,
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

  app.post("/changePrice", async (req, res) => {
    const { collectionAddress, newPrice, owner, tokenId } = req.body;

    const updatedListing = await changePrice(
      collectionAddress,
      tokenId,
      owner,
      newPrice
    );

    const eventRegistered = await registerChangePriceEvent(
      collectionAddress,
      tokenId,
      owner,
      newPrice
    );

    if (updatedListing) {
      res.status(200).send("Item updated succesfully");
    } else {
      res.status(204).send("Error updating item");
    }
  });

  app.post("/unlistItem", async (req, res) => {
    const { collectionAddress, owner, tokenId } = req.body;

    const deletedItem = await deleteNftForSale(collectionAddress, tokenId);

    const registeredEvent = await registerUnlistItem(
      collectionAddress,
      tokenId,
      owner
    );
    if (deletedItem) {
      res.status(200).send("Item deleted succesfully");
    } else {
      res.status(204).send("Error deleting item");
    }
  });

  //GET NFT ENDPOINTS

  app.get("/getAllNfts", async (req, res) => {
    console.log("Fetching collections");

    const allNfts = await getAllNfts();
    const allNftsForSale = await getAllNftsForSale();

    let tokenIds = [];
    let finalList = [];
    console.log(allNftsForSale);
    allNftsForSale.forEach((_nftForSaleItem) => {
      if (!tokenIds.includes(_nftForSaleItem.tokenId)) {
        tokenIds.push(_nftForSaleItem.tokenId);
        finalList.push(_nftForSaleItem);
      }
    });

    allNfts.forEach((_nftItem) => {
      if (!tokenIds.includes(_nftItem.tokenId)) {
        tokenIds.push(_nftItem.tokenId);
        finalList.push(_nftItem);
      }
    });
    console.log(tokenIds);
    res.status(200).send(finalList);
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
    console.log(nft);
    if (nft) {
      const nftForSale = await getNftForSaleById(collection, nftId);

      let nftResult = nft;
      if (nftForSale) {
        nftResult = {
          ...nft,
          forSale: true,
          price: nftForSale.price,
          forSaleAt: nftForSale.forSaleAt,
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

  app.get("/searchItems", async (req, res) => {
    const { query } = req.query;

    //Buscaremos primero en los títulos de los items

    const filteredItems = await filterItemsByTitle(query);
    const filteredProfiles = await filterProfilesByUsername(query);
    res.send({
      items: filteredItems,
      profiles: filteredProfiles,
    });
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
