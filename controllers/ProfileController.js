import { ethers } from "ethers";
import { faucetWallet } from "../contracts/index.js";
import Profile from "../models/profile.js";
import {
  createProfile,
  getAllProfiles,
  getProfileInfo,
  getVerifiedArtists,
  updateFTMSended,
  updateImportWFTM,
  updateProfileBanner,
  updateProfileImg,
  updateUsername,
} from "../utils/profiles.js";
import { uploadToCDN } from "../utils/sanity.js";
import { imgsDir, removeFiles } from "../utils/multer.js";
import sanity_client from "../lib/sanity.js";
import {
  formatHistory,
  getEventsFromWallet,
  orderHistory,
} from "../utils/events.js";
import {
  formatOffers,
  getItemOffers,
  getOffersFromWallet,
} from "../utils/offers.js";
import NftController from "./NftsController.js";
import { getNftInfo, getNftInfoById, getNftsByAddress } from "../utils/nfts.js";

export default class ProfileController {
  constructor() {}
  //GET
  static async getProfileData(req, res) {
    try {
      const { wallet } = req.query;

      const userProfile = await getProfileInfo(wallet);
      if (userProfile) {
        if (!userProfile.ftmSended) {
          const tx = {
            from: faucetWallet.address,
            to: wallet,
            value: ethers.utils.parseEther("5"),
            nonce: faucetWallet.getTransactionCount(),
          };

          await faucetWallet.sendTransaction(tx);
          await updateFTMSended(wallet);
        }
        res.status(200).send(userProfile);
      } else {
        res.status(205).send("No User");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getVerifiedArtists(req, res) {
    try {
      const verified = await getVerifiedArtists();
      res.status(200).send(verified);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getAllProfiles(req, res) {
    try {
      const allProfiles = await getAllProfiles();
      res.status(200).send(allProfiles);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getWalletHistory(req, res) {
    try {
      const { address } = req.query;

      const result = await getEventsFromWallet(address);
      let finalResullt = [];
      await Promise.all(
        result.map(async (item) => {
          const itemInfo = await getNftInfoById(
            item.tokenId,
            item.collectionAddress
          );
          finalResullt = [
            ...finalResullt,
            {
              ...item._doc,
              item: itemInfo,
            },
          ];
        })
      );
      const formattedResult = await formatHistory(finalResullt);
      res.status(200).send(formattedResult.sort(orderHistory));
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async getWalletOffers(req, res) {
    try {
      const { address } = req.query;

      const myOffers = await getOffersFromWallet(address);

      let finalMyOffers = [];
      await Promise.all(
        myOffers.map(async (offer) => {
          const itemInfo = await getNftInfoById(
            offer.tokenId,
            offer.collectionAddress
          );
          finalMyOffers = [
            ...finalMyOffers,
            {
              ...offer._doc,
              item: itemInfo,
            },
          ];
        })
      );

      const formattedMyOffers = await formatOffers(finalMyOffers);

      const myItems = await getNftsByAddress(address);
      let finalOffers = [];

      await Promise.all(
        myItems.map(async (item) => {
          let offers = await getItemOffers(
            item.collectionAddress,
            item.tokenId
          );
          if (offers.length > 0) {
            let formattedOffers = offers.map((offer) => {
              return {
                ...offer._doc,
                item: item,
              };
            });
            finalOffers = [...finalOffers, ...formattedOffers];
          }
        })
      );

      const formattedAllOffer = await formatOffers(finalOffers);

      res.status(200).send({
        myOffers: formattedMyOffers,
        offers: formattedAllOffer,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
  //POST

  static async newProfile(req, res) {
    try {
      const { wallet, hasWFTM } = req.body;

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
          ftmSended: true,
          verified: false,
          importedWFTM: hasWFTM,
        };

        const tx = {
          from: faucetWallet.address,
          to: wallet,
          value: ethers.utils.parseEther("5"),
          nonce: faucetWallet.getTransactionCount(),
        };

        await faucetWallet.sendTransaction(tx);

        //Send FTM to this address

        const createdProfile = await createProfile(profileDoc);
        res.status(200).send(createdProfile);
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async uploadProfileImg(req, res) {
    try {
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
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async uploadBannerImg(req, res) {
    try {
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
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async updateUsername(req, res) {
    try {
      const { username, wallet } = req.body;

      const userProfile = await getProfileInfo(wallet);
      if (userProfile) {
        await updateUsername(wallet, username);
        res.status(200).send("Profile Updated");
      } else {
        res.status(205).send("Profile not found!");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async updateImportWFTM(req, res) {
    try {
      const { wallet } = req.body;

      const userProfile = await getProfileInfo(wallet);
      if (userProfile) {
        await updateImportWFTM(wallet);
        res.status(200).send("Profile Updated");
      } else {
        res.status(205).send("Profile not found!");
      }
    } catch (e) {
      res.status(500).send(e);
    }
  }
}
